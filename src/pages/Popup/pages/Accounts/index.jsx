import React from 'react';
import { SettingsItem } from '../../components/SettingsItem';
import { CloseCross } from '../../components/CloseCross';
import { useLocation, useNavigate } from 'react-router-dom';
import { setActiveWallet } from 'store/features/wallet';
import { useDispatch, useSelector } from 'react-redux';
import { AccountItem } from '../../components/AccountItem';
import GenericButton from '../../components/Buttons/GenericButton';
import { GoBackChevron } from '../../components/GoBackChevron';

const Accounts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const isRouteSettings = location.pathname.includes('settings');

  const wallets = useSelector((state) => state.wallet.wallets);
  const activeWallet = useSelector((state) => state.wallet.activeWallet);

  const setAccount = (address) => {
    dispatch(setActiveWallet(address));
  };

  return (
    <div className="h-full pt-4 flex flex-col justify-start items-start relative">
      {isRouteSettings ? <GoBackChevron route="/settings" /> : <CloseCross />}
      <p className="text-white text-lg font-semibold mb-4 mx-auto">Accounts</p>
      <div className="w-full flex flex-col justify-start items-start h-activity max-h-activity min-y-activity overflow-y-scroll">
        {wallets.map((wallet, index) => (
          <AccountItem
            key={index}
            index={wallet.index}
            name={wallet.name}
            address={wallet.address}
            isActive={activeWallet.index === wallet.index}
            setAccount={() => setAccount(wallet.address)}
          />
        ))}
      </div>
      <GenericButton
        text="+ New Account"
        className="w-full font-500 my-auto"
        onClick={() => navigate('/accounts/new')}
      />
    </div>
  );
};

export default Accounts;
