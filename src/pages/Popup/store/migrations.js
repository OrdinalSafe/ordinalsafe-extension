import { initialState as accountInitialState } from './features/account';
import { initialState as settingsInitialState } from './features/settings';
import { initialState as authInitialState } from './features/auth';
import { initialState as walletInitialState } from './features/wallet';

export const legacyMigration = async (state, version) => {
  const { encryptedMnemonic } = await chrome.storage.local.get(
    'encryptedMnemonic'
  );
  const { encrypted: encryptedMasterNode } = await chrome.storage.local.get(
    'encrypted'
  );
  const { encryptedChainCode: encryptedChainCodeMasterNode } =
    await chrome.storage.local.get('encryptedChainCode');

  return {
    account: accountInitialState,
    settings: settingsInitialState,
    auth: authInitialState,
    wallet: {
      ...walletInitialState,
      encryptedMnemonic,
      encryptedMasterNode,
      encryptedChainCodeMasterNode,
    },
  };
};

const migrations = {};

export default migrations;
