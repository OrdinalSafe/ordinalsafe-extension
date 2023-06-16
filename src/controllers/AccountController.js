import { networks } from 'bitcoinjs-lib';
import secrets from 'secrets';
import {
  ALLOWED_MIME_TYPES_TO_SIMPLE_TYPES,
  API_URL,
  TESTNET_API_URL,
  BIS_CDN_URL,
  BRC20_BIS_URL,
} from '../config';
import { store } from '../pages/Popup/store';
import { addInscription } from '../pages/Popup/store/features/inscriptions';

const url = (route) =>
  (JSON.stringify(store.getState().settings.network) ===
  JSON.stringify(networks.testnet)
    ? TESTNET_API_URL
    : API_URL) + route;

export const get = async (route) => {
  const response = await fetch(url(route), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secrets.API_KEY}`,
    },
  });
  const data = await response.json();
  return data;
};

export const post = async (route, body) => {
  const response = await fetch(url(route), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secrets.API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data;
};

const handleResponse = async (response) => {
  if (response.status === 'success') {
    return response.data;
  } else {
    throw new Error(response.message);
  }
};

export const fetchTransactionInfo = async (txHash) => {
  const response = await get('/tx/' + txHash);
  return handleResponse(response);
};

export const fetchBlockHeight = async () => {
  const response = await get('/blocks/height');
  return handleResponse(response);
};

export const fetchAllBalanceInfo = async (address) => {
  const response = await get('/wallet/' + address);
  return handleResponse(response);
};

export const fetchBRC20Balances = async (address) => {
  if (
    JSON.stringify(store.getState().settings.network) ===
    JSON.stringify(networks.testnet)
  )
    return null;

  try {
    const response = await fetch(
      BRC20_BIS_URL + '/get_brc20_balance/' + address
    );
    const data = await response.json();
    return data.map((d) => ({
      name: d.tick,
      balance: d.available_balance,
    }));
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const fetchUTXOs = async (address) => {
  const response = await get('/wallet/' + address + '/utxo');
  return handleResponse(response);
};

export const fetchInscriptions = async (address) => {
  const response = await get('/wallet/' + address + '/inscriptions');
  return handleResponse(response);
};

export const fetchInscription = async (id) => {
  const response = await get('/inscriptions/' + id);
  return handleResponse(response);
};

export const fetchFeeRates = async () => {
  const response = await get('/fees');
  return handleResponse(response);
};

export const fetchPsbtDetails = async (psbt) => {
  const response = await post('/psbt/analyze', {
    psbt,
  });
  return handleResponse(response);
};

export const fetchInscriptionContentFromAPI = async (id) => {
  const response = await get('/inscriptions/' + id + '/content');
  return handleResponse(response);
};

export const fetchInscriptionContentFromBIS = async (id) => {
  const url = `${BIS_CDN_URL}/${id}`;

  try {
    const response = await fetch(url);

    if (response.ok) {
      return {
        id,
        simpleType:
          ALLOWED_MIME_TYPES_TO_SIMPLE_TYPES[
            response.headers.get('Content-Type')
          ],
        type: response.headers.get('Content-Type'),
        content: Buffer.from(await response.arrayBuffer()).toString('hex'),
      };
    } else {
      throw new Error(
        `Error fetching inscription from CDN for inscription ${id}`
      );
    }
  } catch (error) {
    // Handle network errors or other issues
    throw error;
  }
};

export const fetchInscriptionContent = async (id) => {
  try {
    const inscriptionInCache = store.getState().inscriptions.inscriptions[id];
    if (inscriptionInCache) {
      return inscriptionInCache;
    }

    const content = await fetchInscriptionContentFromBIS(id);
    store.dispatch(addInscription(content));
    return content;
  } catch (error) {
    try {
      const data = await fetchInscriptionContentFromAPI(id);
      // TODO: fix this in api
      if (data.simpleType === 'gif') {
        data.simpleType = 'image';
      }
      const content = { id, ...data };
      store.dispatch(addInscription(content));
      return content;
    } catch (error) {
      throw error;
    }
  }
};

export const postTransaction = async (tx) => {
  const response = await post('/tx', {
    txHex: tx,
  });
  return handleResponse(response);
};

export const fetchBitcoinPrice = async () => {
  const response = await get('/price');
  return handleResponse(response);
};

export const fetchInscribeFees = async () => {
  const response = await get('/fees/inscribe');

  return handleResponse(response);
};

export const postMultipleTransactions = async (txs) => {
  const response = await post('/tx', {
    txHexes: txs,
  });
  return handleResponse(response);
};

export const txURL = (hash) => {
  return store.getState().settings.network === networks.testnet
    ? `https://mempool.space/testnet/tx/${hash}`
    : `https://mempool.space/tx/${hash}`;
};

export const addressURL = (address) => {
  return store.getState().settings.network === networks.testnet
    ? `https://mempool.space/testnet/address/${address}`
    : `https://mempool.space/address/${address}`;
};
