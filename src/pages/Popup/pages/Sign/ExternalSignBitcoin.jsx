import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  getSendBitcoinTx,
  getSendBitcoinTxInfo,
} from '../../../../controllers/TransactionController';
import {
  decryptAddress,
  generateTaprootSigner,
  signPSBTFromWallet,
} from '../../../../controllers/WalletController';
import Header from '../../components/Header';
import CardScreenWrapper from '../../components/Wrappers/CardScreenWrapper';
import { GoBackChevron } from '../../components/GoBackChevron';
import BTCIcon from '../../assets/icons/btc.svg';
import SendSummaryCard from '../../components/SendSummaryCard';
import {
  btcToSatoshis,
  event,
  getMempoolURL,
  satoshisToBTC,
  showToast,
  truncateAddress,
} from '../../utils';
import ActionButtons from '../../components/ActionButtons';
import SendButton from '../../components/Buttons/SendButton';
import GasModal from './GasModal';
import {
  fetchFeeRates,
  postTransaction,
} from '../../../../controllers/AccountController';

import {
  addSpentCardinalUTXO,
  addUnconfirmedCardinalUTXO,
} from 'store/features/account';
import {
  GET_WALLET_SERVICE_STATE,
  SEND_BITCOIN_REJECT_RESPONSE,
  SEND_BITCOIN_SUCCESS_RESPONSE,
} from '../../../../types';
import ErrorText from '../../components/ErrorText';
import RejectButton from '../../components/Buttons/RejectButton';
import { useConnect } from '../../hooks';
import Spinner from '../../components/Spinner';
import GenericButton from '../../components/Buttons/GenericButton';

const ExternalSignBitcoin = () => {
  const navigate = useNavigate();
  const [approve, reject] = useConnect(
    SEND_BITCOIN_SUCCESS_RESPONSE,
    SEND_BITCOIN_REJECT_RESPONSE
  );
  const dispatch = useDispatch();

  const address = useSelector((state) => state.wallet.activeWallet.address);
  const activeWallet = useSelector(
    (state) => state.wallet.activeWallet.address
  );
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
  const bitcoinPrice = useSelector((state) => state.account.bitcoinPrice);

  const [amount, setAmount] = useState();
  const [addressToSend, setAddressToSend] = useState();
  const [host, setHost] = useState();

  const [size, setSize] = useState();
  const [feeRate, setFeeRate] = useState();
  const [fee, setFee] = useState();
  const [feeRates, setFeeRates] = useState({});
  const [feeRateText, setFeeRateText] = useState('');
  const [totalCost, setTotalCost] = useState();
  const [change, setChange] = useState();
  const [chosenUTXOs, setChosenUTXOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [error, setError] = useState();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getState = async () => {
      const { state } = await chrome.runtime.sendMessage({
        action: GET_WALLET_SERVICE_STATE,
      });
      if (state && state.type === 'bitcoin' && state.bitcoin) {
        const activeAddress = state.activeSession.account.accounts[0];

        if (activeAddress !== activeWallet) {
          navigate('/switch', {
            state: {
              sessionAddress: activeAddress,
              rejectType: SEND_BITCOIN_REJECT_RESPONSE,
            },
          });
          return;
        }

        setAmount(state.bitcoin.amountInSats);
        setAddressToSend(state.bitcoin.address);
        setHost(state.host);
        setLoading(false);
      } else {
        console.log('no state');
        window.close();
      }
    };

    getState();
  }, []);

  const handleSend = async () => {
    setLoading1(true);
    try {
      // TODO: figure out why BUffer.from is needed
      const sendBitcoinPSBT = getSendBitcoinTx(
        address,
        addressToSend,
        amount,
        chosenUTXOs,
        change,
        Buffer.from(xOnlyPubKey),
        network
      );
      const walletNode = await decryptAddress(
        encryptedPrivKey,
        encryptedChainCode,
        pincode,
        network
      );
      const signer = generateTaprootSigner(walletNode);

      const transaction = signPSBTFromWallet(signer, sendBitcoinPSBT);
      const txHex = transaction.toHex();

      const { txHash } = await postTransaction(txHex);

      showToast(
        'success',
        'Transaction sent! Click to view on explorer.',
        `${getMempoolURL(networkText)}/tx/${txHash}`
      );

      event('external_send', {
        type: 'bitcoin',
        address,
        amount,
        host,
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

      for (let i = 0; i < sendBitcoinPSBT.txOutputs.length; i++) {
        const output = sendBitcoinPSBT.txOutputs[i];
        if (output.address === address) {
          dispatch(
            addUnconfirmedCardinalUTXO({
              status: 'unconfirmed',
              txId: transaction.getId(),
              index: i,
              value: output.value,
              script: output.script.toString('hex'),
              address: output.address,
              type: 'witness_v1_taproot',
            })
          );
        }
      }

      setLoading1(false);

      await approve({
        txHash,
      });
    } catch (err) {
      showToast('error', 'Error sending transaction: ' + err.message);
      console.log(err);
    }

    setLoading1(false);
  };

  useEffect(() => {
    const fetchRates = async () => {
      const _feeRates = await fetchFeeRates();
      setFeeRates({
        low: _feeRates.hourFee,
        medium: _feeRates.halfHourFee,
        high: _feeRates.fastestFee,
      });
      setFeeRate(_feeRates.halfHourFee);
      setLoading1(false);
    };
    fetchRates().catch((err) => {
      console.log('Error fetching fee rates: ', err);
      showToast('error', 'Error fetching fee rates: ' + err.message);
      setError('Error fetching fee rates, please try again later.');
      // To disable NaN error
      setFeeRates(0);
      setLoading1(false);
    });
  }, []);

  const calculate = (cardinalUTXOsToUse, feeRate) => {
    const { chosenUTXOs, change, feeToPay, totalCost, size } =
      getSendBitcoinTxInfo(
        address,
        addressToSend,
        cardinalUTXOsToUse,
        amount,
        feeRate,
        network
      );
    setChosenUTXOs(chosenUTXOs);
    setChange(change);
    setSize(size);
    setFee(feeToPay);
    setTotalCost(totalCost);
    setLoading2(false);

    return size;
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
        console.log(err);
      }
    }
  };
  const calculateSize = (feeRate) => {
    try {
      return calculate(cardinalUTXOs, feeRate);
    } catch (err) {
      console.log(
        'Error calculating transaction info with confirmed UTXOs: ',
        err
      );
      try {
        return calculate(
          cardinalUTXOs.concat(unconfirmedCardinalUTXOs),
          feeRate
        );
      } catch (err) {
        console.log('Confirmed + unconfirmed utxos: ', err);
        showToast(
          'error',
          'Error calculating transaction size: ' + err.message
        );
        setError('Error calculating transaction size, please try again later.');
        // To disable NaN error
        setFee(0);
        setTotalCost(0);
        setLoading2(false);
      }
    }
  };

  useEffect(() => {
    if (
      !error &&
      cardinalUTXOs &&
      unconfirmedCardinalUTXOs &&
      amount &&
      feeRate &&
      address &&
      addressToSend &&
      network
    ) {
      calculateSize(feeRate);
    }
  }, [
    cardinalUTXOs,
    unconfirmedCardinalUTXOs,
    amount,
    feeRate,
    address,
    addressToSend,
    network,
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

  const openFeeModal = () => {
    setIsModalOpen(true);
  };

  const feeRateFromModal = (feeRate) => {
    setError('');
    calculateSize(feeRate);
    setFeeRate(feeRate);
    setIsModalOpen(false);
  };

  return (
    <>
      <GasModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feeRate={feeRate}
        feeRates={feeRates}
        setFeeRateFromModal={feeRateFromModal}
        size={size}
        calculateSize={calculateSizeExternal}
      />
      <CardScreenWrapper>
        <img className="w-16 text-white" src={BTCIcon} alt="Bitcoin Icon" />
        <p className="text-white text-2xl font-semibold mt-4 mb-2">
          {amount ? satoshisToBTC(amount) + ' BTC' : <Spinner />}
        </p>
        <p className="text-gray-500 text-xs font-500">
          ${((satoshisToBTC(amount) || 0) * bitcoinPrice).toLocaleString()}
        </p>
        <SendSummaryCard>
          <div className="flex flex-row justify-between items-center py-2 border-b border-borderColor">
            <p className="text-white font-500 ">To</p>
            <p className="text-gray-400 font-500 ">
              {addressToSend ? truncateAddress(addressToSend) : <Spinner />}
            </p>
          </div>
          <div className="flex flex-col justify-between items-between py-2 border-b border-borderColor">
            <div className="flex flex-row justify-between items-center">
              <p className="text-white font-500 ">Network Fee</p>
              <div className="flex flex-col justify-start items-end">
                <p className="text-gray-400 font-500">
                  {' '}
                  {satoshisToBTC(fee).toLocaleString('en', {
                    minimumSignificantDigits: 1,
                  })}{' '}
                  BTC{' '}
                </p>
                <p className="text-gray-500 font-500">
                  ${(satoshisToBTC(fee) * bitcoinPrice).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center pt-4">
              <p className="text-gray-500 font-500 text-xs">{feeRateText}</p>
              <p
                className="text-primary font-500 text-xs cursor-pointer"
                onClick={openFeeModal}
              >
                Edit
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center py-2">
            <p className="text-white font-500 ">Total Amount</p>
            <div className="flex flex-col justify-start items-end">
              <p className="text-gray-400 font-500 ">
                {' '}
                {satoshisToBTC(totalCost).toLocaleString('en', {
                  minimumSignificantDigits: 1,
                })}{' '}
                BTC
              </p>
              <p className="text-gray-500 font-500">
                ${(satoshisToBTC(totalCost) * bitcoinPrice).toLocaleString()}
              </p>
            </div>
          </div>
        </SendSummaryCard>
      </CardScreenWrapper>
      <ErrorText
        error={error}
        className={'absolute bottom-20 left-0 right-0'}
      />
      <ActionButtons className="absolute bottom-10 left-0 right-0">
        <RejectButton w={36} onClick={reject} />
        <GenericButton
          text="Send"
          w={36}
          onClick={handleSend}
          disabled={error}
          loading={loading || loading1 || loading2}
        />
      </ActionButtons>
    </>
  );
};

export default ExternalSignBitcoin;
