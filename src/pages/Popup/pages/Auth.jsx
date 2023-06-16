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
import { event } from '../utils';
import { setActiveWallet } from '../store/features/wallet';
import { useConnect } from '../hooks';

const Auth = () => {
  const [approve, reject] = useConnect(
    GET_ACCOUNT_SUCCESS_RESPONSE,
    GET_ACCOUNT_REJECT_RESPONSE
  );
  const dispatch = useDispatch();

  const [host, setHost] = useState('');
  const [favicon, setFavicon] = useState('');

  const [loading, setLoading] = useState(true);

  const [selectedWallets, setSelectedWallets] = useState([]);

  const wallets = useSelector((state) => state.wallet.wallets).map((wallet) => {
    return {
      address: wallet.address,
      name: wallet.name,
    };
  });
  const activeAddress = useSelector(
    (state) => state.wallet.activeWallet.address
  );

  useEffect(() => {
    const getState = async () => {
      const { state } = await chrome.runtime.sendMessage({
        action: GET_WALLET_SERVICE_STATE,
      });
      if (state && state.type === 'auth' && state.host) {
        const session = state.activeSession;

        // only need to unlock, directly approve if the active address is in the session
        if (
          session?.account?.accounts &&
          session.account.accounts.includes(activeAddress)
        ) {
          await approve({
            accounts: [activeAddress],
          });
        }

        setHost(state.host);
        setFavicon(state.favicon);
        setLoading(false);
      } else {
        window.close();
      }
    };

    getState();
  }, []);

  const handleSelectWallet = (address) => {
    /* if (selectedWallets.includes(address)) {
      setSelectedWallets(
        selectedWallets.filter((wallet) => wallet !== address)
      );
    } else {
      setSelectedWallets([...selectedWallets, address]);
    } */
    // only allow one wallet to be selected for now
    setSelectedWallets([address]);
  };

  const handleConnect = async () => {
    setLoading(true);

    dispatch(setActiveWallet(selectedWallets[0]));

    event('wallet_connect', {
      switchWallet: false,
      connectedAddresses: selectedWallets,
      host: host,
    });

    await approve({
      accounts: selectedWallets,
    });
  };

  return (
    <>
      <CardScreenWrapper>
        <div className="flex flex-col justify-center items-center">
          <img src={favicon} alt="favicon" className="w-8 h-8 mt-8" />
          <p className="text-gray-600 mt-2">{host}</p>
          <p className="text-white text-2xl font-500 mt-4">
            Connect with OrdinalSafe
          </p>
          <p className="text-gray-500 font-500 text-sm mt-2 mx-auto">
            Select account
          </p>
          <div className="flex flex-col justify-center items-center pt-8 overflow-y-auto max-h-64">
            {wallets.map((wallet) => (
              <AuthAccountItem
                key={wallet.address}
                address={wallet.address}
                name={wallet.name}
                selectedAddress={selectedWallets.includes(wallet.address)}
                setSelectedAddress={handleSelectWallet}
              />
            ))}
          </div>
        </div>
      </CardScreenWrapper>
      <ActionButtons className="absolute bottom-10 left-0 right-0">
        <RejectButton w={36} onClick={reject} />
        <GenericButton
          text="Connect"
          w={36}
          onClick={handleConnect}
          loading={loading}
          disabled={selectedWallets.length === 0}
        />
      </ActionButtons>
    </>
  );
};

export default Auth;
