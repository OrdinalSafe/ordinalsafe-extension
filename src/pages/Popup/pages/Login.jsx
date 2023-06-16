import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HEAVY_REQUEST_TYPE, LOGIN_INSIDE_POPUP_REQUEST } from '~/types';
import {
  canDecrypt,
  decryptMasterNode,
  generateWallet,
} from 'controllers/WalletController';
import { setLock, setPincode } from '../store/features/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { store } from '../store';
import {
  addWallet,
  setActiveWallet,
  setEncryptedChainCodeMasterNode,
  setEncryptedMasterNode,
  setEncryptedMnemonic,
} from '../store/features/wallet';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import PasswordInput from '../components/PasswordInput';
import LoginButton from '../components/Buttons/LoginButton';
import GenericButton from '../components/Buttons/GenericButton';
import Logo from '../assets/icon.png';
import InitContainer from '../components/Containers/InitContainer';
import { event } from '../utils';
import ErrorText from '../components/ErrorText';
import {
  encryptMasterNode,
  encryptMnemonic,
  legacyCanDecrypt,
  legacyDecryptMasterNode,
  legacyDecryptMnemonic,
} from '../../../controllers/WalletController';
import { createAccount } from '../store/features/account';

let shouldUnload = false;

const Login = () => {
  const { state } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [changePassword1, setChangePassword1] = useState('');
  const [changePassword2, setChangePassword2] = useState('');

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMigration, setIsMigration] = useState();
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    // handeLogin if user clicks enter
    const handleEnter = async (e) => {
      if (e.key === 'Enter') {
        await handleLogin();
      }
    };

    window.addEventListener('keydown', handleEnter);

    return () => {
      window.removeEventListener('keydown', handleEnter);
    };
  }, [password]);

  useEffect(() => {
    if (password) {
      setError('');
    }
  }, [password]);

  const handleMigration = async () => {
    setLoading(true);
    setError('');

    if (changePassword1.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (changePassword1 !== changePassword2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    setIsMigration(
      'Wallet is migrating to new version, this may take a while. Please do not close the extension.'
    );

    // sleep for 0.5 second to prevent UI from freezing
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const legacyEncrypted = store.getState().wallet.legacyEncryptedMasterNode;
      // get decrypted master node
      const masterNode = legacyDecryptMasterNode(
        legacyEncrypted,
        store.getState().wallet.legacyEncryptedChainCodeMasterNode,
        password
      );

      // get decrypted mnemonic
      const mnemonic = legacyDecryptMnemonic(
        store.getState().wallet.legacyEncryptedMnemonic,
        password
      );

      // encrypt master node with new encryption
      const { encrypted, encryptedChainCode } = await encryptMasterNode(
        masterNode,
        changePassword1
      );

      // encrypt mnemonic with new encryption
      const encryptedMnemonic = await encryptMnemonic(
        mnemonic,
        changePassword1
      );

      // generate the first wallet
      const wallet = await generateWallet(masterNode, changePassword1);

      // set new encrypted master node
      dispatch(setEncryptedMasterNode(encrypted));
      // set new encrypted chain code
      dispatch(setEncryptedChainCodeMasterNode(encryptedChainCode));
      // set new encrypted mnemonic
      dispatch(setEncryptedMnemonic(encryptedMnemonic));
      // set wallet 0
      dispatch(addWallet(wallet));
      // set account
      dispatch(createAccount(wallet.address));

      // continue as regular login
      const canDecryptWallet = await canDecrypt(
        store.getState().wallet.encryptedMasterNode,
        changePassword1
      );
      if (canDecryptWallet) {
        dispatch(setPincode(changePassword1));
        dispatch(setLock(false));

        event('migration', {
          address: store.getState().wallet.activeWallet.address,
          success: true,
        });

        event('login', {
          address: store.getState().wallet.activeWallet.address,
        });
        navigate('/');
      } else {
        event('migration', {
          address: store.getState().wallet.activeWallet.address,
          success: false,
        });
        console.log('Error migrating wallet');
        setIsMigration();
        setError(
          'Error migrating wallet, please try again or reinstall the extension with your mnemonic'
        );
      }
    } catch (error) {
      event('migration', {
        address: store.getState().wallet.activeWallet.address,
        success: false,
      });
      setIsMigration();
      setError(error.message);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const legacyEncrypted = store.getState().wallet.legacyEncryptedMasterNode;
      const newEncrypted = store.getState().wallet.encryptedMasterNode;
      if (legacyEncrypted && !newEncrypted) {
        console.log('legacy encrypted found, migrating');
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (legacyCanDecrypt(legacyEncrypted, password)) {
          setIsMigration(
            'Wallet is migrating to new version, this may take a while. Please do not close the extension.'
          );
          setError('');
          setIsMigration();
          setLoading(false);
          setIsMigrating(true);
          return;
        } else {
          setIsMigration();
          setError('Wrong password');
          setLoading(false);
          return;
        }
      } else {
        console.log('continue regular login');
      }
      setIsMigration();

      // continue as regular login
      const canDecryptWallet = await canDecrypt(
        store.getState().wallet.encryptedMasterNode,
        password
      );
      if (canDecryptWallet) {
        dispatch(setPincode(password));
        dispatch(setLock(false));

        if (state && state.from) {
          const path = state.from;
          if (path) navigate(path);
          else navigate('/');
        } else {
          // only send login event if user is not logging in from a dapp
          event('login', {
            address: store.getState().wallet.activeWallet.address,
          });
          navigate('/');
        }
      } else {
        console.log('wrong password');
        setError('Wrong password');
      }
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <InitContainer>
      <img src={Logo} alt="logo" className="w-24 mb-4 opacity-30" />
      {!isMigrating ? (
        <>
          <p className="text-white text-xl font-500 mb-8 mt-4">
            Enter your password
          </p>
          <PasswordInput
            password={password}
            setPassword={setPassword}
            error={error}
          />
          {error && (
            <ErrorText error={error} className={'absolute bottom-20'} />
          )}
          {isMigration && (
            <ErrorText error={isMigration} className={'absolute bottom-20'} />
          )}
          {/* Fix button to bottom */}
          <LoginButton
            onClick={handleLogin}
            w={72}
            className={'absolute bottom-8'}
            loading={loading}
          />
        </>
      ) : (
        <>
          <p className="text-gray-400 text-xs font-500 mt-4">
            OrdinalSafe is upgraded to a new version. You are requested to
            change your password to continue.
          </p>
          <p className="text-white text-xl font-500 mb-4 mt-4">
            Enter new password
          </p>
          <PasswordInput
            password={changePassword1}
            setPassword={setChangePassword1}
            error={error}
          />
          <PasswordInput
            password={changePassword2}
            setPassword={setChangePassword2}
            error={error}
            confirm={true}
          />
          {error && (
            <ErrorText error={error} className={'absolute bottom-20'} />
          )}
          {isMigration && (
            <p className="text-white text-xs font-500 absolute bottom-20">
              {isMigration}
            </p>
          )}
          {/* Fix button to bottom */}
          <GenericButton
            text="Change Password"
            onClick={handleMigration}
            w={72}
            className={'absolute bottom-8'}
            loading={loading}
          />
        </>
      )}
    </InitContainer>
  );
};

export default Login;
