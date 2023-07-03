import React, { useEffect, useState } from 'react';
import { GET_WALLET_SERVICE_STATE } from '~/types';
import { store } from '../store';
import {
  GET_BALANCE_REJECT_RESPONSE,
  GET_BALANCE_SUCCESS_RESPONSE,
  GET_INSCRIPTIONS_REJECT_RESPONSE,
  GET_INSCRIPTIONS_SUCCESS_RESPONSE,
  GET_NETWORK_REJECT_RESPONSE,
  GET_NETWORK_SUCCESS_RESPONSE,
  GET_UTXOS_REJECT_RESPONSE,
  GET_UTXOS_SUCCESS_RESPONSE,
} from '../../../types';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Get = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const walletState = store.getState();
    const getState = async () => {
      const { state } = await chrome.runtime.sendMessage({
        action: GET_WALLET_SERVICE_STATE,
      });
      if (
        state &&
        ['getBalance', 'getInscriptions', 'getUtxos', 'getNetwork'].includes(
          state.type
        )
      ) {
        const activeAddress = walletState.wallet.activeWallet.address;

        const sessionAddress = state.activeSession.account.accounts[0];

        if (sessionAddress !== activeAddress) {
          navigate('/switch', {
            state: {
              sessionAddress: sessionAddress,
              rejectType:
                state.type === 'getBalance'
                  ? GET_BALANCE_REJECT_RESPONSE
                  : state.type === 'getInscriptions'
                  ? GET_INSCRIPTIONS_REJECT_RESPONSE
                  : state.type === 'getNetwork'
                  ? GET_NETWORK_REJECT_RESPONSE
                  : GET_UTXOS_REJECT_RESPONSE,
            },
          });

          return;
        }

        switch (state.type) {
          case 'getNetwork':
            await chrome.runtime.sendMessage({
              action: GET_NETWORK_SUCCESS_RESPONSE,
              payload: {
                network:
                  walletState.settings.network.bech32 === 'tb'
                    ? 'testnet'
                    : 'mainnet',
              },
            });
            break;
          case 'getBalance':
            await chrome.runtime.sendMessage({
              action: GET_BALANCE_SUCCESS_RESPONSE,
              payload: {
                balance: walletState.account.accounts[activeAddress].balance,
              },
            });
            break;
          case 'getInscriptions':
            await chrome.runtime.sendMessage({
              action: GET_INSCRIPTIONS_SUCCESS_RESPONSE,
              payload: {
                inscriptions:
                  walletState.account.accounts[activeAddress].inscriptionIds,
              },
            });
            break;
          case 'getUtxos':
            switch (state.utxoType) {
              case 'ordinals':
                await chrome.runtime.sendMessage({
                  action: GET_UTXOS_SUCCESS_RESPONSE,
                  payload: {
                    utxos:
                      walletState.account.accounts[activeAddress].ordinalUTXOs,
                  },
                });
                break;
              case 'cardinals':
                await chrome.runtime.sendMessage({
                  action: GET_UTXOS_SUCCESS_RESPONSE,
                  payload: {
                    utxos: walletState.account.accounts[
                      activeAddress
                    ].cardinalUTXOs.concat(
                      walletState.account.accounts[activeAddress]
                        .unconfirmedCardinalUTXOs
                    ),
                  },
                });
                break;
              default:
                const utxos = walletState.account.accounts[
                  activeAddress
                ].ordinalUTXOs.concat(
                  walletState.account.accounts[
                    activeAddress
                  ].cardinalUTXOs.concat(
                    walletState.account.accounts[activeAddress]
                      .unconfirmedCardinalUTXOs
                  )
                );
                await chrome.runtime.sendMessage({
                  action: GET_UTXOS_SUCCESS_RESPONSE,
                  payload: {
                    utxos,
                  },
                });
                break;
            }
            break;
          default:
            window.close();
            break;
        }
        setLoading(false);
      } else {
        window.close();
      }
    };

    getState();
  }, []);

  return <Skeleton />;
};

export default Get;
