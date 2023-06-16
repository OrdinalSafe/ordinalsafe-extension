import React from 'react';
import { copyToClipboard, truncateAddress, truncateName } from '../utils';
import { ClipboardIcon } from '@heroicons/react/20/solid';

const AddressBox = ({ name, address }) => {
  return (
    <div className="flex flex-column justify-center items-center my-4">
      <p className="w-72 h-10 text-left align-center flex justify-start items-center pl-4 rounded-xl bg-dropdown font-semibold text-white text-xs px-1 py-2 text-sm hover:bg-dropdown focus:bg-dropdown focus:outline-0">
        {truncateName(name)}
        <span className="text-gray-400 pl-1">({truncateAddress(address)})</span>
        <span
          className="absolute right-8 w-8 h-8 px-8 rounded-xl bg-gray-700 flex flex-row justify-center items-center ml-2 cursor-pointer font-white hover:bg-primary transition-colors duration-200 ease-in-out"
          onClick={() => copyToClipboard(address)}
        >
          Copy
        </span>
      </p>
    </div>
  );
};

export default AddressBox;
