import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  getSendInscriptionTxInfo,
  getSendInscriptionTx,
} from '../../../../controllers/TransactionController';
import {
  decryptAddress,
  generateTaprootSigner,
  signPSBTFromWallet,
} from '../../../../controllers/WalletController';
import {
  fetchFeeRates,
  fetchInscriptionContent,
  postTransaction,
} from '../../../../controllers/AccountController';
import ActionButtons from '../../components/ActionButtons';
import SendButton from '../../components/Buttons/SendButton';
import Header from '../../components/Header';
import CardScreenWrapper from '../../components/Wrappers/CardScreenWrapper';
import { GoBackChevron } from '../../components/GoBackChevron';
import SendSummaryCard from '../../components/SendSummaryCard';
import {
  event,
  getMempoolURL,
  satoshisToBTC,
  showToast,
  truncateAddress,
} from '../../utils';
import GasModal from './GasModal';
import {
  addSpentInscriptionId,
  addSpentCardinalUTXO,
  addUnconfirmedCardinalUTXO,
} from 'store/features/account';
import InscriptionContent from '../../components/InscriptionContent';
import ErrorText from '../../components/ErrorText';
import {
  GET_WALLET_SERVICE_STATE,
  SEND_INSCRIPTION_REJECT_RESPONSE,
  SEND_INSCRIPTION_SUCCESS_RESPONSE,
} from '../../../../types';
import { useConnect } from '../../hooks';
import GenericButton from '../../components/Buttons/GenericButton';
import RejectButton from '../../components/Buttons/RejectButton';

const ExternalSignInscription = () => {
  const navigate = useNavigate();
  const [approve, reject] = useConnect(
    SEND_INSCRIPTION_SUCCESS_RESPONSE,
    SEND_INSCRIPTION_REJECT_RESPONSE
  );
  const dispatch = useDispatch();

  const address = useSelector((state) => state.wallet.activeWallet.address);
  const activeWallet = useSelector(
    (state) => state.wallet.activeWallet.address
  );
  const cardinalUTXOs = useSelector(
    (state) => state.account.accounts[address]?.cardinalUTXOs || []
  );
  const ordinalUTXOs = useSelector(
    (state) => state.account.accounts[address]?.ordinalUTXOs || []
  );
  const inscriptionIds = useSelector(
    (state) => state.account.accounts[address]?.inscriptionIds || []
  );
  const unconfirmedCardinalUTXOs = useSelector(
    (state) => state.account.accounts[address]?.unconfirmedCardinalUTXOs || []
  );
  const encryptedPrivKey = useSelector(
    (state) => state.wallet.activeWallet.encryptedPrivKey
  );
  const encryptedChainCode = useSelector(
    (state) => state.wallet.activeWallet.encryptedChainCode
  );
  const pincode = useSelector((state) => state.auth.pincode);
  const xOnlyPubkey = useSelector(
    (state) => state.wallet.activeWallet.xOnlyPubKey
  );
  const network = useSelector((state) => state.settings.network);
  const networkText = network.bech32 === 'bc' ? 'mainnet' : 'testnet';
  const bitcoinPrice = useSelector((state) => state.account.bitcoinPrice);

  const [inscriptionDetails, setInscriptionDetails] = useState();
  const [addressToSend, setAddressToSend] = useState();

  const [host, setHost] = useState();
  const [size, setSize] = useState();
  const [fee, setFee] = useState();
  const [feeRate, setFeeRate] = useState();
  const [feeRates, setFeeRates] = useState({});
  const [feeRateText, setFeeRateText] = useState('');
  const [totalCost, setTotalCost] = useState();
  const [change, setChange] = useState();
  const [chosenUTXOs, setChosenUTXOs] = useState([]);
  // TODO: use feePaidFromInscription to show the user
  // it's free to send when inscription postage is big enough
  const [feePaidFromInscription, setFeePaidFromInscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getState = async () => {
      const { state } = await chrome.runtime.sendMessage({
        action: GET_WALLET_SERVICE_STATE,
      });
      if (state && state.type === 'inscription' && state.inscription) {
        const activeAddress = state.activeSession.account.accounts[0];

        if (activeAddress !== activeWallet) {
          navigate('/switch', {
            state: {
              sessionAddress: activeAddress,
              rejectType: SEND_INSCRIPTION_REJECT_RESPONSE,
            },
          });
          return;
        }

        if (!inscriptionIds.includes(state.inscription.inscriptionId)) {
          showToast('error', 'Inscription not found');
          setError('Inscription not found');
          setLoading(false);
          return false;
        }

        setInscriptionDetails(
          await fetchInscriptionContent(state.inscription.inscriptionId)
        );
        setAddressToSend(state.inscription.address);
        setHost(state.host);
        setLoading(false);
        return true;
      } else {
        console.log('no state');
        window.close();
      }
    };

    try {
      getState();
    } catch (e) {
      console.log(e);
      showToast('error', 'Could not fetch inscription details');
      setError('Could not fetch inscription details');
    }
  }, []);

  const handleSend = async () => {
    setLoading1(true);
    try {
      const sendInscriptionPSBT = getSendInscriptionTx(
        address,
        addressToSend,
        chosenUTXOs,
        change,
        feePaidFromInscription,
        fee,
        Buffer.from(xOnlyPubkey),
        network
      );
      const walletNode = await decryptAddress(
        encryptedPrivKey,
        encryptedChainCode,
        pincode,
        network
      );
      const signer = generateTaprootSigner(walletNode);
      const transaction = signPSBTFromWallet(signer, sendInscriptionPSBT);
      const txHex = transaction.toHex();
      const { txHash } = await postTransaction(txHex);

      showToast(
        'success',
        'Transaction sent! Click to view on explorer.',
        `${getMempoolURL(networkText)}/tx/${txHash}`
      );

      // TODO: get unconfirmed UTXOS

      event('external_send', {
        type: 'inscription',
        id: inscriptionDetails.id,
        address,
        host,
      });

      if (chosenUTXOs.length > 1) {
        chosenUTXOs.forEach((utxo) => {
          dispatch(
            addSpentCardinalUTXO({
              txId: utxo.txId,
              index: utxo.index,
            })
          );
        });
      }

      dispatch(addSpentInscriptionId(inscriptionDetails.id));

      // here we start from 1 bc the first output is the inscription
      // we don't want to do anything with it, dangerous
      for (let i = 1; i < sendInscriptionPSBT.txOutputs.length; i++) {
        const output = sendInscriptionPSBT.txOutputs[i];
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
      // update storage accordingly
      // then update transactions

      setLoading1(false);

      await approve({
        txHash,
      });
    } catch (err) {
      showToast('error', 'Error sending inscription: ' + err.message);
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
      showToast('error', 'Error fetching fee rates: ' + err.message);
      setError('Error fetching fee rates, please try again later.');
      // To disable NaN error
      setFeeRate(0);
      setLoading1(false);
    });
  }, []);

  const calculate = (usableCardinalUTXOs, feeRate) => {
    const {
      chosenUTXOs,
      change,
      size,
      feeToPay,
      totalCost,
      feePaidFromInscription,
    } = getSendInscriptionTxInfo(
      address,
      addressToSend,
      usableCardinalUTXOs,
      ordinalUTXOs,
      inscriptionDetails.id,
      feeRate,
      network
    );
    setChosenUTXOs(chosenUTXOs);
    setChange(change);
    setSize(size);
    setFee(feeToPay);
    setTotalCost(totalCost);
    setFeePaidFromInscription(feePaidFromInscription);
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
      } catch (err) {}
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
        showToast(
          'error',
          'Error calculating transaction size: ' + err.message
        );
        setError('Error calculating transaction size, please try again later.');
        // To disable NaN error
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
      ordinalUTXOs &&
      inscriptionDetails?.id &&
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
    ordinalUTXOs,
    inscriptionDetails,
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
        <InscriptionContent
          inscription={inscriptionDetails}
          className="w-40 h-28 rounded-lg my-2"
          size="sm"
        />
        <p className="text-white text-sm font-semibold mb-2">
          ID ({inscriptionDetails ? truncateAddress(inscriptionDetails.id) : ''}
          )
        </p>
        <SendSummaryCard>
          <div className="flex flex-row justify-between items-center py-2 border-b border-borderColor">
            <p className="text-white font-500 ">To</p>
            <p className="text-gray-400 font-500 ">
              {addressToSend ? truncateAddress(addressToSend) : ''}
            </p>
          </div>
          <div className="flex flex-col justify-between items-between py-2">
            <div className="flex flex-row justify-between items-center">
              {/* TODO: if fee paid from inscription show fee as 0 */}
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
          {/* TODO: if fee not paid from inscription show total cost */}
        </SendSummaryCard>
      </CardScreenWrapper>
      <ErrorText
        error={error}
        className={'absolute bottom-20 left-0 right-0'}
      />
      <ActionButtons className="absolute bottom-10 left-0 right-0">
        <RejectButton w={36} onClick={reject} />
        <GenericButton
          text="Sign"
          w={36}
          onClick={handleSend}
          disabled={error}
          loading={loading || loading1 || loading2}
        />
      </ActionButtons>
    </>
  );
};

export default ExternalSignInscription;
