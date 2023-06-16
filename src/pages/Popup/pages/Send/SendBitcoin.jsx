import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import AddressSelector from '../../components/AddressSelector';
import AmountSelector from '../../components/AmountSelector';
import ActionButtons from '../../components/ActionButtons';
import GoBackButton from '../../components/Buttons/GoBackButton';
import SendButton from '../../components/Buttons/SendButton';
import Navbar from '../../components/Navbar';
import CardScreenWrapper from '../../components/Wrappers/CardScreenWrapper';
import { GoBackChevron } from '../../components/GoBackChevron';
import BTCIcon from '../../assets/icons/btc.svg';
import { satoshisToBTC, validateAddress } from '../../utils';
import { useSelector } from 'react-redux';
import { store } from '../../store';
import ErrorText from '../../components/ErrorText';

const SendBitcoin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const network =
    useSelector((state) => state.settings.network).bech32 === 'tb'
      ? 'testnet'
      : 'mainnet';
  const activeAddress = useSelector(
    (state) => state.wallet.activeWallet.address
  );

  let amountLocation = null;
  let addressLocation = '';
  if (location.state) {
    const { amount, address } = location.state;
    amountLocation = amount;
    addressLocation = address;
  }

  const [amount, setAmount] = useState(amountLocation);
  const [address, setAddress] = useState(addressLocation);

  const [error1, setError1] = useState('');
  const [error2, setError2] = useState('');

  useEffect(() => {
    if (amount) {
      setError2('');
    }
    if (address) {
      setError1('');
    }
  }, [amount, address]);

  const handleSend = () => {
    setError1('');
    setError2('');
    if (!validateAddress(address, network)) {
      setError1('Invalid address');
      return;
    }
    if (amount <= 0) {
      setError2('Invalid amount');
      return;
    }
    if (
      amount >
      satoshisToBTC(store.getState().account.accounts[activeAddress].balance)
    ) {
      setError2('Insufficient funds');
      return;
    }
    navigate('/sign/bitcoin', { state: { amount, address } });
  };

  return (
    <>
      <Header />
      <CardScreenWrapper>
        <GoBackChevron route="/" />
        <p className="text-white text-lg mb-4"> Send Bitcoin </p>
        <img className="w-16 text-white" src={BTCIcon} alt="Bitcoin Icon" />
        <AddressSelector
          address={address}
          setAddress={setAddress}
          error={error1}
        />
        <AmountSelector amount={amount} setAmount={setAmount} error={error2} />
      </CardScreenWrapper>
      {(error1 || error2) && (
        <ErrorText error={error1 || error2} className="pt-20" />
      )}
      <ActionButtons>
        <SendButton
          w={'72'}
          onClick={handleSend}
          disabled={false}
          className={'absolute bottom-8'}
        />
      </ActionButtons>
    </>
  );
};

export default SendBitcoin;
