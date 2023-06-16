import { Dialog } from '@headlessui/react';
import React from 'react';
import GenericButton from '../components/Buttons/GenericButton';
import ActionButtons from '../components/ActionButtons';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CardScreenWrapper from '../components/Wrappers/CardScreenWrapper';
import { useSelector } from 'react-redux';
import { ContactsItem } from '../components/ContactsItem';

const ContactModal = ({ isOpen, onClose, setAddress }) => {
  const accounts = useSelector((state) => state.wallet.wallets);
  const network = useSelector((state) => state.settings.network).bech32;
  let contacts = useSelector((state) => state.settings.contacts)[network];

  const selectAndClose = (address) => {
    setAddress(address);
    onClose();
  };

  return (
    <div
      className={`${
        isOpen ? 'fixed' : 'hidden'
      } w-window h-window bg-center absolute -top-10 z-50`}
    >
      <CardScreenWrapper>
        <XMarkIcon
          className="w-6 text-white absolute left-5 top-4 pt-0.5 cursor-pointer"
          onClick={onClose}
        />
        <p className="text-white text-lg mb-4">Select Contact</p>
        <p className="text-gray-500 text-left text-xs">My Accounts</p>
        {accounts.map((account) => (
          <ContactsItem
            label={account.name}
            address={account.address}
            onClick={() => selectAndClose(account.address)}
          />
        ))}
        {contacts && contacts.length > 0 && (
          <p className="text-gray-500 text-left text-xs mt-4">Contacts</p>
        )}
        <div className="flex flex-col">
          {contacts.map((contact) => (
            <ContactsItem
              label={contact.name}
              address={contact.address}
              onClick={() => selectAndClose(contact.address)}
            />
          ))}
        </div>
      </CardScreenWrapper>
    </div>
  );
};

export default ContactModal;
