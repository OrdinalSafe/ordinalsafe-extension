import {
  POPUP_CLOSED,
  REQUEST_TYPE,
  RESPONSE_TYPE,
  SERVICE_EVENT_REQUEST,
  SERVICE_EVENT_RESPONSE,
} from '~/types';
import { GET_TAB_ID_INNER_EVENT_REQUEST } from '../../types';

window.onerror = (message, error) => {
  console.error('OrdinalSafe failed, message: ', message, 'error: ', error);
};

let currentTabId = null;
let pendingRequests = 0;

chrome.runtime.sendMessage(
  { action: GET_TAB_ID_INNER_EVENT_REQUEST },
  (tabId) => {
    currentTabId = tabId;
    inject();
  }
);

const inject = () => {
  try {
    const node = document.head || document.documentElement;
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.runtime.getURL('inject.bundle.js'));
    script.setAttribute('async', 'false');
    script.id = 'ordinalSafe-extension';
    script.setAttribute('data-extension-id', chrome.runtime.id);
    node.appendChild(script);
    console.info('OrdinalSafe injected');
  } catch (e) {
    console.error('OrdinalSafe injection failed', e);
  }
};

// content script -> background
window.addEventListener(
  SERVICE_EVENT_REQUEST,
  function (event) {
    const exec = () => {
      if (
        !event.detail ||
        !event.detail.type ||
        event.detail.type !== REQUEST_TYPE
      ) {
        return;
      }

      const { payload } = event.detail;

      if (event.detail.extensionId !== chrome.runtime.id) {
        return;
      }

      chrome.runtime.sendMessage(
        {
          payload,
          messageSource: REQUEST_TYPE,
        },
        (res) => {
          if (res && res.isLocked) {
            setTimeout(exec, 500);
            return;
          }

          pendingRequests++;
        }
      );
    };

    exec();
  },
  false
);

// listen from extension background page/popup
chrome.runtime.onMessage.addListener(async (message) => {
  if (!message || !message.type || message.type !== RESPONSE_TYPE) {
    return false;
  }

  if (pendingRequests <= 0 && message.message.type === POPUP_CLOSED) {
    return false;
  }

  if (!currentTabId || currentTabId !== message.message.payload.sender) {
    return false;
  }
  delete message.message.payload.sender;

  window.dispatchEvent(
    new CustomEvent(SERVICE_EVENT_RESPONSE, {
      detail: message,
    })
  );

  pendingRequests--;
  return true;
});
