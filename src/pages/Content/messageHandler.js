import {
  POPUP_CLOSED,
  REQUEST_TYPE,
  RESPONSE_TYPE,
  SERVICE_EVENT_REQUEST,
  SERVICE_EVENT_RESPONSE,
} from '~/types';

const extId = document
  .getElementById('ordinalSafe-extension')
  ?.getAttribute('data-extension-id');

const unWrapMessageFromContentScript = (data) => data.message;
const filterExtensionMessage = (callback) => (message) => {
  if (message === undefined) return;
  const { detail } = message;
  if (!detail) return;
  if (detail.type && detail.type === RESPONSE_TYPE) {
    callback(detail);
  }
};

const waitForResponse = (type) => {
  return new Promise((resolve) => {
    const handler = filterExtensionMessage((data) => {
      const message = unWrapMessageFromContentScript(data);
      if (message.type === type) {
        resolve(message.payload);
      }
      window.removeEventListener(SERVICE_EVENT_RESPONSE, handler);
    });
    window.addEventListener(SERVICE_EVENT_RESPONSE, handler);
  });
};

const sendMessageToContentScript = (payload) => {
  window.dispatchEvent(
    new CustomEvent(SERVICE_EVENT_REQUEST, {
      detail: {
        type: REQUEST_TYPE,
        extensionId: extId,
        payload,
      },
    })
  );
};

export const sendAsyncMessageToContentScript = async (payload) => {
  // wait 250 ms to prevent event collision
  await new Promise((resolve) => setTimeout(resolve, 250));

  sendMessageToContentScript(payload);

  const response = await Promise.race([
    waitForResponse(`${payload.type}_RESPONSE`),
    waitForResponse(POPUP_CLOSED),
  ]);

  return response;
};
