import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

/* 
  IMPORTANT:
  - This slice is a custom slice
  - It needs to have the active address in order to save fetched informations in the right place
  - The active address is coming from the wallet state
  - The active address is not stored in this slice
  - The active address is not modified in this slice
  - The active address is only used to get the right address to save informations
  - The active address is only used in the async thunks

  THUS, we are passing payloads as { address, payload } to the reducers. be careful.
*/

const getActiveAddress = (thunkAPI) => {
  const state = thunkAPI.getState();
  return state.wallet.activeWallet.address;
};

const setBalanceOfAddress = createAsyncThunk(
  'account/setBalance',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.setBalance({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const addBalanceOfAddress = createAsyncThunk(
  'account/addBalance',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.addBalance({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const subBalanceOfAddress = createAsyncThunk(
  'account/subBalance',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.subBalance({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const setHistoryOfAddress = createAsyncThunk(
  'account/setHistory',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.setHistory({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const addHistoryOfAddress = createAsyncThunk(
  'account/addHistory',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.addHistory({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const setInscriptionIdsOfAddress = createAsyncThunk(
  'account/setInscriptionIds',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.setInscriptionIds({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const setCardinalUTXOsOfAddress = createAsyncThunk(
  'account/setCardinalUTXOs',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.setCardinalUTXOs({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const setOrdinalUTXOsOfAddress = createAsyncThunk(
  'account/setOrdinalUTXOs',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.setOrdinalUTXOs({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const addSpentCardinalUTXOOfAddress = createAsyncThunk(
  'account/addSpentCardinalUTXO',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.addSpentCardinalUTXO({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const addSpentCardinalUTXOsOfAddress = createAsyncThunk(
  'account/addSpentCardinalUTXOs',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.addSpentCardinalUTXOs({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const addSpentOrdinalUTXOOfAddress = createAsyncThunk(
  'account/addSpentOrdinalUTXO',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.addSpentOrdinalUTXO({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const addSpentOrdinalUTXOsOfAddress = createAsyncThunk(
  'account/addSpentOrdinalUTXOs',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.addSpentOrdinalUTXOs({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const addSpentInscriptionIdOfAddress = createAsyncThunk(
  'account/addSpentInscriptionId',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.addSpentInscriptionId({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const addUnconfirmedCardinalUTXOOfAddress = createAsyncThunk(
  'account/addUnconfirmedCardinalUTXO',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.addUnconfirmedCardinalUTXO({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const setBrcBalancesOfAddress = createAsyncThunk(
  'account/setBrcBalances',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.setBrcBalances({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);
const setBrcBalanceOfAddress = createAsyncThunk(
  'account/setBrcBalance',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(
      accountSlice.actions.setBrcBalances({
        address: getActiveAddress(thunkAPI),
        payload,
      })
    );
  }
);

export const initialState = {
  accounts: {
    // IMPORTANT: will be initated when an account is created
    example: {
      balance: 0,
      history: [],
      // inscriptionIds only hold unspent inscriptionIds; spent inscriptionIds are removed from this list locally
      inscriptionIds: [],
      spentInscriptionIds: {},

      // cardinalUTXOs only hold unspent TXOs; spent TXOs are removed from this list locally
      cardinalUTXOs: [],
      spentCardinalUTXOs: {},
      unconfirmedCardinalUTXOs: [],

      // ordinalUTXOs only hold unspent TXOs; spent TXOs are removed from this list locally
      ordinalUTXOs: [],
      spentOrdinalUTXOs: {},
      // we might need this in the future
      unconfirmedOrdinalUTXOs: [],

      // brc20
      brcBalances: [],
      brcUTXOs: {},
      spentBrcUTXOs: {},
    },
  },
  /* balance: 0,
  history: [],
  // inscriptionIds only hold unspent inscriptionIds; spent inscriptionIds are removed from this list locally
  inscriptionIds: [],
  // cardinalUTXOs only hold unspent TXOs; spent TXOs are removed from this list locally
  cardinalUTXOs: [],
  ordinalUTXOs: [],
  unconfirmedCardinalUTXOs: [],
  // we might need this in the future
  unconfirmedOrdinalUTXOs: [],
  spentCardinalUTXOs: {},
  spentInscriptionIds: {},

  // brc20
  brcBalances: [],
  brcUTXOs: {},
  spentBrcUTXOs: {}, */

  // bitcoin price
  bitcoinPrice: 0,
  // active address (coming from wallet state, do not modify)
  activeAddress: '',
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    createAccount: (state, action) => {
      if (state.accounts[action.payload] !== undefined) {
        return;
      }
      const accounts = state.accounts;
      accounts[action.payload] = {
        balance: 0,
        history: [],
        inscriptionIds: [],
        cardinalUTXOs: [],
        ordinalUTXOs: [],
        unconfirmedCardinalUTXOs: [],
        unconfirmedOrdinalUTXOs: [],
        spentCardinalUTXOs: {},
        spentOrdinalUTXOs: {},
        spentInscriptionIds: {},
        brcBalances: [],
        brcUTXOs: {},
        spentBrcUTXOs: {},
      };
      state.accounts = accounts;
    },
    // not sure if we should allow balance reducer usage in the app.
    // just set utxos directly
    setBalance: (state, action) => {
      const activeAddress = action.payload.address;
      state.accounts[activeAddress].balance = action.payload.payload;
    },
    addBalance: (state, action) => {
      const activeAddress = action.payload.address;
      state.accounts[activeAddress].balance += action.payload.payload;
    },
    subBalance: (state, action) => {
      const activeAddress = action.payload.address;
      state.accounts[activeAddress].balance -= action.payload.payload;
    },
    setHistory: (state, action) => {
      const activeAddress = action.payload.address;
      state.accounts[activeAddress].history = action.payload.payload;
    },
    addHistory: (state, action) => {
      const activeAddress = action.payload.address;
      state.accounts[activeAddress].history.push(action.payload.payload);
    },
    setInscriptionIds: (state, action) => {
      const activeAddress = action.payload.address;
      const newInscriptionIds = action.payload.payload;
      const newInscriptionIdsDict = {};

      newInscriptionIds.forEach((id) => {
        newInscriptionIdsDict[id] = true;
      });

      Object.keys(state.accounts[activeAddress].spentInscriptionIds)
        .filter((x) => !newInscriptionIdsDict[x])
        .forEach((id) => {
          delete state.accounts[activeAddress].spentInscriptionIds[id];
        });

      const inscriptionIdsToSet = [];
      newInscriptionIds.forEach((id) => {
        if (!state.accounts[activeAddress].spentInscriptionIds[id]) {
          inscriptionIdsToSet.push(id);
        }
      });

      state.accounts[activeAddress].inscriptionIds = inscriptionIdsToSet;
    },
    setCardinalUTXOs: (state, action) => {
      const activeAddress = action.payload.address;

      const newCardinalUTXOs = action.payload.payload;
      const newCardinalUTXOsFlat = {};
      const unconfirmedCardinalUTXOsToSet = [];

      newCardinalUTXOs.forEach((utxo) => {
        newCardinalUTXOsFlat[utxo.txId + ':' + utxo.index] = true;
      });

      const unconfirmedCardinalUTXOsFromState =
        state.accounts[activeAddress].unconfirmedCardinalUTXOs;
      unconfirmedCardinalUTXOsFromState.forEach((utxo) => {
        if (!newCardinalUTXOsFlat[utxo.txId + ':' + utxo.index]) {
          unconfirmedCardinalUTXOsToSet.push(utxo);
        }
      });
      state.accounts[activeAddress].unconfirmedCardinalUTXOs =
        unconfirmedCardinalUTXOsToSet;

      Object.keys(state.accounts[activeAddress].spentCardinalUTXOs)
        .filter((x) => !newCardinalUTXOsFlat[x])
        .forEach((utxo) => {
          delete state.accounts[activeAddress].spentCardinalUTXOs[utxo];
        });

      const cardinalUTXOsToSet = [];
      newCardinalUTXOs.forEach((utxo) => {
        if (
          !state.accounts[activeAddress].spentCardinalUTXOs[
            utxo.txId + ':' + utxo.index
          ]
        ) {
          cardinalUTXOsToSet.push(utxo);
        }
      });

      state.accounts[activeAddress].cardinalUTXOs = cardinalUTXOsToSet;

      let sum = 0;
      state.accounts[activeAddress].cardinalUTXOs.forEach((utxo) => {
        sum += utxo.value;
      });
      state.accounts[activeAddress].unconfirmedCardinalUTXOs.forEach((utxo) => {
        sum += utxo.value;
      });
      state.accounts[activeAddress].balance = sum;
    },
    setOrdinalUTXOs: (state, action) => {
      const activeAddress = action.payload.address;

      const newOrdinalUTXOs = action.payload.payload;
      const newOrdinalUTXOsFlat = {};
      const unconfirmedOrdinalUTXOsToSet = [];

      newOrdinalUTXOs.forEach((utxo) => {
        newOrdinalUTXOsFlat[utxo.txId + ':' + utxo.index] = true;
      });

      const unconfirmedOrdinalUTXOsFromState =
        state.accounts[activeAddress].unconfirmedOrdinalUTXOs;
      unconfirmedOrdinalUTXOsFromState.forEach((utxo) => {
        if (!newOrdinalUTXOsFlat[utxo.txId + ':' + utxo.index]) {
          unconfirmedOrdinalUTXOsToSet.push(utxo);
        }
      });
      state.accounts[activeAddress].unconfirmedOrdinalUTXOs =
        unconfirmedOrdinalUTXOsToSet;

      Object.keys(state.accounts[activeAddress].spentOrdinalUTXOs)
        .filter((x) => !newOrdinalUTXOsFlat[x])
        .forEach((utxo) => {
          delete state.accounts[activeAddress].spentOrdinalUTXOs[utxo];
        });

      const ordinalUTXOsToSet = [];
      newOrdinalUTXOs.forEach((utxo) => {
        if (
          !state.accounts[activeAddress].spentOrdinalUTXOs[
            utxo.txId + ':' + utxo.index
          ]
        ) {
          ordinalUTXOsToSet.push(utxo);
        }
      });

      state.accounts[activeAddress].ordinalUTXOs = ordinalUTXOsToSet;
    },
    addSpentCardinalUTXO: (state, action) => {
      const activeAddress = action.payload.address;
      const { txId, index } = action.payload.payload;

      state.accounts[activeAddress].cardinalUTXOs = state.accounts[
        activeAddress
      ].cardinalUTXOs.filter((x) => x.txId !== txId || x.index !== index);
      state.accounts[activeAddress].unconfirmedCardinalUTXOs = state.accounts[
        activeAddress
      ].unconfirmedCardinalUTXOs.filter(
        (x) => x.txId !== txId || x.index !== index
      );
      state.accounts[activeAddress].spentCardinalUTXOs[
        txId + ':' + index
      ] = true;
    },
    addSpentCardinalUTXOs: (state, action) => {
      const activeAddress = action.payload.address;
      const spentCardinalUTXOs = action.payload.payload;

      let cardinalUTXOsToSet = state.accounts[activeAddress].cardinalUTXOs;
      let unconfirmedCardinalUTXOsToSet =
        state.accounts[activeAddress].unconfirmedCardinalUTXOs;

      spentCardinalUTXOs.forEach((utxo) => {
        const { txId, index } = utxo;

        cardinalUTXOsToSet = cardinalUTXOsToSet.filter(
          (x) => x.txId !== txId || x.index !== index
        );

        unconfirmedCardinalUTXOsToSet = unconfirmedCardinalUTXOsToSet.filter(
          (x) => x.txId !== txId || x.index !== index
        );

        state.accounts[activeAddress].spentCardinalUTXOs[
          txId + ':' + index
        ] = true;
      });

      state.accounts[activeAddress].cardinalUTXOs = cardinalUTXOsToSet;
      state.accounts[activeAddress].unconfirmedCardinalUTXOs =
        unconfirmedCardinalUTXOsToSet;
    },
    addSpentOrdinalUTXO: (state, action) => {
      const activeAddress = action.payload.address;
      const { txId, index } = action.payload.payload;

      state.accounts[activeAddress].ordinalUTXOs = state.accounts[
        activeAddress
      ].ordinalUTXOs.filter((x) => x.txId !== txId || x.index !== index);
      state.accounts[activeAddress].unconfirmedOrdinalUTXOs = state.accounts[
        activeAddress
      ].unconfirmedOrdinalUTXOs.filter(
        (x) => x.txId !== txId || x.index !== index
      );
      state.accounts[activeAddress].spentCardinalUTXOs[
        txId + ':' + index
      ] = true;
    },
    addSpentOrdinalUTXOs: (state, action) => {
      const activeAddress = action.payload.address;
      const spentOrdinalUTXOs = action.payload.payload;

      let ordinalUTXOsToSet = state.accounts[activeAddress].ordinalUTXOs;
      let unconfirmedoOrdinalUTXOsToSet =
        state.accounts[activeAddress].unconfirmedOrdinalUTXOs;

      spentOrdinalUTXOs.forEach((utxo) => {
        const { txId, index } = utxo;

        ordinalUTXOsToSet = ordinalUTXOsToSet.filter(
          (x) => x.txId !== txId || x.index !== index
        );
        unconfirmedoOrdinalUTXOsToSet = unconfirmedoOrdinalUTXOsToSet.filter(
          (x) => x.txId !== txId || x.index !== index
        );

        state.accounts[activeAddress].spentOrdinalUTXOs[
          txId + ':' + index
        ] = true;
      });

      state.accounts[activeAddress].ordinalUTXOs = ordinalUTXOsToSet;
    },
    addSpentInscriptionId: (state, action) => {
      const activeAddress = action.payload.address;
      const inscriptionId = action.payload.payload;

      state.accounts[activeAddress].inscriptionIds = state.accounts[
        activeAddress
      ].inscriptionIds.filter((x) => x !== inscriptionId);
      state.accounts[activeAddress].spentInscriptionIds[inscriptionId] = true;
    },
    addUnconfirmedCardinalUTXO: (state, action) => {
      const activeAddress = action.payload.address;
      const utxo = action.payload.payload;
      state.accounts[activeAddress].unconfirmedCardinalUTXOs.push(utxo);
    },
    // brc20s
    setBrcBalances: (state, action) => {
      const activeAddress = action.payload.address;
      if (!state.accounts[activeAddress]) {
        return;
      }
      state.accounts[activeAddress].brcBalances = action.payload.payload;
    },
    // TODO: add brc20 utxos
    setBitcoinPrice: (state, action) => {
      state.bitcoinPrice = action.payload;
    },
    // Dangerous, only on remove wallet
    reset: (state, action) => {
      state = initialState;
    },
  },
});

export const {
  createAccount,
  setBitcoinPrice,
  reset: resetAccount,
} = accountSlice.actions;

export const setBalance = setBalanceOfAddress;
export const addBalance = addBalanceOfAddress;
export const subBalance = subBalanceOfAddress;
export const setHistory = setHistoryOfAddress;
export const addHistory = addHistoryOfAddress;
export const setInscriptionIds = setInscriptionIdsOfAddress;
export const setCardinalUTXOs = setCardinalUTXOsOfAddress;
export const setOrdinalUTXOs = setOrdinalUTXOsOfAddress;
export const addSpentCardinalUTXO = addSpentCardinalUTXOOfAddress;
export const addSpentCardinalUTXOs = addSpentCardinalUTXOsOfAddress;
export const addSpentOrdinalUTXO = addSpentOrdinalUTXOOfAddress;
export const addSpentOrdinalUTXOs = addSpentOrdinalUTXOsOfAddress;
export const addSpentInscriptionId = addSpentInscriptionIdOfAddress;
export const addUnconfirmedCardinalUTXO = addUnconfirmedCardinalUTXOOfAddress;
export const setBrcBalances = setBrcBalancesOfAddress;
export const setBrcBalance = setBrcBalanceOfAddress;

export default accountSlice.reducer;
