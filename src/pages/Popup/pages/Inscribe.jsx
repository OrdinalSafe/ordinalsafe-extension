import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  generateRevealAddress,
  getInscribeCommitTx,
  getInscribeRevealTx,
  getInscribeTxsInfo,
  IS_MOCK,
} from '@ordinalsafe/inscribe';
import { GET_WALLET_SERVICE_STATE } from '~/types';
import CardScreenWrapper from '../components/Wrappers/CardScreenWrapper';
import ActionButtons from '../components/ActionButtons';
import RejectButton from '../components/Buttons/RejectButton';
import GenericButton from '../components/Buttons/GenericButton';
import {
  INSCRIBE_CONNECT,
  INSCRIBE_REJECT_RESPONSE,
  INSCRIBE_SUCCESS_RESPONSE,
  SIGN_SUCCESS_RESPONSE,
} from '../../../types';
import SendSummaryCard from '../components/SendSummaryCard';
import {
  event,
  getMempoolURL,
  satoshisToBTC,
  showToast,
  truncateAddress,
} from '../utils';
import GasModal from './Sign/GasModal';
import {
  fetchBitcoinPrice,
  fetchFeeRates,
  fetchInscribeFees,
  postMultipleTransactions,
} from '../../../controllers/AccountController';
import {
  decryptAddress,
  generateTaprootSigner,
  signPSBTFromWallet,
} from '../../../controllers/WalletController';
import {
  addSpentCardinalUTXO,
  addUnconfirmedCardinalUTXO,
} from 'store/features/account';
import InscriptionContent from '../components/InscriptionContent';
import { ALLOWED_MIME_TYPES_TO_SIMPLE_TYPES } from '../../../config';
import { setActiveWallet } from '../store/features/wallet';
import { useConnect } from '../hooks';
import { useNavigate } from 'react-router-dom';

const Inscribe = () => {
  const navigate = useNavigate();
  const [approve, reject] = useConnect(
    INSCRIBE_SUCCESS_RESPONSE,
    INSCRIBE_REJECT_RESPONSE
  );
  const dispatch = useDispatch();

  const address = useSelector((state) => state.wallet.activeWallet.address);
  const cardinalUTXOs = useSelector(
    (state) => state.account.accounts[address].cardinalUTXOs
  );
  const unconfirmedCardinalUTXOs = useSelector(
    (state) => state.account.accounts[address].unconfirmedCardinalUTXOs
  );
  const encryptedPrivKey = useSelector(
    (state) => state.wallet.activeWallet.encryptedPrivKey
  );
  const encryptedChainCode = useSelector(
    (state) => state.wallet.activeWallet.encryptedChainCode
  );
  const pincode = useSelector((state) => state.auth.pincode);
  const xOnlyPubKey = useSelector(
    (state) => state.wallet.activeWallet.xOnlyPubKey
  );
  const network = useSelector((state) => state.settings.network);
  const networkText = network.bech32 === 'bc' ? 'mainnet' : 'testnet';

  const [inscribeDisabled, setInscribeDisabled] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [host, setHost] = useState('');
  const [content, setContent] = useState(null);
  const [feeRate, setFeeRate] = useState();
  const [feeRates, setFeeRates] = useState({});
  const [feeRateText, setFeeRateText] = useState(
    feeRate === feeRates.low
      ? 'Slow'
      : feeRate === feeRates.medium
      ? 'Medium'
      : feeRate === feeRates.high
      ? 'Fast'
      : 'Custom'
  );
  const [externalFeeSum, setExternalFeeSum] = useState(0);
  const [serviceFee, setServiceFee] = useState(null);
  const [btcPrice, setBTCPrice] = useState();
  const [chosenUTXOs, setChosenUTXOs] = useState([]);
  const [change, setChange] = useState();
  const [revealCost, setRevealCost] = useState();
  const [commitCost, setCommitCost] = useState();
  const [postageSize, setPostageSize] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openFeeModal = () => {
    setIsModalOpen(true);
  };

  const feeRateFromModal = (feeRate) => {
    setError('');
    calculateSize(feeRate);
    setFeeRate(feeRate);
    setIsModalOpen(false);
  };

  const handleInscribe = async () => {
    setLoading(true);

    try {
      // TODO: figure out why BUffer.from is needed
      const { p2tr: revealAddress, tapLeafScript } = generateRevealAddress(
        Buffer.from(xOnlyPubKey),
        content.mimeType,
        content.hexData,
        network
      );

      const walletNode = await decryptAddress(
        encryptedPrivKey,
        encryptedChainCode,
        pincode,
        network
      );
      const signer = generateTaprootSigner(walletNode);

      const commitPSBT = getInscribeCommitTx(
        chosenUTXOs,
        address,
        revealAddress.address,
        revealCost,
        change,
        Buffer.from(xOnlyPubKey),
        serviceFee.feeAmount,
        serviceFee.feeReceiver,
        network
      );
      const commitTx = signPSBTFromWallet(signer, commitPSBT);

      const revealPSBT = getInscribeRevealTx(
        commitTx.getHash(),
        0,
        revealCost,
        postageSize,
        content.inscriptionReceiver || address,
        revealAddress.output,
        revealAddress.internalPubkey,
        tapLeafScript,
        content.externalFees,
        network
      );

      const revealTx = signPSBTFromWallet(walletNode, revealPSBT);

      const transactions = [commitTx.toHex(), revealTx.toHex()];
      const { txHashes } = await postMultipleTransactions(transactions);

      showToast(
        'success',
        'Inscribed successfully! Click to view on explorer.',
        `${getMempoolURL(networkText)}/tx/${txHashes[0]}` // TODO: is it 0 or 1?
      );

      event('inscribe', {
        address: address,
        type: content.mimeType,
        host,
        inscriptionReceiver: content.inscriptionReceiver || address,
        serviceFeeReceiver: serviceFee.feeReceiver,
        serviceFeeAmount: serviceFee.feeAmount,
        externalFees: content.externalFees,
        txHashes: txHashes,
      });

      // TODO: hold memmpool dependencies system
      chosenUTXOs.forEach((utxo) => {
        dispatch(
          addSpentCardinalUTXO({
            txId: utxo.txId,
            index: utxo.index,
          })
        );
      });

      if (change > 0) {
        dispatch(
          addUnconfirmedCardinalUTXO({
            status: 'unconfirmed',
            txId: commitTx.getId(),
            index: 1,
            value: change,
            script: commitPSBT.txOutputs[1].script.toString('hex'),
            address: address,
            type: 'witness_v1_taproot',
          })
        );
      }

      // send response
      await approve({
        commit: commitTx.getId(),
        reveal: revealTx.getId(),
      });
    } catch (err) {
      showToast('error', 'Error inscribing: ', err.message);
      console.log(err);
    }
  };

  useEffect(() => {
    const getState = async () => {
      const { state } = await chrome.runtime.sendMessage({
        action: GET_WALLET_SERVICE_STATE,
      });
      if (state && state.type === 'inscribe' && state.content) {
        const activeAddress = state.activeSession.account.accounts[0];

        if (activeAddress !== address) {
          navigate('/switch', {
            state: {
              sessionAddress: activeAddress,
              rejectType: INSCRIBE_REJECT_RESPONSE,
            },
          });
          return;
        }

        setContent(state.content);
        setExternalFeeSum(
          state.content.externalFees.map(f => f.fee).reduce((a, b) => a + b, 0)
        )
        setHost(state.host);

        if (IS_MOCK) {
          showToast('error', 'Inscribe feature is not supported in unofficial builds');
          setInscribeDisabled(true);
          return;
        }

        setLoading(false);
      } else {
        window.close();
      }
    };

    getState();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      const _feeRates = await fetchFeeRates();
      setFeeRates({
        low: _feeRates.hourFee,
        medium: _feeRates.halfHourFee,
        high: _feeRates.fastestFee,
      });
      setFeeRate(_feeRates.halfHourFee);
      setLoading(false);
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const fetchServiceFees = async () => {
      const serviceFee = await fetchInscribeFees();

      setServiceFee(serviceFee);
    };
    fetchServiceFees().catch((err) => {
      // if errors out set default fee
      // for now we are responding from API with 0 fees
      setServiceFee({
        feeAmount: 0.5, // USD
        feeReceiver:
          'bc1p9sde7glyucw43szdgg3fd0fucupdh2s8gf4r4hyyayxfp8jxyl3qc3k46a',
      });
    });
  }, []);

  useEffect(() => {
    const fetcBTCPrice = async () => {
      const price = await fetchBitcoinPrice();
      setBTCPrice(price);
    };
    fetcBTCPrice().catch((err) => {
      console.log('Error fetching btc price: ', err);
      setBTCPrice(27000);
    });
  }, []);

  const calculate = (cardinalUTXOsToUse, feeRate) => {
    const { chosenUTXOs, change, commitCost, revealCost, postageSize } =
    getInscribeTxsInfo(
      cardinalUTXOsToUse,
      content.hexData,
      address,
      feeRate,
      serviceFee.feeAmount,
      serviceFee.feeReceiver,
      btcPrice,
      content.externalFees,
      network
    );

    setChosenUTXOs(chosenUTXOs);
    setChange(change);
    setCommitCost(commitCost);
    setRevealCost(revealCost);
    setPostageSize(postageSize);
    setLoading(false);

    return commitCost / feeRate;
  };

  const calculateSizeExternal = (feeRate) => {
    try {
      return calculate(cardinalUTXOs, feeRate);
    } catch (err) {
      try {
        return calculate(
          cardinalUTXOs.concat(unconfirmedCardinalUTXOs),
          feeRate
        );
      } catch (err) {
        console.log('Error calculating transaction size: ', err);
      }
    }
  };

  const calculateSize = (feeRate) => {
    try {
      return calculate(cardinalUTXOs, feeRate);
    } catch (err) {
      console.log('Only confirmed utxos:', err);
      try {
        return calculate(
          cardinalUTXOs.concat(unconfirmedCardinalUTXOs),
          feeRate
        );
      } catch (err) {
        console.log('Confirmed and unconfirmed utxos:', err);
        if (!inscribeDisabled) {
          showToast(
            'error',
            'Error calculating transaction size: ' + err.message
          );
        }
        setError(
          'Error calculating transaction size, please try again later.'
        );
        // To disable NaN error
        setCommitCost(0);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (
      !error &&
      cardinalUTXOs &&
      unconfirmedCardinalUTXOs &&
      content &&
      feeRate &&
      address &&
      serviceFee &&
      btcPrice &&
      network
    ) {
      calculateSize(feeRate);
    }
  }, [
    cardinalUTXOs,
    unconfirmedCardinalUTXOs,
    feeRate,
    address,
    network,
    content,
    serviceFee,
    btcPrice,
  ]);

  useEffect(() => {
    if (feeRate) {
      const text =
        feeRate === feeRates.low
          ? 'Slow'
          : feeRate === feeRates.medium
          ? 'Medium'
          : feeRate === feeRates.high
          ? 'Fast'
          : 'Custom';
      setFeeRateText(text);
    }
  }, [feeRate, feeRates]);

  return (
    <>
      <GasModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feeRate={feeRate}
        feeRates={feeRates}
        setFeeRateFromModal={feeRateFromModal}
        size={commitCost / feeRate}
        calculateSize={calculateSizeExternal}
      />
      <CardScreenWrapper>
        {inscribeDisabled && (
          /* Full size */
          <div className="w-screen h-screen flex flex-col justify-center items-center">
            <p className="text-white text-lg font-500 my-1">
              Inscribe feature is disabled in unofficial builds
            </p>
          </div>
        )}
        {!inscribeDisabled && content && (
          <div className="flex flex-col justify-center items-center">
            <p className="text-white text-lg font-500 my-1">
              You are inscribing
            </p>
            <InscriptionContent
              inscription={{
                type: content.mimeType,
                simpleType:
                  ALLOWED_MIME_TYPES_TO_SIMPLE_TYPES[content.mimeType],
                content: content.hexData,
                inscriptionId: 'undefined',
              }}
              className="w-48 h-24 rounded-lg my-2"
              size="sm"
            />
            <p className="text-xs text-gray-500 font-500 mt-1">
              Type: {content.mimeType}
            </p>
            <SendSummaryCard>
              <div className="flex flex-row justify-between items-start border-b border-borderColor">
                <p className="text-sm text-white font-500 my-4">To</p>
                <p className="text-sm text-gray-400 font-500 my-4">
                  {content.inscriptionReceiver
                    ? truncateAddress(content.inscriptionReceiver)
                    : 'You'}
                </p>
              </div>
              {content.externalFees.length > 0 ? (
                <>
                  <div className="flex flex-row justify-between items-start border-b border-borderColor">
                    <p className="text-sm text-white font-500 my-4">
                      Website Fee
                    </p>
                    <p className="text-sm text-gray-400 font-500 my-4">
                      {externalFeeSum / 100000000} BTC
                    </p>
                  </div>
                </>
              ) : (
                <></>
              )}
              <div className="flex flex-col justify-between items-between py-2">
                <div className="flex flex-row justify-between items-center">
                  <p className="text-white text-sm font-500 ">Total Cost</p>
                  <div className="flex flex-col justify-start items-end">
                    <p className="text-gray-400 text-sm font-500">
                      {satoshisToBTC(commitCost).toLocaleString('en', {
                        minimumSignificantDigits: 1,
                      })}{' '}
                      BTC{' '}
                    </p>
                    <p className="text-gray-500 font-500">
                      ${(satoshisToBTC(commitCost) * btcPrice).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center pt-4">
                  <p className="text-white font-500 text-xs">{feeRateText}</p>
                  <p
                    className="text-primary font-500 text-xs cursor-pointer"
                    onClick={openFeeModal}
                  >
                    Edit
                  </p>
                </div>
              </div>
            </SendSummaryCard>
          </div>
        )}
      </CardScreenWrapper>
      <ActionButtons className="absolute bottom-8 left-0 right-0">
        <RejectButton w={36} onClick={reject} />
        <GenericButton
          text="Inscribe"
          w={36}
          onClick={handleInscribe}
          loading={loading}
          disabled={error}
        />
      </ActionButtons>
    </>
  );
};

export default Inscribe;
