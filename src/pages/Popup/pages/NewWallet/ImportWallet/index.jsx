import React, { useState, useEffect } from 'react';
import {
  generateSeed,
  generateMasterNode,
  generateWallet,
  encryptMnemonic,
  encryptMasterNode,
} from 'controllers/WalletController';
import { useDispatch } from 'react-redux';
import { initWallet } from 'store/features/wallet';
import { setLock, setPincode } from 'store/features/auth';
import CreateWalletContainer from '../../../components/Containers/CreateWalletContainer';
import GenericButton from '../../../components/Buttons/GenericButton';
import ChooseWallet from './ChooseWallet';
import ImportMnemonic from './ImportMnemonic';
import SetPassword from '../CreateWallet/SetPassword';
import FinishFlow from '../CreateWallet/FinishFlow';
import ErrorText from '../../../components/ErrorText';
import { event } from '../../../utils';
import { createAccount } from '../../../store/features/account';

const ImportWallet = () => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(0);

  const [walletType, setWalletType] = useState('OrdinalSafe');

  const [mnemonic, setMnemonic] = useState(Array(12).fill(''));
  const [seed, setSeed] = useState('');

  const [emptyWords, setEmptyWords] = useState(['', '', '', '']);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {}, []);

  const nextStep = async () => {
    setError('');
    if (step === 1) {
      // check no empty words
      if (mnemonic.some((word) => word === '')) {
        setError('Please fill all the words');
        return;
      }
    } else if (step === 2) {
      if (!(await completeCreateWalletFlow())) return;
    } else if (step === 3) {
      // close tab
      window.close();
    }
    setStep(step + 1);
  };

  const completeCreateWalletFlow = async () => {
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return false;
    }

    try {
      const trimmedMnemonic = mnemonic.map((word) => word.trim()).join(' ');

      const seed = generateSeed(trimmedMnemonic);

      const masterNode = generateMasterNode(seed);

      const wallet = await generateWallet(masterNode, password);

      const encryptedMnemonic = await encryptMnemonic(
        mnemonic.join(' '),
        password
      );
      const {
        encrypted: encryptedMasterNode,
        encryptedChainCode: encryptedChainCodeMasterNode,
      } = await encryptMasterNode(masterNode, password);

      dispatch(
        initWallet({
          wallet,
          encryptedMnemonic,
          encryptedMasterNode,
          encryptedChainCodeMasterNode,
        })
      );

      dispatch(createAccount(wallet.address));

      dispatch(setLock(false));
      dispatch(setPincode(password));

      setStep(3);

      event('new_wallet', {
        method: 'import_wallet',
        wallet_type: walletType,
        address: wallet.address,
      });
    } catch (e) {
      console.log(e);
      setError('An error occured, please try again');
      setLoading(false);
      return false;
    }

    setLoading(false);
    return true;
  };

  return (
    <CreateWalletContainer>
      <div className="flex flex-row justify-around items-center mt-4">
        {/* circle */}
        {[...Array(step + 1)].map((_, index) => {
          return (
            <div
              key={index}
              className="w-4 h-4 rounded-full bg-primary z-10"
            ></div>
          );
        })}
        {[...Array(3 - step)].map((_, index) => {
          return (
            <div
              key={index}
              className="w-4 h-4 rounded-full bg-gray-800 z-10"
            ></div>
          );
        })}
        {/* line goes through these three */}
        <div className="w-60 h-1 rounded-full bg-gray-800 absolute z-0"></div>
      </div>
      {step === 0 && (
        <ChooseWallet walletType={walletType} setWalletType={setWalletType} />
      )}
      {step === 1 && (
        <ImportMnemonic mnemonic={mnemonic} setMnemonic={setMnemonic} />
      )}
      {step === 2 && (
        <SetPassword
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />
      )}
      {step === 3 && <FinishFlow />}
      {error && <ErrorText error={error} />}
      <GenericButton
        text={step === 3 ? 'Finish' : 'Next'}
        onClick={nextStep}
        w={72}
        className="absolute bottom-8 right-8"
        loading={loading}
      />
    </CreateWalletContainer>
  );
};

export default ImportWallet;
