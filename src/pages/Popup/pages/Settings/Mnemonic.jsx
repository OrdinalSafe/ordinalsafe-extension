import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { decryptMnemonic } from 'controllers/WalletController';
import { GoBackChevron } from '../../components/GoBackChevron';
import GenericButton from '../../components/Buttons/GenericButton';
import ErrorText from '../../components/ErrorText';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { copyToClipboard } from '../../utils';

const Mnemonic = () => {
  const encryptedMnemonic = useSelector(
    (state) => state.wallet.encryptedMnemonic
  );

  const passwordFromState = useSelector((state) => state.auth.pincode);

  const [mnemonic, setMnemonic] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const revealMnemonic = async () => {
    setError('');
    setLoading(true);

    if (!password || password !== passwordFromState) {
      console.log('incorrect password');
      setError('Incorrect password');
      setLoading(false);
      return;
    }

    const mnemonic = await decryptMnemonic(encryptedMnemonic, password);
    setMnemonic(mnemonic);

    setLoading(false);
  };

  return (
    <div className="h-full pt-4 flex flex-col justify-start items-start relative">
      <GoBackChevron route="/settings/wallet" />
      <p className="text-white text-lg font-semibold mb-4 mx-auto">
        Seed Phrase
      </p>

      <input
        type="password"
        placeholder="Enter Password"
        className="text-white w-72 mx-auto h-10 rounded-2xl bg-lightblue px-3 py-2 text-xs placeholder-gray-400 hover:bg-lightblue focus:bg-lightblue focus:outline-0"
        onChange={(e) => setPassword(e.target.value)}
      />
      <GenericButton
        text="Reveal Seed Phrase"
        className="w-72 font-500 mx-auto my-2 bg-secondary"
        onClick={() => revealMnemonic()}
        loading={loading}
      />
      {error && <ErrorText error={error} className={'mx-auto'} />}

      {mnemonic && (
        <div className="flex flex-col justify-start items-start w-72 mx-auto my-8">
          <p className="text-gray-400 text-xs font-500 ">
            Anyone with your seed phrase can access your funds. Please store it
            securely and do not share with anyone!
          </p>
          <div className="grid grid-cols-3 gap-4 mx-auto mt-2">
            {mnemonic.split(' ').map((word, index) => (
              <div
                key={index}
                className="flex flex-row pl-2 justify-start items-center w-24 h-8 rounded-3xl bg-secondary text-white"
              >
                <p className="text-xs text-gray-500 pr-2">{index + 1}.</p>
                <p className="text-xs font-500">{word}</p>
              </div>
            ))}
          </div>
          <p
            className="text-sm text-white my-8 mx-auto cursor-pointer"
            onClick={() => copyToClipboard(mnemonic)}
          >
            <ClipboardIcon className="w-4 h-4 text-white font-bold inline-block mr-1 cursor-pointer" />{' '}
            Copy
          </p>
        </div>
      )}
    </div>
  );
};

export default Mnemonic;
