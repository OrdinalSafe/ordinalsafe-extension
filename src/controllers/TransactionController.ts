// TODO: use getTxSize with correct output address type

import * as bitcoin from 'bitcoinjs-lib';
import ecc from '@bitcoinerlab/secp256k1';

import { CardinalUTXO, OrdinalUTXO } from '../shared/types';
import { chooseUTXOs } from './helpers/algos';
import { getTxSize } from './helpers/sizeEstimation';

bitcoin.initEccLib(ecc);

const DUST_LIMIT = 546;

const utxoToPSBTInput = (
  input: CardinalUTXO | OrdinalUTXO,
  xOnlyPubKey: Buffer
) => {
  return {
    hash: input.txId,
    index: input.index,
    witnessUtxo: {
      script: Buffer.from(input.script, 'hex'),
      value: input.value,
    },
    tapInternalKey: xOnlyPubKey,
  };
};

const getOutputAddressTypeCounts = (
  addresses: Array<string>,
  network: bitcoin.Network
) => {
  let p2pkh = 0;
  let p2sh = 0;
  let p2wpkh = 0;
  let p2wsh = 0;
  let p2tr = 0;
  if (JSON.stringify(network) === JSON.stringify(bitcoin.networks.testnet)) {
    addresses.forEach((address) => {
      if (address.startsWith('tb1p')) p2tr++;
      else if (address.startsWith('3')) p2sh++;
      else if (address.startsWith('1')) p2pkh++;
      else if (address.startsWith('tb1q')) {
        let decodeBech32 = bitcoin.address.fromBech32(address);
        if (decodeBech32.data.length === 20) p2wpkh++;
        if (decodeBech32.data.length === 32) p2wsh++;
      } else {
        p2tr++; // if dont know type assum taproot bc it has the highset size for outputs
      }
    });
  } else {
    addresses.forEach((address) => {
      if (address.startsWith('bc1p')) p2tr++;
      else if (address.startsWith('3')) p2sh++;
      else if (address.startsWith('1')) p2pkh++;
      else if (address.startsWith('bc1q')) {
        let decodeBech32 = bitcoin.address.fromBech32(address);
        if (decodeBech32.data.length === 20) p2wpkh++;
        if (decodeBech32.data.length === 32) p2wsh++;
      } else {
        p2tr++; // if dont know type assum taproot bc it has the highset size for outputs
      }
    });
  }

  return { p2pkh, p2sh, p2wpkh, p2wsh, p2tr };
};

/**
 * Iteratively calculates the size of the transaction and the fee to pay. Also selects the UTXOs to use.
 * @param cardinalUTXOs Usable cardinal UTXOs.
 * @param amount Amount to send.
 * @param feeRate User selected fee rate.
 * @returns
 */
export const getSendBitcoinTxInfo = (
  sender: string,
  receiver: string,
  cardinalUTXOs: Array<CardinalUTXO>,
  amount: number,
  feeRate: number,
  network: bitcoin.Network
): {
  chosenUTXOs: Array<CardinalUTXO>;
  change: number;
  size: number;
  feeToPay: number;
  totalCost: number;
} => {
  let knownSize = 0;
  let newSize = 0;
  let chosenUTXOs: Array<CardinalUTXO> = [];
  let change: number = 0;
  do {
    knownSize = newSize;

    ({ chosenUTXOs, change } = chooseUTXOs(
      cardinalUTXOs,
      amount + Math.ceil(feeRate * newSize)
    ));

    if (chosenUTXOs.length === 0)
      throw new Error('Funds not enough for fee rate');

    const outputAddresses = [receiver];
    if (change) outputAddresses.push(sender);
    const outputAddressTypeCounts = getOutputAddressTypeCounts(
      outputAddresses,
      network
    );
    newSize = Math.ceil(
      getTxSize(
        chosenUTXOs.length,
        'P2TR',
        1,
        1,
        outputAddressTypeCounts.p2pkh,
        outputAddressTypeCounts.p2sh,
        0,
        0,
        outputAddressTypeCounts.p2wpkh,
        outputAddressTypeCounts.p2wsh,
        outputAddressTypeCounts.p2tr
      ).vBytes
    );
  } while (knownSize !== newSize);

  return {
    chosenUTXOs,
    change,
    size: knownSize,
    feeToPay: Math.ceil(feeRate * knownSize),
    totalCost: amount + Math.ceil(feeRate * knownSize),
  };
};

/**
 * Use getSendInscriptionTxInfo to get the inputs and change.
 * @param sender Sending address.
 * @param receiver Receiving address.
 * @param amount Amount to send.
 * @param inputs chosenUTXOs from getSendInscriptionTxInfo.
 * @param change change from getSendInscriptionTxInfo.
 * @param xOnlyPubKey xOnlyPubKey of the sender.
 * @param network The current network.
 * @returns
 */
export const getSendBitcoinTx = (
  sender: string,
  receiver: string,
  amount: number,
  inputs: Array<CardinalUTXO>,
  change: number,
  xOnlyPubKey: Buffer,
  network: bitcoin.Network
): bitcoin.Psbt => {
  const psbt = new bitcoin.Psbt({ network });

  inputs.forEach((input) => {
    psbt.addInput(utxoToPSBTInput(input, xOnlyPubKey));
  });

  psbt.addOutput({
    address: receiver,
    value: amount,
  });

  if (change) {
    psbt.addOutput({
      address: sender,
      value: change,
    });
  }

  return psbt;
};

/**
 * Iteratively calculates the size of the transaction and the fee to pay. Also selects the UTXOs to use.
 * @param cardinalUTXOs Usable cardinal UTXOs.
 * @param ordinalUTXOs Usable ordinal UTXOs.
 * @param inscriptionId ID of the inscription to send.
 * @param feeRate User selected fee rate.
 * @returns
 */
export const getSendInscriptionTxInfo = (
  sender: string,
  receiver: string,
  cardinalUTXOs: Array<CardinalUTXO>,
  ordinalUTXOs: Array<OrdinalUTXO>,
  inscriptionId: string,
  feeRate: number,
  network: bitcoin.Network
): {
  chosenUTXOs: Array<CardinalUTXO | OrdinalUTXO>;
  change: number;
  size: number;
  feeToPay: number;
  totalCost: number;
  feePaidFromInscription: boolean;
} => {
  const utxoContainingInscription = ordinalUTXOs.find((utxo) =>
    utxo.inscriptions.find((inscription) => inscription.id === inscriptionId)
  );

  if (!utxoContainingInscription) throw new Error('Inscription not found');

  if (utxoContainingInscription.inscriptions.length > 1)
    throw new Error(
      'More than 1 inscription inside UTXO. Send not supported yet!'
    );

  const satInUTXO = parseInt(
    utxoContainingInscription.inscriptions[0].satpoint.split(':')[2]
  );

  if (Number.isNaN(satInUTXO))
    throw new Error('Inscription satpoint not correct');

  let knownSize = 0;
  let newSize = 0;
  let chosenUTXOs: Array<CardinalUTXO | OrdinalUTXO> = [];
  let change: number = 0;
  do {
    knownSize = newSize;

    if (
      utxoContainingInscription.value - feeRate * knownSize < DUST_LIMIT ||
      utxoContainingInscription.value - feeRate * knownSize <= satInUTXO
    ) {
      //  Needs padding
      const paddingAmount =
        Math.max(DUST_LIMIT, satInUTXO + 1) - utxoContainingInscription.value;

      const { chosenUTXOs: feeUTXOs, change: changeFromFees } = chooseUTXOs(
        cardinalUTXOs,
        paddingAmount + knownSize * feeRate
      );

      if (feeUTXOs.length === 0)
        throw new Error('Inscription needs padding. Not enough funds for fees');

      chosenUTXOs = [utxoContainingInscription, ...feeUTXOs];
      change = changeFromFees;

      const outputAddresses = [receiver];
      if (changeFromFees) outputAddresses.push(sender);

      const outputAddressTypeCounts = getOutputAddressTypeCounts(
        outputAddresses,
        network
      );

      newSize = Math.ceil(
        getTxSize(
          1 + feeUTXOs.length, // inscription + cardinals for fees
          'P2TR',
          1,
          1,
          outputAddressTypeCounts.p2pkh,
          outputAddressTypeCounts.p2sh,
          0,
          0,
          outputAddressTypeCounts.p2wpkh,
          outputAddressTypeCounts.p2wsh,
          outputAddressTypeCounts.p2tr
        ).vBytes
      );
    } else {
      // No padding needed
      chosenUTXOs = [utxoContainingInscription];
      change = 0;
      const outputAddressTypeCounts = getOutputAddressTypeCounts(
        [receiver],
        network
      );
      newSize = Math.ceil(
        getTxSize(
          chosenUTXOs.length,
          'P2TR',
          1,
          1,
          outputAddressTypeCounts.p2pkh,
          outputAddressTypeCounts.p2sh,
          0,
          0,
          outputAddressTypeCounts.p2wpkh,
          outputAddressTypeCounts.p2wsh,
          outputAddressTypeCounts.p2tr
        ).vBytes
      );
    }
  } while (knownSize !== newSize);

  return {
    chosenUTXOs,
    change,
    size: knownSize,
    feeToPay: Math.ceil(feeRate * knownSize),
    totalCost: Math.ceil(feeRate * knownSize),
    feePaidFromInscription: chosenUTXOs.length === 1,
  };
};

/**
 * Use getSendInscriptionTxInfo to get the inputs and change.
 * @param sender Sending address.
 * @param receiver Receiving address.
 * @param inputs chosenUTXOs from getSendInscriptionTxInfo.
 * @param change change from getSendInscriptionTxInfo.
 * @param xOnlyPubKey xOnlyPubKey of the sender.
 * @param network The current network.
 * @returns
 */
export const getSendInscriptionTx = (
  sender: string,
  receiver: string,
  inputs: Array<OrdinalUTXO | CardinalUTXO>,
  change: number,
  feePaidFromInscription: boolean,
  feeToPay: number,
  xOnlyPubKey: Buffer,
  network: bitcoin.Network
): bitcoin.Psbt => {
  const psbt = new bitcoin.Psbt({ network });

  inputs.forEach((input) => {
    psbt.addInput(utxoToPSBTInput(input, xOnlyPubKey));
  });
  if (feePaidFromInscription) {
    psbt.addOutput({
      address: receiver,
      value: inputs[0].value - feeToPay,
    });
  } else {
    psbt.addOutput({
      address: receiver,
      value: inputs[0].value,
    });
  }

  if (change) {
    psbt.addOutput({
      address: sender,
      value: change,
    });
  }

  return psbt;
};

export const getBIP322ToSpendTx = (
  address: string,
  message: string,
  network: bitcoin.Network
): bitcoin.Transaction => {
  const tagHash = bitcoin.crypto.sha256(
    Buffer.from('BIP0322-signed-message', 'utf8')
  );
  const taggedMessage = Buffer.concat([
    tagHash,
    tagHash,
    Buffer.from(message, 'utf8'),
  ]);

  const messageHash = bitcoin.crypto.sha256(taggedMessage);

  const commands = [0, messageHash];
  const scriptSig = bitcoin.script.compile(commands);

  const prevOutHash =
    '0000000000000000000000000000000000000000000000000000000000000000';
  const prevOutIndex = 0xffffffff;

  const txIn = {
    hash: Buffer.from(prevOutHash, 'hex'),
    index: prevOutIndex,
    script: scriptSig,
    sequence: 0,
    witness: [],
  };

  let scriptPubKey;
  try {
    scriptPubKey = bitcoin.address.toOutputScript(address, network);
  } catch (e) {
    console.log(e);
    console.log('Invalid address: ' + address);
    throw new Error("Couldn't convert address");
  }

  const txOut = {
    value: 0,
    script: scriptPubKey,
  };

  const txInputs = [txIn];
  const txOutputs = [txOut];

  const transaction = new bitcoin.Transaction();
  transaction.version = 0;
  transaction.locktime = 0;
  transaction.ins = txInputs;
  transaction.outs = txOutputs;

  return transaction;
};

export const getBIP322ToSignTx = (
  toSpendTxId: Buffer,
  address: string,
  xOnlyPubKey: Buffer,
  network: bitcoin.Network
): bitcoin.Psbt => {
  const commands = [106];
  const scriptPubKey = bitcoin.script.compile(commands);

  const psbt = new bitcoin.Psbt({ network });
  psbt.locktime = 0;
  psbt.version = 0;

  psbt.addInput({
    hash: toSpendTxId,
    index: 0,
    sequence: 0,
    witnessUtxo: {
      script: bitcoin.address.toOutputScript(address, network),
      value: 0,
    },
    sighashType: bitcoin.Transaction.SIGHASH_ALL,
    tapInternalKey: xOnlyPubKey,
  });

  psbt.addOutput({
    value: 0,
    script: scriptPubKey,
  });

  return psbt;
};

export const getInscribeTxsInfo = (
  utxos: Array<CardinalUTXO>,
  data: Buffer,
  sender: string,
  feeRate: number,
  serviceFee: number,
  serviceFeeReceiver: string, // to use in outputs size calculation
  btcPrice: number, // in USD
  websiteFeeInSats: number,
  network: bitcoin.Network
): {
  chosenUTXOs: Array<CardinalUTXO>;
  change: number;
  commitSize: number;
  commitCost: number;
  revealSize: number;
  revealCost: number;
  serviceFee: number;
  postageSize: number;
} => {
  const POSTAGE_SIZE = 546;
  // 1 input 1 output taproot tx size 111 vBytes
  // some safety buffer + data size / 4
  const REVEAL_TX_SIZE = (websiteFeeInSats ? 180 : 137) + data.length / 4;

  const SERVICE_FEE = Math.ceil((serviceFee / btcPrice) * 100000000);

  const REVEAL_COST =
    POSTAGE_SIZE +
    (websiteFeeInSats || 0) +
    Math.ceil(REVEAL_TX_SIZE * feeRate);

  let chosenUTXOs: Array<CardinalUTXO> = [];
  let change;
  let knownSize = 0;
  let newSize = 0;
  do {
    knownSize = newSize;

    ({ chosenUTXOs, change } = chooseUTXOs(
      utxos,
      REVEAL_COST + SERVICE_FEE + Math.ceil(knownSize * feeRate)
    ));

    if (chosenUTXOs.length === 0) throw new Error('Not enough funds');

    const addresses: Array<string> = [];
    if (change !== 0) addresses.push(sender);
    if (SERVICE_FEE !== 0) addresses.push(serviceFeeReceiver);
    const outputAddressTypeCounts = getOutputAddressTypeCounts(
      addresses,
      network
    );

    newSize = Math.ceil(
      getTxSize(
        chosenUTXOs.length,
        'P2TR',
        1,
        1,
        outputAddressTypeCounts.p2pkh,
        outputAddressTypeCounts.p2sh,
        0,
        0,
        outputAddressTypeCounts.p2wpkh,
        outputAddressTypeCounts.p2wsh,
        outputAddressTypeCounts.p2tr + 1 // +1 for reveal address
      ).vBytes
    );
  } while (knownSize !== newSize);

  const COMMIT_TX_SIZE = knownSize;
  const COMMIT_COST =
    REVEAL_COST + SERVICE_FEE + Math.ceil(COMMIT_TX_SIZE * feeRate);

  return {
    chosenUTXOs,
    change,
    commitCost: COMMIT_COST,
    commitSize: COMMIT_TX_SIZE,
    revealCost: REVEAL_COST,
    revealSize: REVEAL_TX_SIZE,
    serviceFee: SERVICE_FEE,
    postageSize: POSTAGE_SIZE,
  };
};

export const getInscribeCommitTx = (
  inputs: Array<CardinalUTXO>,
  committerAddress: string,
  revealerAddress: string,
  revealCost: number,
  change: number,
  xOnlyPubKey: Buffer,
  serviceFee: number,
  serviceFeeReceiver: string,
  network: bitcoin.Network
): bitcoin.Psbt => {
  if (inputs.length === 0) throw new Error('Not enough funds');

  let outputs = [
    {
      address: revealerAddress,
      value: revealCost,
    },
  ];

  if (change !== 0) {
    outputs.push({
      address: committerAddress,
      value: change,
    });
  }

  if (serviceFee > 0) {
    outputs.push({
      value: serviceFee,
      address: serviceFeeReceiver,
    });
  }

  const psbt = new bitcoin.Psbt({ network });

  inputs.forEach((input) => {
    psbt.addInput(utxoToPSBTInput(input, xOnlyPubKey));
  });

  outputs.forEach((output) => {
    psbt.addOutput(output);
  });

  return psbt;
};

export const getInscribeRevealTx = (
  commitHash: Buffer,
  commitIndex: number,
  revealCost: number,
  postageSize: number,
  receiverAddress: string,
  inscriberOutputScript: Buffer,
  xOnlyPubKey: Buffer,
  tapLeafScript: { leafVersion: number; script: Buffer; controlBlock: Buffer },
  websiteFeeReceiver: string | null = null,
  websiteFeeInSats: number | null = null,
  network: bitcoin.Network
): bitcoin.Psbt => {
  const psbt = new bitcoin.Psbt({ network });

  psbt.addInput({
    hash: commitHash,
    index: commitIndex,
    witnessUtxo: {
      script: inscriberOutputScript || Buffer.from(''),
      value: revealCost,
    },
    tapInternalKey: xOnlyPubKey,
    tapLeafScript: [tapLeafScript],
  });

  psbt.addOutput({
    address: receiverAddress,
    value: postageSize,
  });

  if (websiteFeeReceiver && websiteFeeInSats) {
    psbt.addOutput({
      address: websiteFeeReceiver,
      value: websiteFeeInSats,
    });
  }

  return psbt;
};
