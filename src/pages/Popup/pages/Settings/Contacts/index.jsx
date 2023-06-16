import React, { useState } from 'react';
import { SettingsItem } from '../../../components/SettingsItem';
import { CloseCross } from '../../../components/CloseCross';
import { useNavigate } from 'react-router-dom';
import { setActiveWallet } from 'store/features/wallet';
import { useDispatch, useSelector } from 'react-redux';
import { AccountItem } from '../../../components/AccountItem';
import GenericButton from '../../../components/Buttons/GenericButton';
import { addContact, removeContactByIndex } from 'store/features/settings';
import { ContactItem } from '../../../components/ContactItem';
import GoBackButton from '../../../components/Buttons/GoBackButton';
import { GoBackChevron } from '../../../components/GoBackChevron';

const Contacts = () => {
  const navigate = useNavigate();
  const network = useSelector((state) => state.settings.network).bech32;
  const contacts = useSelector((state) => state.settings.contacts)[network];

  const dispatch = useDispatch();

  const [address, setAddress] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="h-full pt-4 flex flex-col justify-start items-start relative">
      <GoBackChevron route="/settings" />
      <p className="text-white text-lg font-semibold mb-4 mx-auto">Contacts</p>
      <div className="w-full flex flex-col justify-start items-start h-activity max-h-activity min-y-activity overflow-y-scroll">
        {contacts &&
          contacts.map((contact, index) => (
            <ContactItem
              key={index}
              name={contact.name}
              address={contact.address}
            />
          ))}
      </div>
      <GenericButton
        text="+ New Contact"
        className="w-full font-500 my-auto"
        onClick={() => navigate('/settings/contacts/new')}
      />
    </div>
  );
};

export default Contacts;
