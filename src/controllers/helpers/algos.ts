import { CardinalUTXO } from '../../shared/types';

const DUST_LIMIT = 546;

export const chooseUTXOs = (
  utxos: Array<CardinalUTXO>,
  amount: number
): { chosenUTXOs: Array<CardinalUTXO>; change: number } => {
  const lessers = utxos.filter((utxo) => utxo.value < amount);
  const greaters = utxos.filter(
    (utxo) => utxo.value >= amount && utxo.value > DUST_LIMIT
  );
  if (greaters.length > 0) {
    let min;
    let minUTXO;
    for (const utxo of greaters) {
      if (!min || utxo.value < min) {
        min = utxo.value;
        minUTXO = utxo;
      }
    }
    if (minUTXO) {
      const change = minUTXO.value - amount;
      return { chosenUTXOs: [minUTXO], change };
    } else {
      return { chosenUTXOs: [], change: 0 };
    }
  } else {
    lessers.sort((a, b) => b.value - a.value);

    let sum = 0;
    const chosen = [];
    for (const utxo of lessers) {
      if (utxo.value < DUST_LIMIT)
        throw new Error(
          'Amount requires usage of dust UTXOs. Set smaller amount or lower fee rate.'
        );
      sum += utxo.value;
      chosen.push(utxo);
      if (sum >= amount) break;
    }
    if (sum < amount) return { chosenUTXOs: [], change: 0 };

    const change = sum - amount;

    return { chosenUTXOs: chosen, change };
  }
};

export const splitByNChars = (str: string, n: number): string[] => {
  const result = [];
  let i = 0;
  const len = str.length;

  while (i < len) {
    result.push(str.substr(i, n));
    i += n;
  }

  return result;
};
