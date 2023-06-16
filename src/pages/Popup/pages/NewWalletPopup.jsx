import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { openTab } from 'shared/helpers';
import InitContainer from '../components/Containers/InitContainer';
import Logo from '../assets/icon.png';
import GenericButton from '../components/Buttons/GenericButton';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';
import { setLegacy } from '../store/features/wallet';
import Spinner from '../components/Spinner';

const NewWalletPopup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMigration, setIsMigration] = useState(false);
  const [isMigrated, setIsMigrated] = useState(false);

  useEffect(() => {
    const checkLegacyStorage = async () => {
      const { encrypted } = await chrome.storage.local.get('encrypted');
      if (encrypted && store.getState().wallet.encryptedMasterNode === '') {
        console.log('Found legacy storage, starting migration');
        setIsMigration(true);
        const { encryptedChainCode, encryptedMnemonic } =
          await chrome.storage.local.get([
            'encryptedChainCode',
            'encryptedMnemonic',
          ]);

        dispatch(
          setLegacy({
            encrypted,
            encryptedChainCode,
            encryptedMnemonic,
          })
        );

        if (store.getState().wallet.legacyEncryptedMasterNode === '') {
          setError(true);
          setLoading(false);
          return;
        }

        setIsMigrated(true);
        setLoading(false);

        navigate('/init/login');
      } else {
        console.log('No legacy storage found, continuing');
        setLoading(false);
      }
    };

    checkLegacyStorage();
  }, []);

  const initFlow = (tab) => {
    openTab(tab);
    window.close();
  };

  return (
    <InitContainer>
      <img src={Logo} alt="Logo" className="w-32" />
      <h1 className="text-white text-3xl font-bold mt-4">OrdinalSafe</h1>
      <p className="text-gray-500 text-xs mt-4">
        The leading ordinals first Bitcoin extension wallet
      </p>
      {loading && <Spinner align="center" w={32} h={32} />}
      {isMigration && (
        <p className="text-white text-md font-semibold mt-4">
          {isMigrated
            ? 'Migration from old version complete, redirecting to login'
            : 'Migrating from old version...'}
        </p>
      )}
      {error && (
        <p className="text-white text-md font-semibold mt-4">
          Error migrating from old version, please try again by refreshing the
          page
        </p>
      )}
      {!loading && !isMigration && (
        <GenericButton
          onClick={() => initFlow('init/new-wallet')}
          text="Get Started!"
          className="absolute bottom-24 font-500"
          w={72}
        />
      )}
    </InitContainer>
  );
};

export default NewWalletPopup;
