import React, { useState } from 'react';
import { CloseCross } from '../../components/CloseCross';
import { Switch } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { setNetwork } from '../../store/features/settings';
import { setActiveWallet, setWallets } from '../../store/features/wallet';
import { GoBackChevron } from '../../components/GoBackChevron';
import { networks } from 'bitcoinjs-lib';
import { generateAddressFromPubKey } from 'controllers/WalletController';
import { event } from '../../utils';
import { createAccount } from '../../store/features/account';

export const DeveloperSettings = () => {
  const dispatch = useDispatch();
  const network = useSelector((state) => state.settings.network);
  const [enabled, setEnabled] = useState(
    network.bech32 === 'tb' ? true : false
  );

  const wallets = useSelector((state) => state.wallet.wallets);
  const activeWallet = useSelector((state) => state.wallet.activeWallet);

  const toggleEnabled = (status) => {
    setEnabled(status);
    if (status) {
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
      network: status ? 'testnet' : 'mainnet',
    });
  };

  return (
    <div className="h-full pt-4 flex flex-col justify-start items-center relative">
      <GoBackChevron route="/settings" />
      <p className="text-white text-lg font-semibold mb-4 mx-auto">
        Developer Settings
      </p>
      <Switch.Group>
        <div className="w-72 flex items-center mt-2 ml-2">
          <Switch
            checked={enabled}
            onChange={toggleEnabled}
            className={`${
              enabled ? 'bg-primary' : 'bg-secondary'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span
              className={`${
                enabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <Switch.Label className="text-white text-sm ml-4">
            Testnet Mode
          </Switch.Label>
        </div>
      </Switch.Group>
    </div>
  );
};
