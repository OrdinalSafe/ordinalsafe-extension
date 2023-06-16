import React, { useState } from 'react';
import {
  canDecrypt,
  decryptMasterNode,
  generateWallet,
} from 'controllers/WalletController';
import { useNavigate } from 'react-router-dom';
import { addWallet, setActiveWallet } from 'store/features/wallet';
import { createAccount as createAccountInState } from 'store/features/account';
import Logo from '../../assets/icon.png';
import { SettingsItem } from '../../components/SettingsItem';
import { CloseCross } from '../../components/CloseCross';
import GenericButton from '../../components/Buttons/GenericButton';
import AccountNameInput from '../../components/AccountNameInput';
import { useDispatch, useSelector } from 'react-redux';
import ErrorText from '../../components/ErrorText';
import { store } from '../../store';
import { event } from '../../utils';

const NewAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const encryptedMasterNode = useSelector(
    (state) => state.wallet.encryptedMasterNode
  );
  const encryptedChainCodeMasterNode = useSelector(
    (state) => state.wallet.encryptedChainCodeMasterNode
  );
  const password = useSelector((state) => state.auth.pincode);
  const index = useSelector((state) => state.wallet.wallets.length);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createAccount = async () => {
    setError('');
    setLoading(true);

    if (!name) {
      setError('Please enter a name for your account');
      setLoading(false);
      return;
    }

    const masterNode = await decryptMasterNode(
      encryptedMasterNode,
      encryptedChainCodeMasterNode,
      password
    );

    const wallet = await generateWallet(
      masterNode,
      password,
      name,
      index,
      store.getState().settings.network
    );

    dispatch(addWallet(wallet));
    dispatch(setActiveWallet(wallet.address));
    dispatch(createAccountInState(wallet.address));

    event('new_wallet', {
      method: 'generate_wallet',
      address: wallet.address,
    });

    setLoading(false);

    // TODO: show toast
    navigate('/');
  };

  return (
    <div className="h-screen pt-4 flex flex-col justify-start items-center relative">
      <CloseCross />
      <p className="text-white text-lg font-semibold mb-4 mx-auto">
        New Account
      </p>
      <img
        src={Logo}
        alt="logo"
        className="w-20 h-20 mx-auto mt-28 opacity-40"
      />
      <AccountNameInput name={name} setName={setName} />
      <GenericButton
        text="Create Account"
        className="w-72 font-500 my-2" // TODO: move this to the bottom of the screen
        onClick={createAccount}
        loading={loading}
      />
      {error && <ErrorText error={error} className={'mx-auto'} />}
    </div>
  );
};

export default NewAccount;
