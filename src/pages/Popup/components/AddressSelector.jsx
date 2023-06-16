import { ChevronDownIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';
import ContactModal from '../pages/ContactModal';
import { validateAddress } from '../utils';
import { useSelector } from 'react-redux';

const AddressSelector = ({ address, setAddress, error }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setAddress={setAddress}
      />
      <div className="flex flex-col justify-start items-start my-4 relative">
        <label htmlFor="address" className="mb-1 text-gray-500 font-500">
          Address
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoComplete="off"
          className={`text-white w-72 h-10 ml-1 rounded-2xl bg-lightblue pl-3 pr-8 py-2 overflow-y-scroll text-xs placeholder-gray-400 hover:bg-lightblue focus:bg-lightblue focus:outline-0 ${
            error ? 'border border-error' : ''
          }`}
          placeholder="Enter Recipient's Address"
        />
        <ChevronDownIcon
          className="w-6 h-6 text-white absolute bottom-2 right-2 cursor-pointer"
          onClick={openModal}
        />
      </div>
    </>
  );
};

export default AddressSelector;
