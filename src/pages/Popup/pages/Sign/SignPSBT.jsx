import React, { useEffect, useState } from 'react';
import { GET_WALLET_SERVICE_STATE } from '~/types';
import CardScreenWrapper from '../../components/Wrappers/CardScreenWrapper';
import ActionButtons from '../../components/ActionButtons';
import RejectButton from '../../components/Buttons/RejectButton';
import GenericButton from '../../components/Buttons/GenericButton';
import {
  SIGN_PSBT_CONNECT,
  SIGN_REJECT_RESPONSE,
  SIGN_SUCCESS_RESPONSE,
} from '../../../../types';
import SendSummaryCard from '../../components/SendSummaryCard';
import { fetchPsbtDetails } from '../../../../controllers/AccountController';
import {
  event,
  psbtHexToBase64,
  satoshisToBTC,
  showToast,
  truncateAddress,
} from '../../utils';
import { Psbt } from 'bitcoinjs-lib';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveWallet } from '../../store/features/wallet';
import Skeleton from 'react-loading-skeleton';
import {
  decryptAddress,
  generateTaprootAddress,
  generateTaprootSigner,
  signCustomPSBTFromWallet,
  signPSBTFromWallet,
} from '../../../../controllers/WalletController';
import { useConnect } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import PreviewSwiper from '../../components/PSBT/PreviewSwiper';

const SignPSBT = () => {
  const navigate = useNavigate();

  const [approve, reject] = useConnect(
    SIGN_SUCCESS_RESPONSE,
    SIGN_REJECT_RESPONSE
  );
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [host, setHost] = useState('');
  const [psbt, setPsbt] = useState('');
  const [raw, setRaw] = useState('');
  const [details, setDetails] = useState();

  const activeWallet = useSelector(
    (state) => state.wallet.activeWallet.address
  );
  const encryptedPrivKey = useSelector(
    (state) => state.wallet.activeWallet.encryptedPrivKey
  );
  const encryptedChainCode = useSelector(
    (state) => state.wallet.activeWallet.encryptedChainCode
  );
  const pincode = useSelector((state) => state.auth.pincode);
  const network = useSelector((state) => state.settings.network);

  useEffect(() => {
    const getState = async () => {
      const { state } = await chrome.runtime.sendMessage({
        action: GET_WALLET_SERVICE_STATE,
      });
      if (state && state.type === 'psbt' && state.psbt) {
        const activeAddress = state.activeSession.account.accounts[0];

        if (activeAddress !== activeWallet) {
          navigate('/switch', {
            state: {
              sessionAddress: activeAddress,
              rejectType: SIGN_REJECT_RESPONSE,
            },
          });
          return;
        }

        setPsbt(state.psbt);
        setHost(state.host);

        let details;
        try {
          details = await fetchPsbtDetails(Psbt.fromHex(state.psbt).toBase64());
        } catch (e) {
          console.log(e);
          showToast(
            'error',
            'Failed to get PSBT details. Showing raw PSBT instead. If you are not trusting this website, please reject it.'
          );
          setLoading(false);
          return;
        }

        // balance changes is array of { address, change } change can be positive or negative.
        // if address is our address and change is negative, we are sending
        // if address is our address and change is positive, we are receiving
        // we dont care the other cases
        const balanceChanges = details.balanceChanges;
        const totalSending =
          balanceChanges
            .filter(
              (change) => change.address === activeAddress && change.change < 0
            )
            .reduce((acc, change) => acc + change.change, 0) * -1;
        const totalReceiving = balanceChanges
          .filter(
            (change) => change.address === activeAddress && change.change > 0
          )
          .reduce((acc, change) => acc + change.change, 0);

        // inscriptionChanges is array of { address, change: {ins:[], outs:[]}}
        // if address is our address and change.outs is not empty, we are sending
        // if address is our address and change.ins is not empty, we are receiving
        // we dont care the other cases

        const inscriptionChanges = details.inscriptionChanges;
        console.log(inscriptionChanges);
        const inscriptionsSending = inscriptionChanges
          .filter(
            (change) =>
              change.address === activeAddress && change.change.outs.length > 0
          )
          .map((change) => change.change.outs)
          .flat();
        const inscriptionsReceiving = inscriptionChanges
          .filter(
            (change) =>
              change.address === activeAddress && change.change.ins.length > 0
          )
          .map((change) => change.change.ins)
          .flat();

        setDetails({
          fee: details.fee,
          feePayer: details.feePayer,

          totalSending,
          totalReceiving,

          inscriptionsSending,
          inscriptionsReceiving,
        });
        setLoading(false);
      } else {
        window.close();
      }
    };

    getState();
  }, [dispatch]);

  const handleSign = async () => {
    setLoading(true);

    try {
      const walletNode = await decryptAddress(
        encryptedPrivKey,
        encryptedChainCode,
        pincode,
        network
      );
      const [paymentInfo, signer, tapInteralKey] = generateTaprootAddress(
        walletNode,
        network
      );
      const signedPsbt = signCustomPSBTFromWallet(
        signer,
        paymentInfo.address,
        tapInteralKey,
        Psbt.fromHex(psbt),
        network
      );

      event('sign', {
        type: 'psbt',
        address: activeWallet,
        host,
      });

      // send response
      await approve({
        signedPsbt: signedPsbt.toHex(),
      });
    } catch (e) {
      console.log(e);
      showToast('error', 'Failed to sign PSBT: ', e.message || 'Unknown error');
    }
    setLoading(false);
  };
  return (
    <>
      <CardScreenWrapper>
        <div className="flex flex-col justify-center items-center mt-4">
          {!details && !loading && (
            <div className="text-sm text-gray-500 font-500 text-left mr-auto mb-4">
              <p className="mb-2">Raw PSBT</p>
              <textarea
                className="w-72 h-cardScreen bg-customDark rounded-md p-2 resize-none"
                value={psbt}
                readOnly
              />
            </div>
          )}
          {details && !loading && (
            <>
              <p className="text-xs text-gray-500 font-500 text-left mr-auto my-1">
                You are sending
              </p>
              <div className="bg-lightblue rounded-xl py-1 px-0 w-72">
                {loading ? (
                  <Skeleton count={2} />
                ) : (
                  <PreviewSwiper
                    bitcoin={details.totalSending}
                    inscription={details.inscriptionsSending}
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 font-500 text-left mr-auto my-1 mt-4">
                You are receiving
              </p>
              <div className="bg-lightblue rounded-xl py-1 px-0 w-72">
                {loading ? (
                  <Skeleton count={2} />
                ) : (
                  <PreviewSwiper
                    bitcoin={details.totalReceiving}
                    inscription={details.inscriptionsReceiving}
                  />
                )}
              </div>
              <SendSummaryCard>
                <div className="flex flex-row justify-between items-start border-b border-borderColor">
                  <p className="text-sm text-white font-500 my-4">
                    Network Fee
                  </p>
                  <p className="text-sm text-gray-400 font-500 my-4">
                    {!details ? (
                      <Skeleton width={100} />
                    ) : (
                      satoshisToBTC(details.fee) + ' BTC'
                    )}
                  </p>
                </div>
                <div className="flex flex-row justify-between items-start">
                  <p className="text-sm text-white font-500 my-4">Fee Payer</p>
                  <p className="text-sm text-gray-400 font-500 my-4">
                    {!details ? (
                      <Skeleton width={100} />
                    ) : details.feePayer === activeWallet ? (
                      'You'
                    ) : (
                      truncateAddress(details.feePayer)
                    )}
                  </p>
                </div>
              </SendSummaryCard>
            </>
          )}
        </div>
      </CardScreenWrapper>
      <ActionButtons className="absolute bottom-10 left-0 right-0">
        <RejectButton w={36} onClick={reject} />
        <GenericButton
          text="Sign"
          w={36}
          onClick={handleSign}
          loading={loading}
        />
      </ActionButtons>
    </>
  );
};

export default SignPSBT;
