import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CardScreenWrapper from '../components/Wrappers/CardScreenWrapper';
import { GoBackChevron } from '../components/GoBackChevron';
import Header from '../components/Header';
import ActionButtons from '../components/ActionButtons';
import SendButton from '../components/Buttons/SendButton';
import {
  ArrowTopRightOnSquareIcon,
  ClipboardIcon,
  LinkIcon,
} from '@heroicons/react/20/solid';
import InscriptionDetail from '../components/InscriptionDetail';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import ReceiveButton from '../components/Buttons/ReceiveButton';
import BRCBalance from '../components/BRCBalance';

const BRC20 = () => {
  const [price, setPrice] = useState(0);
  const { state } = useLocation();
  const navigate = useNavigate();

  const { name, balance, icon } = state;

  useEffect(() => {
    const fetchPrice = async () => {
      // TODO: fetch price from BiS?
      setPrice(0);
    };
    fetchPrice();
  }, [name]);

  return (
    <>
      <Header />
      <CardScreenWrapper>
        <GoBackChevron route="/" />
        <p className="text-white text-xl font-semibold my-2"> {name} </p>
        <BRCBalance usd={price} balance={balance} icon={icon} name={name} />
        <ActionButtons>
          <SendButton
            w={36}
            onClick={() => navigate('/send/brc', { state: { name } })}
            disabled={true}
          />
          <ReceiveButton
            w={36}
            onClick={() => navigate('/receive')}
            disabled={false}
          />
        </ActionButtons>
        <p className="text-gray-600 text-xs font-500 my-2">
          {' '}
          Send functionality coming soon!{' '}
        </p>
      </CardScreenWrapper>
    </>
  );
};

export default BRC20;
