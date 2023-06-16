import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import './Popup.css';

import { store } from 'store';
import router from './router';

import { setLock } from 'store/features/settings';
import { fetchAllBalanceInfo } from 'controllers/AccountController';
import { setInscriptionIds, setOrdinalUTXOs } from 'store/features/account';
import {
  setBitcoinPrice,
  setBrcBalances,
  setCardinalUTXOs,
} from './store/features/account';
import {
  fetchBRC20Balances,
  fetchBitcoinPrice,
} from '../../controllers/AccountController';

let currentlyFetching = false;

export const fetchAndSet = async (state, dispatch) => {
  if (currentlyFetching) return;
  currentlyFetching = true;
  try {
    const address = state.wallet.activeWallet.address;
    if (!address) {
      currentlyFetching = false;
      return;
    }

    const [allBalanceInfo, brcBalances] = await Promise.all([
      fetchAllBalanceInfo(address),
      fetchBRC20Balances(address),
    ]);

    if (allBalanceInfo) {
      const { cardinalUTXOs, ordinalUTXOs, inscriptionIds } = allBalanceInfo;

      dispatch(setCardinalUTXOs(cardinalUTXOs));
      dispatch(setOrdinalUTXOs(ordinalUTXOs));
      dispatch(setInscriptionIds(inscriptionIds));
    }
    if (brcBalances) {
      dispatch(setBrcBalances(brcBalances));
    }
  } catch (e) {
    console.log('error fetching balance info', e);
  }

  currentlyFetching = false;
  return;
};

const Popup = () => {
  const dispatch = useDispatch();
  const activeWallet = useSelector((state) => state.wallet.activeWallet);
  const network = useSelector((state) => state.settings.network);

  const fetchPrice = async () => {
    try {
      const price = await fetchBitcoinPrice();
      if (price) {
        dispatch(setBitcoinPrice(price));
      }
    } catch (e) {
      console.log('error fetching price');
    }
  };

  // fetch every x seconds
  useEffect(() => {
    // initial fetch
    if (activeWallet.address) fetchAndSet(store.getState(), dispatch);

    // set up interval
    const interval = setInterval(async () => {
      await fetchAndSet(store.getState(), dispatch);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // fetch price every 1 minute
  useEffect(() => {
    fetchPrice();
    const interval = setInterval(async () => {
      await fetchPrice();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // set currently fetching false if network changes
  useEffect(() => {
    currentlyFetching = false;
  }, [network]);

  return (
    <div className="">
      {/* TODO: add 404 fallback */}
      <RouterProvider router={router} />
    </div>
  );
};

export default Popup;
