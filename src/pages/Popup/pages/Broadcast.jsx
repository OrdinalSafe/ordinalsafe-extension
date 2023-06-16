import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GET_WALLET_SERVICE_STATE } from '~/types';
import CardScreenWrapper from '../components/Wrappers/CardScreenWrapper';
import ActionButtons from '../components/ActionButtons';
import RejectButton from '../components/Buttons/RejectButton';
import GenericButton from '../components/Buttons/GenericButton';
import { event, showToast } from '../utils';
import { postTransaction } from '../../../controllers/AccountController';
import {
  BROADCAST_CONNECT,
  BROADCAST_REJECT_RESPONSE,
  BROADCAST_SUCCESS_RESPONSE,
} from '../../../types';
import { Transaction } from 'bitcoinjs-lib';
import {
  addSpentCardinalUTXOs,
  addSpentOrdinalUTXOs,
} from 'store/features/account';
import { store } from '../store';
import { useConnect } from '../hooks';
import { useNavigate } from 'react-router-dom';
const Broadcast = () => {
  const navigate = useNavigate();
  const [approve, reject] = useConnect(
    BROADCAST_SUCCESS_RESPONSE,
    BROADCAST_REJECT_RESPONSE
  );
  const dispatch = useDispatch();

  const address = useSelector((state) => state.wallet.activeWallet.address);
  const activeWallet = useSelector(
    (state) => state.wallet.activeWallet.address
  );
  const cardinalUTXOs = useSelector(
    (state) => state.account.accounts[address].cardinalUTXOs
  );
  const ordinalUTXOs = useSelector(
    (state) => state.account.accounts[address].ordinalUTXOs
  );
  const network = useSelector((state) => state.settings.network);

  const [txHex, setTxHex] = useState('');
  const [host, setHost] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getState = async () => {
      const { state } = await chrome.runtime.sendMessage({
        action: GET_WALLET_SERVICE_STATE,
      });
      if (state && state.type === 'broadcast' && state.tx) {
        const activeAddress = state.activeSession.account.accounts[0];

        if (activeAddress !== activeWallet) {
          navigate('/switch', {
            state: {
              sessionAddress: activeAddress,
              rejectType: BROADCAST_REJECT_RESPONSE,
            },
          });
          return;
        }
        setTxHex(state.tx);
        setHost(state.host);
        setLoading(false);
      } else {
        console.log(state);
        //window.close();
      }
    };

    getState();
  }, []);

  const handleBroadcast = async () => {
    setLoading(true);

    try {
      event('broadcast', {
        tx: txHex,
        host,
      });

      const { txHash: txid } = await postTransaction(txHex);

      if (txid) {
        const tx = Transaction.fromHex(txHex);
        const userSpentCardinalUTXOs = [];
        const userSpentOrdinalUTXOs = [];

        for (let i = 0; i < tx.ins.length; i++) {
          const input = tx.ins[i];
          const txId = input.hash.reverse().toString('hex');
          const index = input.index;

          if (
            cardinalUTXOs.some(
              (utxo) => utxo.txId === txId && utxo.index === index
            )
          ) {
            userSpentCardinalUTXOs.push({
              txId,
              index,
            });
          }

          if (
            ordinalUTXOs.some(
              (utxo) => utxo.txId === txId && utxo.index === index
            )
          ) {
            userSpentOrdinalUTXOs.push({
              txId,
              index,
            });
          }
        }

        if (userSpentCardinalUTXOs.length > 0) {
          dispatch(addSpentCardinalUTXOs(userSpentCardinalUTXOs));
        }

        if (userSpentOrdinalUTXOs.length > 0) {
          dispatch(addSpentOrdinalUTXOs(userSpentOrdinalUTXOs));
        }
      }

      await approve({
        txid,
      });
    } catch (e) {
      console.log(e);
      showToast('error', 'Failed to broadcast transaction. Please try again.');
    }

    setLoading(false);
  };
  return (
    <>
      <CardScreenWrapper>
        <div className="flex flex-col items-center justify-center">
          <div className="text-2xl font-medium text-gray-700 mb-4">
            Broadcast Transaction
          </div>
          <div className="text-sm text-gray-500 font-500 text-left mr-auto mb-4">
            <p className="mb-2">Transaction Hex</p>
            <textarea
              className="w-72 h-cardScreen bg-customDark rounded-md p-2 resize-none"
              value={txHex}
              readOnly
            />
          </div>
        </div>
      </CardScreenWrapper>
      <br></br>
      <p className="text-gray-500 text-xs font-500 absolute bottom-40">
        Until this transaction is confirmed, your balance may be displayed
        incorrectly.
      </p>
      <ActionButtons className="absolute bottom-10 left-0 right-0">
        <RejectButton w={36} onClick={reject} />
        <GenericButton
          text="Broadcast"
          w={36}
          onClick={handleBroadcast}
          loading={loading}
        />
      </ActionButtons>
    </>
  );
};

export default Broadcast;
