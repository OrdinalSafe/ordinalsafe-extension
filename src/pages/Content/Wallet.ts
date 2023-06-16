import { CardinalUTXO, OrdinalUTXO, IWallet, ExternalFee } from './types';

import {
  GET_ACCOUNT_REQUEST,
  SIGN_REQUEST,
  MESSAGE_SIGN_REQUEST,
  FORGET_IDENTITY_REQUEST,
  LOGIN_REJECT,
  SIGN_REJECT,
  MESSAGE_SIGN_REJECT,
  GET_BALANCE_REQUEST,
  BALANCE_REJECT,
  GET_INSCRIPTIONS_REQUEST,
  INSCRIPTIONS_REJECT,
  GET_UTXOS_REQUEST,
  UTXOS_REJECT,
  BROADCAST_REQUEST,
  BROADCAST_REJECT,
  INSCRIBE_REQUEST,
  INSCRIBE_REJECT,
  INVALID_PARAMS,
  INVALID_ADDRESS,
  SEND_BITCOIN_REQUEST,
  SEND_BITCOIN_REJECT,
  SEND_INSCRIPTION_REQUEST,
  SEND_INSCRIPTION_REJECT,
} from '../../types';

import { sendAsyncMessageToContentScript } from './messageHandler';
import * as bitcoin from 'bitcoinjs-lib';
import ecc from '@bitcoinerlab/secp256k1';

const packageJson = require('../../../package.json');

bitcoin.initEccLib(ecc);

class Wallet implements IWallet {
  isOrdinalSafe: boolean;
  version: string;

  constructor() {
    this.isOrdinalSafe = true;
    this.version = packageJson.version;
  }

  forgetIdentity(): Promise<string> {
    return new Promise(async (resolve) => {
      await sendAsyncMessageToContentScript({
        type: FORGET_IDENTITY_REQUEST,
      });
      resolve('SIGNOUT_SUCCESS');
    });
  }
  requestAccounts(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sendAsyncMessageToContentScript({
          type: GET_ACCOUNT_REQUEST,
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject(LOGIN_REJECT);
        }
        resolve(res.accounts);
      } catch (err) {
        reject(err);
      }
    });
  }
  signPsbt(psbt: any): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sendAsyncMessageToContentScript({
          type: SIGN_REQUEST,
          payload: {
            psbt,
          },
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject(SIGN_REJECT);
        }
        let { signedPsbt } = res;
        resolve(signedPsbt);
      } catch (err) {
        reject(err);
      }
    });
  }
  inscribe(
    mimeType: string,
    hexData: string,
    externalFees: Array<ExternalFee> | null,
    inscriptionReceiver: string | null = null,
    isTestnet: boolean = false
  ): Promise<{ commit: string; reveal: string }> {
    return new Promise(async (resolve, reject) => {
      if (
        !mimeType || !hexData
      ) {
        return reject(INVALID_PARAMS);
      }
        
      for (const externalFee of externalFees || []) {
        if (!externalFee.fee || !externalFee.receiver) {
          return reject(INVALID_PARAMS);
        }

        if (externalFee.fee <= 0 || !Number.isInteger(externalFee.fee)) {
          return reject(INVALID_PARAMS);
        }

        try {
          bitcoin.address.toOutputScript(
            externalFee.receiver,
            isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
          );
        } catch (err) {
          return reject(INVALID_ADDRESS);
        }
      }

      if (inscriptionReceiver !== null) {
        try {
          bitcoin.address.toOutputScript(
            inscriptionReceiver,
            isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
          );
        } catch (err) {
          return reject(INVALID_ADDRESS);
        }
      }

      try {
        const res = await sendAsyncMessageToContentScript({
          type: INSCRIBE_REQUEST,
          payload: {
            mimeType,
            hexData,
            externalFees: externalFees || [],
            inscriptionReceiver,
          },
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject(INSCRIBE_REJECT);
        }
        let { commit, reveal } = res;
        resolve({ commit, reveal });
      } catch (err) {
        reject(err);
      }
    });
  }
  sendBitcoin(address: string, amountInSats: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sendAsyncMessageToContentScript({
          type: SEND_BITCOIN_REQUEST,
          payload: {
            address,
            amountInSats,
          },
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject(SEND_BITCOIN_REJECT);
        }
        let { txHash } = res;
        resolve(txHash);
      } catch (err) {
        reject(err);
      }
    });
  }
  sendInscription(address: string, inscriptionId: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sendAsyncMessageToContentScript({
          type: SEND_INSCRIPTION_REQUEST,
          payload: {
            address,
            inscriptionId,
          },
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject(SEND_INSCRIPTION_REJECT);
        }
        let { txHash } = res;
        resolve(txHash);
      } catch (err) {
        reject(err);
      }
    });
  }
  broadcastTransaction(txHex: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sendAsyncMessageToContentScript({
          type: BROADCAST_REQUEST,
          payload: {
            txHex,
          },
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject(BROADCAST_REJECT);
        }
        let { txid } = res;
        resolve(txid);
      } catch (err) {
        reject(err);
      }
    });
  }
  signMessage(message: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sendAsyncMessageToContentScript({
          type: MESSAGE_SIGN_REQUEST,
          payload: {
            message,
          },
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject(MESSAGE_SIGN_REJECT);
        }
        let { signedMessage } = res;
        resolve(signedMessage);
      } catch (err) {
        reject(err);
      }
    });
  }
  // verifyMessage(message: string, signature: string): Promise<boolean> {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const res = await sendAsyncMessageToContentScript({
  //         type: '3P_VERIFY_MESSAGE',
  //         payload: {
  //           message,
  //           signature,
  //         },
  //       });
  //       if (res.rejected) {
  //         if (res.message) return reject(res.message);
  //         return reject('SIGN_REJECT');
  //       }
  //       let { verified } = res;
  //       resolve(verified);
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  // }
  getBalance(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sendAsyncMessageToContentScript({
          type: GET_BALANCE_REQUEST,
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject(BALANCE_REJECT);
        }
        resolve(res.balance);
      } catch (err) {
        reject(err);
      }
    });
  }
  getInscriptions(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sendAsyncMessageToContentScript({
          type: GET_INSCRIPTIONS_REQUEST,
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject(INSCRIPTIONS_REJECT);
        }
        resolve(res.inscriptions);
      } catch (err) {
        reject(err);
      }
    });
  }
  getUTXOs(
    type: string = 'all' // all, cardinals, ordinals
  ): Promise<CardinalUTXO[] | OrdinalUTXO[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sendAsyncMessageToContentScript({
          type: GET_UTXOS_REQUEST,
          payload: {
            type,
          },
        });
        if (res.rejected) {
          if (res.message) return reject(res.message);
          return reject(UTXOS_REJECT);
        }
        resolve(res.utxos);
      } catch (err) {
        reject(err);
      }
    });
  }
}

const wallet = new Wallet();

export default wallet;
