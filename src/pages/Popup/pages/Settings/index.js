import React from 'react';
import { SettingsItem } from '../../components/SettingsItem';
import { CloseCross } from '../../components/CloseCross';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen pt-4 flex flex-col justify-start items-start relative">
      <CloseCross />
      <p className="text-white text-lg font-semibold mb-4 mx-auto">Settings</p>
      <SettingsItem
        label="Manage Accounts"
        onClick={() => navigate('/settings/accounts')}
      />
      <SettingsItem
        label="Manage Contacts"
        onClick={() => navigate('/settings/contacts')}
      />
      {/* <SettingsItem label='Authorized Apps' onClick={() => navigate('/settings/accounts')} /> */}
      <SettingsItem
        label="Developer Settings"
        onClick={() => navigate('/settings/developer')}
      />
      <SettingsItem
        label="Manage Wallet"
        onClick={() => navigate('/settings/wallet')}
      />
    </div>
  );
};

export default Settings;
