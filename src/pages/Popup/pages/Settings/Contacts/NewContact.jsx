import React, { useState } from 'react';
import {
  canDecrypt,
  decryptMasterNode,
  generateWallet,
} from 'controllers/WalletController';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../assets/icon.png';
import { SettingsItem } from '../../../components/SettingsItem';
import { CloseCross } from '../../../components/CloseCross';
import GenericButton from '../../../components/Buttons/GenericButton';
import AccountNameInput from '../../../components/AccountNameInput';
import AddressInput from '../../../components/AddressInput';
import { useDispatch, useSelector } from 'react-redux';
import { addContact } from 'store/features/settings';
import { validateAddress } from '../../../utils';
import ErrorText from '../../../components/ErrorText';

const NewContact = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const network =
    useSelector((state) => state.settings.network).bech32 === 'tb'
      ? 'testnet'
      : 'mainnet';
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [error2, setError2] = useState('');

  const createContact = () => {
    setLoading(true);
    setError('');
    setError2('');
    if (!name) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (!validateAddress(address, network)) {
      setError2('Invalid address');
      setLoading(false);
      return;
    }

    const contact = {
      name,
      address,
    };

    dispatch(addContact(contact));
    setLoading(false);

    // TODO: show toast
    navigate('/settings/contacts');
  };

  return (
    <div className="h-window pt-4 flex flex-col justify-start items-center relative">
      <CloseCross />
      <p className="text-white text-lg font-semibold mb-4 mx-auto">
        New Contact
      </p>
      <img
        src={Logo}
        alt="logo"
        className="w-20 h-20 mx-auto mt-28 opacity-40"
      />
      <AccountNameInput name={name} setName={setName} error={error} />
      <AddressInput address={address} setAddress={setAddress} error={error2} />
      {(error || error2) && (
        <ErrorText error={error || error2} className={'absolute bottom-20'} />
      )}
      <GenericButton
        text="Create Contact"
        className="w-72 font-500 my-2 absolute bottom-8"
        loading={loading}
        onClick={createContact}
      />
    </div>
  );
};

export default NewContact;
