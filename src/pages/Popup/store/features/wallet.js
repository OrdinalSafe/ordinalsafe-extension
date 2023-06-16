import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  wallets: [],
  activeWallet: {
    name: '',
    address: '',
    xOnlyPubKey: '',
    encryptedPrivKey: '',
    encryptedChainCode: '',
    index: 0,
  },
  encryptedMnemonic: '',
  encryptedMasterNode: '',
  encryptedChainCodeMasterNode: '',
  legacyEncryptedMnemonic: '',
  legacyEncryptedMasterNode: '',
  legacyEncryptedChainCodeMasterNode: '',
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    initWallet: (state, action) => {
      state.wallets = [action.payload.wallet];
      state.activeWallet = action.payload.wallet;
      state.encryptedMnemonic = action.payload.encryptedMnemonic;
      state.encryptedMasterNode = action.payload.encryptedMasterNode;
      state.encryptedChainCodeMasterNode =
        action.payload.encryptedChainCodeMasterNode;
    },
    addWallet: (state, action) => {
      state.wallets.push(action.payload);
      state.activeWallet = action.payload;
    },
    setWallets: (state, action) => {
      state.wallets = action.payload;
    },
    setEncryptedMnemonic: (state, action) => {
      state.encryptedMnemonic = action.payload;
    },
    setEncryptedMasterNode: (state, action) => {
      state.encryptedMasterNode = action.payload;
    },
    setEncryptedChainCodeMasterNode: (state, action) => {
      state.encryptedChainCodeMasterNode = action.payload;
    },
    setLegacy: (state, action) => {
      state.legacyEncryptedMnemonic = action.payload.encryptedMnemonic;
      state.legacyEncryptedMasterNode = action.payload.encrypted;
      state.legacyEncryptedChainCodeMasterNode =
        action.payload.encryptedChainCode;
    },
    setActiveWallet: (state, action) => {
      const wallet = state.wallets.find(
        (wallet) => wallet.address === action.payload
      );
      state.activeWallet = wallet;
    },
    setActiveWalletByIndex: (state, action) => {
      const wallet = state.wallets.find(
        (wallet) => wallet.index === action.payload
      );
      state.activeWallet = wallet;
    },
    changeWalletName: (state, action) => {
      const walletToChange = state.wallets.find(
        (wallet) => wallet.index === action.payload.index
      );
      walletToChange.name = action.payload.name;

      if (state.activeWallet.index === action.payload.index) {
        state.activeWallet.name = action.payload.name;
      }

      state.wallets = state.wallets.map((wallet) => {
        if (wallet.index === action.payload.index) {
          return walletToChange;
        }
        return wallet;
      });
    },
    // Dangerous, only on remove wallet
    reset: (state, action) => {
      state = initialState;
    },
  },
});

export const {
  initWallet,
  addWallet,
  setWallets,
  setEncryptedMnemonic,
  setEncryptedMasterNode,
  setEncryptedChainCodeMasterNode,
  setLegacy,
  setActiveWallet,
  setActiveWalletByIndex,
  changeWalletName,
  reset: resetWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
