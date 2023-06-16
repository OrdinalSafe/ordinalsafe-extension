import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  pincode: '',
  lock: true,
  timeout: 45 * 60 * 1000,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPincode: (state, action) => {
      state.pincode = action.payload;
    },
    setLock: (state, action) => {
      state.lock = action.payload;
    },
    setTimeout: (state, action) => {
      state.timeout = action.payload;
    },
    // Dangerous, only on remove wallet
    reset: (state, action) => {
      state = initialState;
    },
  },
});

export const {
  setPincode,
  setLock,
  setTimeout,
  reset: resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
