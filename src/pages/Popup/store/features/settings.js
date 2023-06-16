import { createSlice } from '@reduxjs/toolkit';
import { networks } from 'bitcoinjs-lib';

export const initialState = {
  network: networks.bitcoin,
  contacts: {
    tb: [],
    bc: [],
  },
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setContacts: (state, action) => {
      state.contacts[state.network.bech32] = [...action.payload];
    },
    addContact: (state, action) => {
      state.contacts[state.network.bech32].push(action.payload);
    },
    removeContact: (state, action) => {
      const index = state.contacts[state.network.bech32].findIndex(
        (contact) => contact.address === action.payload
      );
      if (index !== -1) {
        state.contacts[state.network.bech32].splice(index, 1);
      }
    },
    removeContactByIndex: (state, action) => {
      state.contacts[state.network.bech32].splice(action.payload, 1);
    },
    setNetwork: (state, action) => {
      if (action.payload === 'testnet') {
        state.network = networks.testnet;
      } else {
        state.network = networks.bitcoin;
      }
    },
    // Dangerous, only on remove wallet
    reset: (state, action) => {
      state = initialState;
    },
  },
});

export const {
  setContacts,
  addContact,
  removeContact,
  removeContactByIndex,
  setNetwork,
  reset: resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
