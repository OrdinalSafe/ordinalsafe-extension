import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Link, useNavigate } from 'react-router-dom';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { setLock } from '../store/features/auth';
import { event, getMempoolURL } from '../utils';
import { fetchAndSet } from '../Popup';
import { store } from '../store';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SettingsDropdown() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const address = useSelector((state) => state.wallet.activeWallet.address);
  const network =
    useSelector((state) => state.settings.network).bech32 === 'bc'
      ? 'mainnet'
      : 'testnet';

  const lock = () => {
    dispatch(setLock(true));
    event('lock_wallet', {
      address,
    });

    navigate('/');
  };

  const explorer = () => {
    const url = getMempoolURL(network);

    chrome.tabs.create({ url: `${url}/address/${address}` });
  };

  const refresh = async () => {
    await fetchAndSet(store.getState(), dispatch);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="bg-none flex flex-col justify-center items-center">
          <EllipsisVerticalIcon
            className="h-8 w-8 text-white hover:text-primary focus:text-primary transition-colors duration-200"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-1 w-40 origin-top-right divide-y divide-gray-100 rounded-xl bg-lightblue shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-0">
            <Menu.Item className="bottom-full">
              <p
                className={classNames(
                  'text-white',
                  'block px-4 py-2 text-sm',
                  'cursor-pointer',
                  'hover:text-primary',
                  'transition-colors duration-200'
                )}
                onClick={refresh}
              >
                Refresh Balances
              </p>
            </Menu.Item>
            <Menu.Item className="bottom-full">
              <p
                className={classNames(
                  'text-white',
                  'block px-4 py-2 text-sm',
                  'cursor-pointer',
                  'hover:text-primary',
                  'transition-colors duration-200'
                )}
                onClick={explorer}
              >
                View on explorer
              </p>
            </Menu.Item>
            <Menu.Item className="bottom-full">
              <p
                className={classNames(
                  'text-white',
                  'block px-4 py-2 text-sm',
                  'cursor-pointer',
                  'hover:text-primary',
                  'transition-colors duration-200'
                )}
                onClick={lock}
              >
                Lock Wallet
              </p>
            </Menu.Item>
            <Menu.Item className="bottom-full">
              <p
                className={classNames(
                  'text-white',
                  'block px-4 py-2 text-sm',
                  'cursor-pointer',
                  'hover:text-primary',
                  'transition-colors duration-200'
                )}
                onClick={() => navigate('/settings')}
              >
                Settings
              </p>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
