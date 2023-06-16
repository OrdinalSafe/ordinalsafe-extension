/* eslint-disable no-restricted-globals */
import * as lock from 'shared/lock';
import {
  CLOSE_WINDOW,
  FORGET_IDENTITY_REQUEST_RESPONSE,
  FROM_BACK_TO_POPUP,
  GET_ACCOUNT_REQUEST_RESPONSE,
  RESPONSE_TYPE,
  SIGN_REQUEST_RESPONSE,
} from '~/types';
import * as storage from 'controllers/StorageController';
import {
  BROADCAST_REQUEST_RESPONSE,
  GET_BALANCE_REQUEST_RESPONSE,
  GET_INSCRIPTIONS_REQUEST_RESPONSE,
  GET_UTXOS_REQUEST_RESPONSE,
  INSCRIBE_REQUEST_RESPONSE,
  MESSAGE_SIGN_REQUEST_RESPONSE,
  SEND_BITCOIN_REJECT_RESPONSE,
  SEND_BITCOIN_REQUEST_RESPONSE,
  SEND_BITCOIN_SUCCESS_RESPONSE,
  SEND_INSCRIPTION_REJECT_RESPONSE,
  SEND_INSCRIPTION_REQUEST_RESPONSE,
  SEND_INSCRIPTION_SUCCESS_RESPONSE,
} from '../types';
import getStoredState from 'redux-persist/es/getStoredState';
import { persistConfig, authPersistConfig } from '../pages/Popup/store';

export const getFaviconFromUrl = (u) => {
  const url = new URL(chrome.runtime.getURL('/_favicon/'));
  url.searchParams.set('pageUrl', u);
  url.searchParams.set('size', '32');
  return url.toString();
};

export const getHostNameFromTab = (tab) => {
  const url = new URL(tab.url);
  const hostname = url.hostname;

  // fail rather than return an empty response
  if (!hostname) {
    throw new Error('cannot get hostname from tab ' + JSON.stringify(tab));
  }

  return hostname;
};

export const msgToContentScript = (type, payload) => ({
  type: RESPONSE_TYPE,
  message: {
    type,
    payload,
  },
});

class APIService {
  psbt;
  tx;
  bitcoin;
  inscription;
  message;
  content;
  utxoType;
  type;
  sender;
  host;
  favicon;
  activeSession;
  requestedAddresses;

  constructor() {
    this.psbt = null;
    this.tx = null;
    this.bitcoin = null;
    this.inscription = null;
    this.message = null;
    this.content = null;
    this.utxoType = null;
    this.type = null;
    this.sender = null;
    this.host = '';
    this.favicon = '';
    this.activeSession = null;
    this.requestedAddresses = null;
  }

  getState = () => {
    return {
      psbt: this.psbt,
      tx: this.tx,
      bitcoin: this.bitcoin,
      inscription: this.inscription,
      message: this.message,
      content: this.content,
      utxoType: this.utxoType,
      type: this.type,
      sender: this.sender,
      host: this.host,
      favicon: this.favicon,
      activeSession: this.activeSession,
      requestedAddresses: this.requestedAddresses,
    };
  };

  sendMessageToInject = (type, payload) => {
    if (!payload) payload = {};

    payload.sender = this.sender;

    chrome.tabs.sendMessage(this.sender, msgToContentScript(type, payload));
    lock.unlock();
  };

  openPopup = async (route = '') => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    let top = 0;
    let left = 0;
    if (tab) {
      top = tab.height - 690;
      left = tab.width - 400;
    }
    try {
      chrome.windows.create({
        url: chrome.runtime.getURL(`popup.html#/${route}`),
        type: 'popup',
        left: left,
        top: top,
        width: 360,
        height: 630,
      });
    } catch (error) {
      console.log(error);
      chrome.windows.create({
        url: chrome.runtime.getURL(`popup.html#/${route}`),
        type: 'popup',
        width: 360,
        height: 630,
      });
    }
  };

  closeWindow = () => {
    lock.unlock();
    chrome.runtime.sendMessage({
      type: FROM_BACK_TO_POPUP,
      action: CLOSE_WINDOW,
    });
  };

  forgetIdentity = async (sender) => {
    this.sender = sender.tab.id;
    this.host = getHostNameFromTab(sender.tab);
    await this.removeSession(this.host);
    this.sendMessageToInject(FORGET_IDENTITY_REQUEST_RESPONSE);
  };

  removeSession = async (host) => {
    const sessions = await this.getSessions();
    const index = sessions.findIndex((session) => session.host === host);
    if (index !== -1) {
      sessions.splice(index, 1);
      await this.setSessions(sessions);
    }
  };

  getSessions = async () => {
    const current = await storage.getValue('session');
    return current || [];
  };

  getSession = async (host) => {
    const sessions = await this.getSessions();
    const session = sessions.find((session) => session.host === host);
    if (session) {
      return session;
    } else {
      return null;
    }
  };

  setSessions = async (sessions) => {
    await storage.saveValue('session', sessions);
  };

  setHost = (sender) => {
    this.sender = sender.tab.id;
    this.host = getHostNameFromTab(sender.tab);
    this.favicon = getFaviconFromUrl(sender.tab.url);
  };

  getStore = async (isAuth = false) => {
    let store;
    if (isAuth) {
      store = await getStoredState(authPersistConfig);
      if (!store) throw new Error('Store not found');
    } else {
      store = await getStoredState(persistConfig);
      if (!store || !store.wallet.wallets.length)
        throw new Error('Store not found');
    }
    return store;
  };

  isExtensionLocked = async () => {
    const store = await this.getStore(true);
    return store.lock;
  };

  getSessionAddress = async (host) => {
    const session = await this.getSession(host);
    const store = await this.getStore();

    if (session.account?.accounts?.length === 0) {
      return null;
    }

    // check if the account is still in the store
    const account = store.wallet.wallets.find(
      (account) => account.address === session.account.accounts[0]
    );

    if (!account) {
      return null;
    }

    return session.account?.accounts[0];
  };

  getActiveAddress = async () => {
    const store = await this.getStore();
    return store.wallet.activeWallet.address;
  };

  isAddressActive = async (address) => {
    return address === (await this.getActiveAddress());
  };

  processSession = async (host, response, route) => {
    const session = await this.getSession(host);
    if (session) {
      const sessionAddress = await this.getSessionAddress(host);

      if (!sessionAddress) {
        this.sendMessageToInject(response, {
          rejected: true,
          message:
            'The account is found in the session but not in the extension. Please use forgetIdentity first to sign out',
        });

        return;
      }

      // getX: return response directly if the account is already active and unlocked
      if (route === 'get') {
        if (
          (await this.isAddressActive(sessionAddress)) &&
          !(await this.isExtensionLocked())
        ) {
          const store = await this.getStore();

          switch (this.type) {
            case 'getBalance':
              return this.success(response, {
                balance: store.account.accounts[sessionAddress].balance,
              });
            case 'getInscriptions':
              return this.success(response, {
                inscriptions:
                  store.account.accounts[sessionAddress].inscriptionIds,
              });
            case 'getUtxos': {
              switch (this.utxoType) {
                case 'ordinals':
                  return this.success(response, {
                    utxos: store.account.accounts[sessionAddress].ordinalUTXOs,
                  });
                case 'cardinals':
                  return this.success(response, {
                    utxos: store.account.accounts[
                      sessionAddress
                    ].cardinalUTXOs.concat(
                      store.account.accounts[sessionAddress]
                        .unconfirmedCardinalUTXOs
                    ),
                  });
                default:
                  return this.success(response, {
                    utxos: store.account.accounts[
                      sessionAddress
                    ].ordinalUTXOs.concat(
                      store.account.accounts[
                        sessionAddress
                      ].cardinalUTXOs.concat(
                        store.account.accounts[sessionAddress]
                          .unconfirmedCardinalUTXOs
                      )
                    ),
                  });
              }
            }
            default:
              return this.reject(response, 'GET_ERROR');
          }
        }
      }
      this.activeSession = session;
      await this.openPopup(route);
    } else {
      this.sendMessageToInject(response, {
        rejected: true,
        message: 'requestAccount first',
      });
    }
  };

  success = (response, payload) => {
    this.sendMessageToInject(response, payload);
    this.closeWindow();
  };

  reject = (response, message) => {
    this.sendMessageToInject(response, {
      rejected: true,
      message,
    });
    this.closeWindow();
  };

  // Third party endpoints
  getAccount = async (sender) => {
    try {
      this.setHost(sender);

      this.type = 'auth';

      const session = await this.getSession(this.host);
      if (session) {
        const sessionAddress = await this.getSessionAddress(this.host);

        if (!sessionAddress) {
          await this.removeSession(this.host);
        } else {
          const isExtensionLocked = await this.isExtensionLocked();
          const isAddressActive = await this.isAddressActive(sessionAddress);

          if (isAddressActive && !isExtensionLocked) {
            this.sendMessageToInject(GET_ACCOUNT_REQUEST_RESPONSE, {
              accounts: [sessionAddress],
            });
            return;
          }

          this.activeSession = session;
          this.requestedAddresses = [sessionAddress];

          await this.openPopup('auth');
          return;
        }
      }

      await this.openPopup('auth');
    } catch (error) {
      console.log(error);
      this.reject(
        GET_ACCOUNT_REQUEST_RESPONSE,
        error.message || 'GET_ACCOUNT_ERROR'
      );
    }
  };
  onGetAccountSuccess = async (payload) => {
    let sessions = (await this.getSessions()) || [];

    const newSession = {
      host: this.host,
      account: payload,
    };

    // replace session if exists
    const index = sessions.findIndex((session) => session.host === this.host);
    if (index !== -1) {
      sessions[index] = newSession;
    } else {
      sessions.push(newSession);
    }

    await this.setSessions(sessions);

    this.success(GET_ACCOUNT_REQUEST_RESPONSE, payload);
  };
  onGetAccountReject = async ({ message }) => {
    this.reject(GET_ACCOUNT_REQUEST_RESPONSE, message);
  };

  inscribe = async (sender, payload) => {
    try {
      this.setHost(sender);

      this.type = 'inscribe';
      this.content = payload;

      await this.processSession(
        this.host,
        INSCRIBE_REQUEST_RESPONSE,
        'inscribe'
      );
    } catch (err) {
      this.reject(INSCRIBE_REQUEST_RESPONSE, err.message || 'INSCRIBE_ERROR');
    }
  };
  onInscribeSuccess = async (payload) => {
    this.success(INSCRIBE_REQUEST_RESPONSE, payload);
  };
  onInscribeReject = async ({ message }) => {
    this.reject(INSCRIBE_REQUEST_RESPONSE, message);
  };

  signPsbt = async (sender, payload) => {
    try {
      this.setHost(sender);

      this.type = 'psbt';
      this.psbt = payload.psbt;

      await this.processSession(this.host, SIGN_REQUEST_RESPONSE, 'sign/psbt');
    } catch (err) {
      this.reject(SIGN_REQUEST_RESPONSE, err.message || 'SIGN_ERROR');
    }
  };
  onSignPsbtSuccess = async (payload) => {
    this.success(SIGN_REQUEST_RESPONSE, payload);
  };
  onSignPsbtReject = async ({ message }) => {
    this.reject(SIGN_REQUEST_RESPONSE, message);
  };

  sendBitcoin = async (sender, payload) => {
    try {
      this.setHost(sender);

      this.type = 'bitcoin';
      this.bitcoin = payload;

      await this.processSession(
        this.host,
        SEND_BITCOIN_REQUEST_RESPONSE,
        'sign/externalBitcoin'
      );
    } catch (err) {
      this.reject(
        SEND_BITCOIN_REQUEST_RESPONSE,
        err.message || 'SEND_BITCOIN_ERROR'
      );
    }
  };
  onSendBitcoinSuccess = async (payload) => {
    this.success(SEND_BITCOIN_REQUEST_RESPONSE, payload);
  };
  onSendBitcoinReject = async ({ message }) => {
    this.reject(SEND_BITCOIN_REQUEST_RESPONSE, message);
  };

  sendInscription = async (sender, payload) => {
    try {
      this.setHost(sender);

      this.type = 'inscription';
      this.inscription = payload;

      await this.processSession(
        this.host,
        SEND_INSCRIPTION_REQUEST_RESPONSE,
        'sign/externalInscription'
      );
    } catch (err) {
      this.reject(
        SEND_INSCRIPTION_REQUEST_RESPONSE,
        err.message || 'SEND_INSCRIPTION_ERROR'
      );
    }
  };
  onSendInscriptionSuccess = async (payload) => {
    this.success(SEND_INSCRIPTION_REQUEST_RESPONSE, payload);
  };
  onSendInscriptionReject = async ({ message }) => {
    this.reject(SEND_INSCRIPTION_REQUEST_RESPONSE, message);
  };

  signMessage = async (sender, payload) => {
    try {
      this.setHost(sender);

      this.type = 'message';
      this.message = payload.message;

      await this.processSession(
        this.host,
        SIGN_REQUEST_RESPONSE,
        'sign/message'
      );
    } catch (err) {
      this.reject(MESSAGE_SIGN_REQUEST_RESPONSE, err.message || 'SIGN_ERROR');
    }
  };
  onSignMessageSuccess = async (payload) => {
    this.success(MESSAGE_SIGN_REQUEST_RESPONSE, payload);
  };
  onSignMessageReject = async ({ message }) => {
    this.reject(MESSAGE_SIGN_REQUEST_RESPONSE, message);
  };

  broadcast = async (sender, payload) => {
    try {
      this.setHost(sender);

      this.type = 'broadcast';
      this.tx = payload.txHex;

      await this.processSession(
        this.host,
        BROADCAST_REQUEST_RESPONSE,
        'broadcast'
      );
    } catch (err) {
      this.reject(BROADCAST_REQUEST_RESPONSE, err.message || 'BROADCAST_ERROR');
    }
  };
  onBroadcastSuccess = async (payload) => {
    this.success(BROADCAST_REQUEST_RESPONSE, payload);
  };
  onBroadcastReject = async ({ message }) => {
    this.reject(BROADCAST_REQUEST_RESPONSE, message);
  };

  // TODO: Add active wallet check for all getX endpoints.
  getBalance = async (sender) => {
    try {
      this.setHost(sender);

      this.type = 'getBalance';

      await this.processSession(this.host, GET_BALANCE_REQUEST_RESPONSE, 'get');
    } catch (err) {
      this.reject(
        GET_BALANCE_REQUEST_RESPONSE,
        err.message || 'GET_BALANCE_ERROR'
      );
    }
  };
  onGetBalanceSuccess = async (payload) => {
    this.success(GET_BALANCE_REQUEST_RESPONSE, payload);
  };
  onGetBalanceReject = async ({ message }) => {
    this.reject(GET_BALANCE_REQUEST_RESPONSE, message);
  };

  getInscriptions = async (sender) => {
    try {
      this.setHost(sender);

      this.type = 'getInscriptions';

      await this.processSession(
        this.host,
        GET_INSCRIPTIONS_REQUEST_RESPONSE,
        'get'
      );
    } catch (err) {
      this.reject(
        GET_INSCRIPTIONS_REQUEST_RESPONSE,
        err.message || 'GET_INSCRIPTIONS_ERROR'
      );
    }
  };
  onGetInscriptionsSuccess = async (payload) => {
    this.success(GET_INSCRIPTIONS_REQUEST_RESPONSE, payload);
  };
  onGetInscriptionsReject = async ({ message }) => {
    this.reject(GET_INSCRIPTIONS_REQUEST_RESPONSE, message);
  };

  getUtxos = async (sender, payload) => {
    try {
      this.setHost(sender);

      this.type = 'getUtxos';
      this.utxoType = payload.type;

      await this.processSession(this.host, GET_UTXOS_REQUEST_RESPONSE, 'get');
    } catch (err) {
      this.reject(GET_UTXOS_REQUEST_RESPONSE, err.message || 'GET_UTXOS_ERROR');
    }
  };
  onGetUtxosSuccess = async (payload) => {
    this.success(GET_UTXOS_REQUEST_RESPONSE, payload);
  };
  onGetUtxosReject = async ({ message }) => {
    this.reject(GET_UTXOS_REQUEST_RESPONSE, message);
  };
}

const apiService = new APIService();

export default apiService;
