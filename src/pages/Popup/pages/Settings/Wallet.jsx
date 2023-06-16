import React from 'react';
import { GoBackChevron } from '../../components/GoBackChevron';
import GenericButton from '../../components/Buttons/GenericButton';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
  const navigate = useNavigate();
  return (
    <div className="h-full pt-4 flex flex-col justify-start items-start relative">
      <GoBackChevron route="/settings" />
      <p className="text-white text-lg font-semibold mb-4 mx-auto">
        Wallet Settings
      </p>
      <GenericButton
        text="View Seed Phrase"
        className="w-72 font-500 mx-auto my-2 bg-secondary"
        onClick={() => navigate('/settings/mnemonic')}
      />
      <GenericButton
        text="Remove Wallet"
        className="w-72 font-500 mx-auto my-2 bg-secondary"
        onClick={() => navigate('/settings/remove-wallet')}
      />
    </div>
  );
};

export default Wallet;
