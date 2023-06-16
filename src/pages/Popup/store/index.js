import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  createMigrate as defaultCreateMigrate,
} from 'redux-persist';

import { accountSlice, initialState } from './features/account';
import { settingsSlice } from './features/settings';
import { walletSlice } from './features/wallet';
import { ChromeStorage } from './storage';
import migrations, { legacyMigration } from './migrations';
import { authSlice } from './features/auth';
import { inscriptionsSlice } from './features/inscriptions';

const createMigrate = (migrations, config) => {
  const { debug } = config;
  return (state, version) => {
    const reduxMigrate = defaultCreateMigrate(migrations, config);

    if (!state) {
      if (debug) console.log('No state found, migrating from legacy storage.');
      return legacyMigration(state, version);
    } else {
      if (debug)
        console.log('State found, deleting legacy storage if it exists.');
      // TODO: Uncomment this when we're ready to remove legacy storage
      /* chrome.storage.local.remove([
        'address',
        'encrypted',
        'encryptedChainCode',
        'encryptedMnemonic',
        'innerHeight',
        'innerWidth',
        'windowHeight',
        'windowWidth',
        'xOnlyPubKey',
      ]); */
    }

    return reduxMigrate(state, version);
  };
};

const storage = new ChromeStorage(chrome.runtime, chrome.storage.local);
const sessionStorage = new ChromeStorage(
  chrome.runtime,
  chrome.storage.session
);

export const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['auth', 'inscriptions'],
  migrate: defaultCreateMigrate(migrations, {
    debug: process.env.NODE_ENV === 'development',
  }),
};

export const authPersistConfig = {
  key: 'auth',
  storage: sessionStorage,
};

const inscriptionsPersistConfig = {
  key: 'inscriptions',
  storage: sessionStorage,
};

const rootReducer = combineReducers({
  account: accountSlice.reducer,
  wallet: walletSlice.reducer,
  settings: settingsSlice.reducer,
  auth: persistReducer(authPersistConfig, authSlice.reducer),
  inscriptions: persistReducer(
    inscriptionsPersistConfig,
    inscriptionsSlice.reducer
  ),
});

const appReducer = (state, action) => {
  if (action.type === 'REMOVE_WALLET') {
    console.log('Removing wallet');

    // this applies to all keys defined in persistConfig(s)
    storage.removeItem('persist:root');
    sessionStorage.removeItem('persist:auth');
    sessionStorage.removeItem('persist:inscriptions');

    // flush all storage
    chrome.storage.local.clear();
    chrome.storage.session.clear();
    chrome.storage.sync.clear();

    state = undefined;
  }

  return rootReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, appReducer);

export const store = configureStore({
  state: {
    loading: false,
  },
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
