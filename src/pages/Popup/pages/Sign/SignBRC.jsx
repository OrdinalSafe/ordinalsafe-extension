import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { psbtSize, signAndSend } from 'controllers/TransactionController';
import Header from '../../components/Header';
import CardScreenWrapper from '../../components/Wrappers/CardScreenWrapper';
import { GoBackChevron } from '../../components/GoBackChevron';
import BTCIcon from '../../assets/icons/btc.svg';
import SendSummaryCard from '../../components/SendSummaryCard';
import { truncateAddress } from '../../utils';
import ActionButtons from '../../components/ActionButtons';
import SendButton from '../../components/Buttons/SendButton';
import GasModal from './GasModal';

const SignBRC = () => {
  const location = useLocation();
  const address = useSelector((state) => state.wallet.activeWallet.address);
  const utxos = useSelector((state) => state.account.accounts[address].utxos);
  const inscriptionUtxos = useSelector(
    (state) => state.account.accounts[address].inscriptionUtxosFull
  );
  const xOnlyPubkey = useSelector(
    (state) => state.wallet.activeWallet.xOnlyPubKey
  );
  const network = useSelector((state) => state.settings.network);

  const [size, setSize] = useState(0);
  const [feeRate, setFeeRate] = useState(0);
  const [fee, setFee] = useState(0.1);
  const [feeRates, setFeeRates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { amount, address: addressToSend } = location.state;

  const handleSend = async () => {
    setLoading(true);
    try {
      // const {success, tx} = signAndSend(
      //   utxos,
      //   address,
      //   inscriptionUtxos,
      //   Buffer.from(xOnlyPubkey, 'hex'),
      //   addressToSend,
      //   size,
      //   feeRate,
      //   false, // isOrdinal
      //   "", // ordinalId
      //   amount,
      //   network
      // )
      // if (success) {
      //   // TODO: handle success
      //   console.log(tx)
      // } else {
      //   // TODO: handle error
      //   console.log(tx)
      // }
    } catch (err) {
      // TODO: handle error
    }

    setLoading(false);
  };

  useEffect(() => {
    const fetchFeeRates = async () => {
      // TODO: fetch fee rates
      setFeeRates([1, 2, 3, 4, 5]);
    };
    fetchFeeRates();
  }, []);

  useEffect(() => {
    const calculateSize = async () => {
      // const size = psbtSize(
      //   utxos,
      //   address,
      //   inscriptionUtxos,
      //   Buffer.from(xOnlyPubkey, 'hex'),
      //   addressToSend,
      //   false, // isOrdinal
      //   "", // ordinalId
      //   amount,
      //   network
      // )
      // setSize(size)
      // setLoading(false)
    };
    if (
      utxos &&
      address &&
      inscriptionUtxos &&
      xOnlyPubkey &&
      addressToSend &&
      amount &&
      network
    ) {
      calculateSize().catch((err) => {
        // TODO: handle error
        console.log(err);
        setLoading(false);
      });
    }
  }, [
    utxos,
    address,
    inscriptionUtxos,
    xOnlyPubkey,
    addressToSend,
    amount,
    network,
  ]);

  const openFeeModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <GasModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feeRates={feeRates}
        setFeeRate={setFeeRate}
        feeRate={feeRate}
        size={size}
      />
      <Header />
      <CardScreenWrapper>
        <GoBackChevron
          route="/send/bitcoin"
          state={{ amount, address: addressToSend }}
        />
        <img className="w-16 text-white" src={BTCIcon} alt="Bitcoin Icon" />
        <p className="text-white text-2xl font-semibold mt-4 mb-2">
          {amount} BTC
        </p>
        <p className="text-gray-500 text-xs font-500">$56.98</p>
        <SendSummaryCard>
          <div className="flex flex-row justify-between items-center py-2 border-b border-borderColor">
            <p className="text-white font-500 ">To</p>
            <p className="text-gray-400 font-500 ">
              {truncateAddress(addressToSend)}
            </p>
          </div>
          <div className="flex flex-col justify-between items-between py-2 border-b border-borderColor">
            <div className="flex flex-row justify-between items-center">
              <p className="text-white font-500 ">Network Fee</p>
              <div className="flex flex-col justify-start items-end">
                <p className="text-gray-400 font-500">0.1 BTC </p>
                <p className="text-gray-500 font-500">$0.5 </p>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center pt-4">
              <p className="text-white font-500 text-xs">Medium ~2min</p>
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
                {Number(amount) + fee} BTC
              </p>
              <p className="text-gray-500 font-500">$57.5 </p>
            </div>
          </div>
        </SendSummaryCard>
      </CardScreenWrapper>
      <ActionButtons>
        <SendButton
          w={'72'}
          onClick={handleSend}
          disabled={false}
          className={'absolute bottom-10'}
        />
      </ActionButtons>
    </>
  );
};

export default SignBRC;
