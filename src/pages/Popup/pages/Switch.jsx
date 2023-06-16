import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GET_WALLET_SERVICE_STATE } from '~/types';
import CardScreenWrapper from '../components/Wrappers/CardScreenWrapper';
import { AuthAccountItem } from '../components/AuthAccountItem';
import ActionButtons from '../components/ActionButtons';
import RejectButton from '../components/Buttons/RejectButton';
import GenericButton from '../components/Buttons/GenericButton';
import {
  GET_ACCOUNT_CONNECT,
  GET_ACCOUNT_REJECT_RESPONSE,
  GET_ACCOUNT_SUCCESS_RESPONSE,
  RESPONSE_TYPE,
} from '../../../types';
import { event, truncateAddress, truncateName } from '../utils';
import { setActiveWallet } from '../store/features/wallet';
import { useConnect } from '../hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import {
  ChevronDoubleDownIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const Switch = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { sessionAddress, rejectType } = location.state;

  const dispatch = useDispatch();
  const [approve, reject] = useConnect(
    '',
    rejectType || GET_ACCOUNT_REJECT_RESPONSE
  );

  const [host, setHost] = useState('');
  const [favicon, setFavicon] = useState('');

  const [sessionWallet, setSessionWallet] = useState(null);

  const wallets = useSelector((state) => state.wallet.wallets);
  const activeWallet = useSelector((state) => state.wallet.activeWallet);

  useEffect(() => {
    // find session wallet
    const sessionWallet = wallets.find(
      (wallet) => wallet.address === sessionAddress
    );
    setSessionWallet(sessionWallet);
  }, [wallets, sessionAddress]);

  const handleSwitch = async () => {
    dispatch(setActiveWallet(sessionWallet.address));

    // return where we came from
    navigate(-1);
  };

  return (
    <>
      <CardScreenWrapper>
        <div className="flex flex-col justify-center items-center">
          <p className="text-white text-2xl font-500 mt-4">
            Connect with OrdinalSafe
          </p>
          <p className="text-gray-500 font-500 text-sm mt-2 mx-auto">
            Switch Address
          </p>
          <div className="flex flex-col justify-center items-center pt-8 overflow-y-auto max-h-80">
            <p className="text-gray-500 font-500 text-sm mt-8 mx-auto">
              Current Address
            </p>
            <p className="text-white text-lg mt-2 font-500">
              {truncateName(activeWallet.name)}
            </p>
            <p className="text-gray-400 text-xs mt-1 font-500">
              {truncateAddress(activeWallet.address)}
            </p>

            <ChevronDownIcon className="text-gray-400 w-12 h-12 my-4" />

            <p className="text-gray-500 font-500 text-sm mx-auto">
              Address Connected to Website
            </p>
            {sessionWallet ? (
              <>
                <p className="text-white text-lg mt-2 font-500">
                  {truncateName(sessionWallet.name)}
                </p>
                <p className="text-gray-400 text-xs mt-1 mb-8 font-500">
                  {truncateAddress(sessionWallet.address)}
                </p>
              </>
            ) : (
              <Spinner />
            )}
          </div>
        </div>
      </CardScreenWrapper>
      <ActionButtons className="absolute bottom-10 left-0 right-0">
        <RejectButton w={36} onClick={reject} />
        <GenericButton text="Switch" w={36} onClick={handleSwitch} />
      </ActionButtons>
    </>
  );
};

export default Switch;
