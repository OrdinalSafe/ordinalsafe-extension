import React from 'react';
import GenericButton from '../../../components/Buttons/GenericButton';

const ChooseWallet = ({ walletType, setWalletType }) => {
  return (
    <div className="flex flex-col h-screen justify-around rounded-2xl items-center py-8 px-4">
      <p className="text-2xl font-500 text-white mb-4">Choose a Wallet</p>
      <div>
        <GenericButton
          text="OrdinalSafe"
          color="gray-600"
          onClick={() => setWalletType('OrdinalSafe')}
          className={`w-64 h-12 my-4 rounded-3xl text-white font-500 text-sm ${
            walletType === 'OrdinalSafe' ? 'bg-primary' : 'bg-gray-500'
          }`}
        />
        <GenericButton
          text="Unisat"
          color="gray-600"
          onClick={() => setWalletType('Unisat')}
          className={`w-64 h-12 my-4 rounded-3xl text-white font-500 text-sm ${
            walletType === 'Unisat' ? 'bg-primary' : 'bg-gray-500'
          }`}
        />
        <GenericButton
          text="Sparrow Wallet (Soon)"
          color="gray-600"
          onClick={() => setWalletType('Sparrow Wallet')}
          className={`w-64 h-12 my-4 rounded-3xl text-white font-500 text-sm ${
            walletType === 'Sparrow Wallet' ? 'bg-primary' : 'bg-gray-500'
          }`}
          disabled={true}
        />
      </div>
    </div>
  );
};

export default ChooseWallet;
