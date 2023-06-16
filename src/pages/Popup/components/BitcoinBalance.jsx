import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import BTCIcon from '../assets/icons/btc.svg';
import { satoshisToBTC } from '../utils';
import { store } from '../store';

const BitcoinBalance = () => {
  const [balance, setBalance] = useState(0); // store.getState().account.accounts[activeAddress].balance
  const activeAddress = useSelector(
    (state) => state.wallet.activeWallet.address
  );
  const balanceSelector = useSelector(
    (state) => state.account.accounts[activeAddress].balance
  );
  const bitcoinPrice = useSelector((state) => state.account.bitcoinPrice);
  const balanceInUSD = satoshisToBTC(balance) * bitcoinPrice;

  useEffect(() => {
    setBalance(store.getState().account.accounts[activeAddress].balance);
  }, [activeAddress]);

  useEffect(() => {
    setBalance(balanceSelector);
  }, [balanceSelector]);

  return (
    <div className="flex flex-col justify-center items-center h-100 my-2">
      <img className="w-16 text-white" src={BTCIcon} alt="Bitcoin Icon" />
      <div className="flex flex-col text-center mt-4">
        <p className="text-gray-500 text-xs font-semibold">
          ${bitcoinPrice.toLocaleString()}
        </p>
        <p className="text-white text-xl font-bold">
          {satoshisToBTC(balance)} BTC
        </p>
        <p className="text-gray-400 text-sm font-semibold">
          ${balanceInUSD.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default BitcoinBalance;
