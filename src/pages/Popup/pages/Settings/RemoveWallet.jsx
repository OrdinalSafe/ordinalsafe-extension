import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as amplitude from '@amplitude/analytics-browser';
import { GoBackChevron } from '../../components/GoBackChevron';
import GenericButton from '../../components/Buttons/GenericButton';
import { resetAuth } from '../../store/features/auth';
import { setLock } from '../../store/features/auth';
import { useNavigate } from 'react-router-dom';
import ErrorText from '../../components/ErrorText';
import { event } from '../../utils';
import { store } from '../../store';

const RemoveWallet = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordFromState = useSelector((state) => state.auth.pincode);

  const handleRemoveWallet = () => {
    setError('');
    setLoading(true);

    if (!password || password !== passwordFromState) {
      setError('Incorrect password');
      setLoading(false);
      return;
    }

    dispatch({ type: 'REMOVE_WALLET' });

    event('remove_wallet', {
      address: store.getState().wallet.activeWallet.address,
    });
    amplitude.reset();

    window.close();
  };

  return (
    <div className="h-full pt-4 flex flex-col justify-start items-start relative">
      <GoBackChevron route="/settings/wallet" />
      <p className="text-white text-lg font-semibold mb-4 mx-auto">
        Remove Wallet
      </p>

      <p className="text-gray-400 text-xs font-500 mt-4 mb-2 mx-auto">
        Enter your password to remove your wallet from the extension. This
        action CANNOT BE UNDONE. If you want to use this wallet again, you will
        need to import it using your seed phrase. This action deletes all your
        accounts from this device.
      </p>
      <input
        type="password"
        placeholder="Enter Password"
        className="text-white w-72 mx-auto h-10 rounded-2xl bg-lightblue px-3 py-2 text-xs placeholder-gray-400 hover:bg-lightblue focus:bg-lightblue focus:outline-0"
        onChange={(e) => setPassword(e.target.value)}
      />
      <GenericButton
        text="Remove Wallet"
        className="w-72 font-500 mx-auto my-2 bg-secondary"
        onClick={handleRemoveWallet}
        loading={loading}
      />
      {error && <ErrorText error={error} className={'mx-auto'} />}
    </div>
  );
};

export default RemoveWallet;
