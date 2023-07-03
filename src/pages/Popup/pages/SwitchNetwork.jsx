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
  SWITCH_NETWORK_REJECT_RESPONSE,
  SWITCH_NETWORK_SUCCESS_RESPONSE,
} from '../../../types';
import { event, truncateAddress, truncateName } from '../utils';
import { setActiveWallet, setWallets } from '../store/features/wallet';
import { useConnect } from '../hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import {
  ChevronDoubleDownIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { setNetwork } from '../store/features/settings';
import { networks } from 'bitcoinjs-lib';
import { generateAddressFromPubKey } from '../../../controllers/WalletController';
import { createAccount } from '../store/features/account';

const SwitchNetwork = () => {
  const dispatch = useDispatch();
  const [approve, reject] = useConnect(
    SWITCH_NETWORK_SUCCESS_RESPONSE,
    SWITCH_NETWORK_REJECT_RESPONSE
  );

  const [host, setHost] = useState('');
  const [favicon, setFavicon] = useState('');

  const [loading, setLoading] = useState(true);

  const [requestedNetwork, setRequestedNetwork] = useState('');

  const wallets = useSelector((state) => state.wallet.wallets);
  const activeWallet = useSelector((state) => state.wallet.activeWallet);

  const network =
    useSelector((state) => state.settings.network).bech32 === 'tb'
      ? 'testnet'
      : 'mainnet';

  useEffect(() => {
    const getState = async () => {
      const { state } = await chrome.runtime.sendMessage({
        action: GET_WALLET_SERVICE_STATE,
      });
      if (state && state.type === 'switchNetwork' && state.network) {
        // only need to unlock, directly approve if network is already connected
        if (state.network === network) {
          await approve({
            network: network,
          });
        }

        setRequestedNetwork(state.network);

        setHost(state.host);
        setFavicon(state.favicon);
        setLoading(false);
      } else {
        window.close();
      }
    };

    getState();
  }, []);

  const handleSwitch = async () => {
    if (network === 'mainnet') {
      // switch to testnet
      dispatch(setNetwork('testnet'));

      const testnetWallets = wallets.map((wallet) => {
        const testnetAddress = generateAddressFromPubKey(
          Buffer.from(wallet.xOnlyPubKey),
          networks.testnet
        );
        return {
          ...wallet,
          address: testnetAddress,
        };
      });

      const testnetActiveWalletAddress = generateAddressFromPubKey(
        Buffer.from(activeWallet.xOnlyPubKey),
        networks.testnet
      );

      dispatch(setWallets(testnetWallets));
      dispatch(setActiveWallet(testnetActiveWalletAddress));
      dispatch(createAccount(testnetActiveWalletAddress));
    } else {
      // switch to mainnet
      dispatch(setNetwork('mainnet'));

      const mainnetWallets = wallets.map((wallet) => {
        const mainnetAddress = generateAddressFromPubKey(
          Buffer.from(wallet.xOnlyPubKey),
          networks.bitcoin
        );
        return {
          ...wallet,
          address: mainnetAddress,
        };
      });

      const mainnetActiveWalletAddress = generateAddressFromPubKey(
        Buffer.from(activeWallet.xOnlyPubKey),
        networks.bitcoin
      );

      dispatch(setWallets(mainnetWallets));
      dispatch(setActiveWallet(mainnetActiveWalletAddress));
      dispatch(createAccount(mainnetActiveWalletAddress));
    }

    event('change_network', {
      network: network === 'mainnet' ? 'testnet' : 'mainnet',
    });

    await approve({
      network: network === 'mainnet' ? 'testnet' : 'mainnet',
    });
  };

  return (
    <>
      <CardScreenWrapper>
        <div className="flex flex-col justify-center items-center">
          <p className="text-white text-2xl font-500 mt-4">
            Connect with OrdinalSafe
          </p>
          <p className="text-gray-500 font-500 text-sm mt-2 mx-auto">
            Switch Network
          </p>
          <div className="flex flex-col justify-center items-center pt-8 overflow-y-auto max-h-80">
            <p className="text-gray-500 font-500 text-sm mt-8 mx-auto">
              Current Network
            </p>
            <p className="text-white text-lg mt-2 font-500">
              {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
            </p>

            <ChevronDownIcon className="text-gray-400 w-12 h-12 my-4" />

            <p className="text-gray-500 font-500 text-sm mx-auto">
              Website Requested Network
            </p>
            {requestedNetwork ? (
              <>
                <p className="text-white text-lg mt-2 font-500">
                  {requestedNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'}
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

export default SwitchNetwork;
