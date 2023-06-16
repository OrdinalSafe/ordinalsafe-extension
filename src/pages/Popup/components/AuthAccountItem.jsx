import {
  ChevronRightIcon,
  ClipboardIcon,
  PencilIcon,
} from '@heroicons/react/20/solid';
import React from 'react';
import { copyToClipboard, truncateAddress, truncateName } from '../utils';
import { useNavigate } from 'react-router-dom';

export const AuthAccountItem = ({
  name,
  address,
  selectedAddress,
  setSelectedAddress,
}) => {
  return (
    <div
      className={`flex flex-row h-12 w-72 shrink-0 bg-lightblue hover:${
        selectedAddress ? '' : 'bg-blue-700'
      } ${
        selectedAddress ? 'bg-primary' : ''
      } rounded-2xl my-1 justify-start items-center py-2 px-4 cursor-pointer transition:all duration-200`}
      onClick={() => setSelectedAddress(address)}
    >
      <div className="flex flex-col">
        <p className="text-white font-semibold text-left">
          {truncateName(name, 6)}{' '}
          <span className="text-gray-300 text-sm text-left">
            ({truncateAddress(address)})
          </span>
        </p>
      </div>
    </div>
  );
};
