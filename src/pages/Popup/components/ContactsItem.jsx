import { ChevronRightIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { truncateAddress } from '../utils';

export const ContactsItem = ({ label, address, onClick }) => {
  return (
    <div
      className={`flex flex-row h-12 w-72 shrink-0 bg-lightblue rounded-xl my-2 justify-between items-center py-2 px-4 cursor-pointer hover:bg-primary transition:all duration-200`}
      onClick={onClick}
    >
      <p className="text-white font-semibold text-left">
        {label}{' '}
        <span className="text-gray-300 font-500 text-xs text-left">
          ({truncateAddress(address)})
        </span>
      </p>
    </div>
  );
};
