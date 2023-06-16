import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  inscriptions: {},
};

export const inscriptionsSlice = createSlice({
  name: 'inscriptions',
  initialState,
  reducers: {
    addInscription: (state, action) => {
      state.inscriptions[action.payload.id] = action.payload;
    },
    setInscriptions: (state, action) => {
      state.inscriptions = action.payload;
    },
    // Dangerous, only on remove wallet
    reset: (state, action) => {
      state = initialState;
    },
  },
});

export const {
  addInscription,
  setInscriptions,
  reset: resetInscriptions,
} = inscriptionsSlice.actions;

export default inscriptionsSlice.reducer;
