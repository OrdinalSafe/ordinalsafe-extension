import { ClipboardIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { copyToClipboard } from '../utils';

const InscriptionDetail = ({ label, value, copyable = null }) => {
  return (
    <div className="flex flex-row w-full px-4 my-1 items-center justify-between">
      <p className="text-white text-md">{label}</p>
      <p className="text-gray-400 text-md flex flex-row justify-center items-center">
        {value}
        {copyable && (
          <ClipboardIcon
            className="w-4 ml-2 text-gray-400 cursor-pointer"
            onClick={() => copyToClipboard(copyable)}
          />
        )}
      </p>
    </div>
  );
};

export default InscriptionDetail;
