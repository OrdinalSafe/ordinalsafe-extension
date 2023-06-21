import React from 'react';
import BRC20Item from './BRC20Item';
import { CurrencyDollarIcon } from '@heroicons/react/20/solid';
import BRC20Icon from '../assets/icons/brc20.svg';
import { useSelector } from 'react-redux';

const BRC20List = () => {
  const activeAddress = useSelector(
    (state) => state.wallet.activeWallet.address
  );
  const brcBalances = useSelector(
    (state) => state.account.accounts[activeAddress]?.brcBalances || []
  );

  return (
    <div className="flex flex-col justify-start items-stretch mx-2 mt-2">
      {!brcBalances || brcBalances.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64">
          <img
            className="w-24 text-gray-500"
            src={BRC20Icon}
            alt="BRC20 Icon"
          />
          <p className="text-gray-600 text-md mt-6">
            Your BRC20 tokens will appear here
          </p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-md font-bold text-left">My Assets</p>
          <div className="flex flex-col justify-start items-stretch overflow-y-scroll max-h-brc20">
            {brcBalances.map((item, index) => {
              return <BRC20Item item={item} key={index} />;
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default BRC20List;
