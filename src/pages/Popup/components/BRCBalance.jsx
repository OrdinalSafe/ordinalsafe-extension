import React from 'react';
import BTCIcon from '../assets/icons/btc.svg';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

const BRCBalance = ({ usd, balance, icon, name }) => {
  return (
    <div className="flex flex-col justify-center items-center h-100 my-2">
      {icon ? (
        <img className="w-20 h-20 rounded-full" src={icon} alt="BRC20 Icon" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-secondary flex flex-col justify-center align-center">
          <p className="text-white text-3xl font-semibold text-center my-auto mx-auto my-0 py-0">
            {name[0].toUpperCase()}
          </p>
        </div>
      )}
      <div className="flex flex-col text-center mt-4">
        <p className="text-gray-500 text-xs font-semibold">${usd}</p>
        <p className="text-white text-xl font-bold">
          {Number(balance).toFixed(6)}
        </p>
        <p className="text-gray-400 text-sm font-semibold">${usd * balance}</p>
      </div>
    </div>
  );
};

export default BRCBalance;
