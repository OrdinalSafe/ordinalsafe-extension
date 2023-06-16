import React, { useState } from 'react';
import {
  canDecrypt,
  decryptMasterNode,
  generateWallet,
} from 'controllers/WalletController';
import { useLocation, useNavigate } from 'react-router-dom';
import { addWallet, setActiveWalletByIndex } from 'store/features/wallet';
import Logo from '../../../assets/icon.png';
import { SettingsItem } from '../../../components/SettingsItem';
import { CloseCross } from '../../../components/CloseCross';
import GenericButton from '../../../components/Buttons/GenericButton';
import AccountNameInput from '../../../components/AccountNameInput';
import { useDispatch, useSelector } from 'react-redux';
import { truncateAddress } from '../../../utils';
import { changeWalletName } from 'store/features/wallet';

const EditContact = () => {
  const location = useLocation();
  const { index } = location.state;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState('');

  const wallet = useSelector((state) => state.wallet.wallets[index]);

  const editAccount = () => {
    dispatch(changeWalletName({ index, name }));
    dispatch(setActiveWalletByIndex(index));

    // TODO: show toast
    navigate('/');
  };

  return (
    <div className="h-screen pt-4 flex flex-col justify-start items-center relative">
      <CloseCross />
      <p className="text-white text-lg font-semibold mb-4 mx-auto">
        Edit Account
      </p>
      <img
        src={Logo}
        alt="logo"
        className="w-20 h-20 mx-auto mt-28 mb-10 opacity-40"
      />
      <p className="text-white text-xs mr-auto ml-8">
        Account Name: {wallet.name}
      </p>
      <p className="text-white text-xs mr-auto ml-8">
        Account Address: {truncateAddress(wallet.address)}
      </p>
      <AccountNameInput name={name} setName={setName} />
      <GenericButton
        text="Save"
        className="w-72 font-500 my-2" // TODO: move this to the bottom of the screen
        onClick={editAccount}
      />
    </div>
  );
};

export default EditContact;
