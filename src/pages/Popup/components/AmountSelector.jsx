import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { store } from '../store';
import { satoshisToBTC } from '../utils';

const AmountSelector = ({ amount, setAmount, name }) => {
  const activeAddress = useSelector(
    (state) => state.wallet.activeWallet.address
  );
  const bitcoinPrice = useSelector((state) => state.account.bitcoinPrice);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (name) {
      // TODO: get balance from redux
    } else {
      setBalance(
        satoshisToBTC(store.getState().account.accounts[activeAddress].balance)
      );
    }
  }, [name]);

  const setMax = () => {
    if (name) {
      setAmount(balance);
    } else {
      // TODO: consider fee
      setAmount(
        satoshisToBTC(store.getState().account.accounts[activeAddress].balance)
      );
    }
  };

  return (
    <div className="flex flex-col justify-stretch items-stretch my-4">
      <div className="flex flex-row justify-between items-center mb-1">
        <label htmlFor="amount" className="text-gray-500 font-500">
          Amount
        </label>
        <p className="text-xs text-gray-400">
          Available Balance: {balance} {name ? name : 'BTC'}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center ml-1 relative">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="text"
          id="amount"
          autoComplete="off"
          className="text-white w-72 h-10 rounded-2xl bg-lightblue px-3 py-2 text-xs placeholder-gray-400 hover:bg-lightblue focus:bg-lightblue focus:outline-0"
          placeholder="Amount"
        />
        {/* <button
          className="absolute right-2 text-gray-100 bg-gray-600 py-1 px-4 rounded-xl"
          onClick={setMax}
        >
          MAX
        </button> */}
      </div>
      {!name && (
        <p className="my-2 text-left font-500 text-green-400">
          1 BTC ~ ${bitcoinPrice.toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default AmountSelector;
