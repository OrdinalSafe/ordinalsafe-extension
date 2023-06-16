import {
  ChevronRightIcon,
  ClipboardIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import React from 'react';
import { copyToClipboard, truncateAddress } from '../utils';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { removeContactByIndex } from '../store/features/settings';

export const ContactItem = ({ index, name, address }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const clickInner = (e, func) => {
    e.stopPropagation();
    func();
  };

  const handleRemoveContact = () => {
    dispatch(removeContactByIndex(index));
  };

  return (
    <div
      className={`flex flex-row h-16 w-full shrink-0 bg-lightblue rounded-xl my-1 justify-start items-center py-2 px-4`}
    >
      <TrashIcon
        className="w-10 h-10 text-white bg-gray-600 p-2 rounded-full mr-4 cursor-pointer hover:bg-white hover:text-blue-500 transition:all duration-200"
        onClick={handleRemoveContact}
      />
      <div className="flex flex-col">
        <p className="text-white text-md font-semibold text-left">{name}</p>
        <p className="text-gray-300 text-md font-500 text-left">
          {truncateAddress(address)}
        </p>
      </div>
      <p
        className="text-white text-md font-semibold text-left ml-auto bg-gray-600 rounded-full p-2 px-4 cursor-pointer hover:bg-white hover:text-blue-500 transition:all duration-200"
        onClick={(e) => clickInner(e, () => copyToClipboard(address))}
      >
        Copy
      </p>
    </div>
  );
};
