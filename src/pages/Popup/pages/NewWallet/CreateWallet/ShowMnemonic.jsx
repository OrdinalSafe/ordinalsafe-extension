import React from 'react';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { copyToClipboard } from '../../../utils';

const ShowMnemonic = ({ mnemonic }) => {
  return (
    <div className="flex flex-col h-screen justify-around items-center py-8 px-4">
      <p className="text-2xl font-500 text-white mb-4">
        Write down your Seed Phrase
      </p>
      <p className="text-sm font-500 text-gray-500 mb-4">
        Your seed phrase is the key to your wallet. If you lose it, you lose
        access to your funds.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {mnemonic.map((word, index) => (
          <div
            key={index}
            className="flex flex-row pl-2 justify-start items-center w-24 h-8 rounded-3xl bg-customDark text-white"
          >
            <p className="text-xs text-gray-500 pr-2">{index + 1}.</p>
            <p className="text-xs font-500">{word}</p>
          </div>
        ))}
      </div>
      <p
        className="text-sm text-white my-8 cursor-pointer"
        onClick={() => copyToClipboard(mnemonic.join(' '))}
      >
        <ClipboardIcon className="w-4 h-4 text-white font-bold inline-block mr-1 cursor-pointer" />{' '}
        Copy
      </p>
    </div>
  );
};

export default ShowMnemonic;
