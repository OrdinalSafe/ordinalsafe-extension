import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { decryptAddress } from 'controllers/WalletController';
import GenericButton from '../../components/Buttons/GenericButton';
import { GoBackChevron } from '../../components/GoBackChevron';
import ErrorText from '../../components/ErrorText';

const PrivateKey = () => {
  const encryptedPrivKey = useSelector(
    (state) => state.wallet.encryptedMasterNode
  );
  const encryptedChainCode = useSelector(
    (state) => state.wallet.encryptedChainCodeMasterNode
  );
  const passwordFromState = useSelector((state) => state.auth.pincode);
  const network = useSelector((state) => state.settings.network);

  const [privateKey, setPrivateKey] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const revealPrivateKey = async () => {
    setError('');
    setLoading(true);

    if (!password || password !== passwordFromState) {
      setError('Incorrect password');
      setLoading(false);
      return;
    }

    const address = await decryptAddress(
      encryptedPrivKey,
      encryptedChainCode,
      password,
      network
    );
    setPrivateKey(address.privateKey.toString('hex'));

    setLoading(false);
  };

  return (
    <div className="h-full pt-4 flex flex-col justify-start items-start relative">
      <GoBackChevron route="/settings/wallet" />
      <p className="text-white text-lg font-semibold mb-4 mx-auto">
        Private Key
      </p>

      <input
        type="password"
        placeholder="Enter Password"
        className="text-white w-72 mx-auto h-10 rounded-2xl bg-lightblue px-3 py-2 text-xs placeholder-gray-400 hover:bg-lightblue focus:bg-lightblue focus:outline-0"
        onChange={(e) => setPassword(e.target.value)}
      />
      <GenericButton
        text="Reveal Private Key"
        className="w-72 font-500 mx-auto my-2 bg-secondary"
        onClick={() => revealPrivateKey()}
        loading={loading}
      />
      {error && <ErrorText error={error} className={'mx-auto'} />}

      {privateKey && (
        <div className="flex flex-col justify-start items-start w-72 mx-auto my-8">
          <p className="text-gray-400 text-xs font-500 ">
            Anyone with your private key can access your funds. Please store it
            securely and do not share with anyone!
          </p>
          <textarea
            className="w-72 h-12 rounded-2xl bg-secondary text-white text-xs font-500 px-3 py-2 mt-2 resize-none"
            value={privateKey}
            readOnly
          />
        </div>
      )}
    </div>
  );
};

export default PrivateKey;
