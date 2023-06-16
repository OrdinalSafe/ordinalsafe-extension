import React, { useState, useEffect } from 'react';
import {
  generateMnemonicAndSeed,
  generateMasterNode,
  generateWallet,
  encryptMnemonic,
  encryptMasterNode,
} from 'controllers/WalletController';
import { useDispatch } from 'react-redux';
import { initWallet } from 'store/features/wallet';
import { setLock, setPincode } from 'store/features/auth';
import CreateWalletContainer from '../../../components/Containers/CreateWalletContainer';
import ShowMnemonic from './ShowMnemonic';
import VerifyMnemonic from './VerifyMnemonic';
import GenericButton from '../../../components/Buttons/GenericButton';
import SetPassword from './SetPassword';
import FinishFlow from './FinishFlow';
import ErrorText from '../../../components/ErrorText';
import { event } from '../../../utils';
import { createAccount } from '../../../store/features/account';

const CreateWallet = () => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(0);

  const [mnemonic, setMnemonic] = useState('');
  const [seed, setSeed] = useState('');

  const [emptyWords, setEmptyWords] = useState(['', '', '', '']);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const [mnemonic, seed] = generateMnemonicAndSeed();
    setMnemonic(mnemonic);
    setSeed(seed);
    setLoading(false);
  }, []);

  const nextStep = async () => {
    setError('');
    if (step === 1) {
      if (!verifyMnemonic()) return;
    } else if (step === 2) {
      if (!(await completeCreateWalletFlow())) return;
    } else if (step === 3) {
      // close tab
      window.close();
    }
    setStep(step + 1);
  };

  const verifyMnemonic = () => {
    setLoading(true);
    setError('');

    const mnemonicArray = mnemonic.split(' ');
    // empty words are index 2 5 8 11
    const correctWords = [
      mnemonicArray[2],
      mnemonicArray[5],
      mnemonicArray[8],
      mnemonicArray[11],
    ];
    const emptyWordsArray = emptyWords.filter(
      (word) => word !== '' && word !== null && word !== undefined
    );
    const correct = emptyWordsArray.every(
      (word, index) => word.trim() === correctWords[index]
    );

    if (!correct) {
      setError('Seed phrase is incorrect');
      setLoading(false);
      return false;
    }

    setLoading(false);
    return true;
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
      const masterNode = generateMasterNode(seed);

      // TODO: move to worker
      const wallet = await generateWallet(masterNode, password);

      const encryptedMnemonic = await encryptMnemonic(mnemonic, password);

      // TODO: move to worker
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
        method: 'create_wallet',
        address: wallet.address,
      });
    } catch (e) {
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
        {[...Array(4 - step)].map((_, index) => {
          return (
            <div
              key={index}
              className="w-4 h-4 rounded-full bg-gray-800 z-10"
            ></div>
          );
        })}
        {/* line goes through these three */}
        <div className="w-72 h-1 rounded-full bg-gray-800 absolute z-0"></div>
      </div>
      {step === 0 && <ShowMnemonic mnemonic={mnemonic.split(' ')} />}
      {step === 1 && (
        <VerifyMnemonic
          mnemonic={mnemonic.split(' ')}
          emptyWords={emptyWords}
          setEmptyWords={setEmptyWords}
        />
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
        loading={loading}
        w={72}
        className="absolute bottom-8 right-8"
      />
    </CreateWalletContainer>
  );
};

export default CreateWallet;
