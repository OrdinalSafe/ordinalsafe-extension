import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLock } from '../store/features/auth';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BitcoinBalance from '../components/BitcoinBalance';
import ActionButtons from '../components/ActionButtons';
import ReceiveButton from '../components/Buttons/ReceiveButton';
import SendButton from '../components/Buttons/SendButton';
import BRC20List from '../components/BRC20List';
import Navbar from '../components/Navbar';
import CardScreenWrapper from '../components/Wrappers/CardScreenWrapper';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <CardScreenWrapper>
        <BitcoinBalance />
        <ActionButtons>
          <SendButton onClick={() => navigate('/send/bitcoin')} w={36} />
          <ReceiveButton onClick={() => navigate('/receive')} w={36} />
        </ActionButtons>
      </CardScreenWrapper>
      <BRC20List />
      <Navbar />
    </>
  );
};

export default Home;
