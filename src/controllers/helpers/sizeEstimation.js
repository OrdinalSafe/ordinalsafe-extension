const P2PKH_IN_SIZE = 148;
const P2PKH_OUT_SIZE = 34;

const P2SH_OUT_SIZE = 32;
const P2SH_P2WPKH_OUT_SIZE = 32;
const P2SH_P2WSH_OUT_SIZE = 32;

// All segwit input sizes are reduced by 1 WU to account for the witness item counts being added for every input per the transaction header
const P2SH_P2WPKH_IN_SIZE = 90.75;

const P2WPKH_IN_SIZE = 67.75;
const P2WPKH_OUT_SIZE = 31;

const P2WSH_OUT_SIZE = 43;
const P2TR_OUT_SIZE = 43;

const P2TR_IN_SIZE = 57.25;

const PUBKEY_SIZE = 33;
const SIGNATURE_SIZE = 72;

function getSizeOfScriptLengthElement(length) {
  if (length < 75) {
    return 1;
  } else if (length <= 255) {
    return 2;
  } else if (length <= 65535) {
    return 3;
  } else if (length <= 4294967295) {
    return 5;
  } else {
    return undefined;
  }
}

function getSizeOfVarInt(length) {
  if (length < 253) {
    return 1;
  } else if (length < 65535) {
    return 3;
  } else if (length < 4294967295) {
    return 5;
  } else if (length < 18446744073709551615) {
    return 9;
  } else {
    return undefined;
  }
}

function getTxOverheadVBytes(input_script, input_count, output_count) {
  let witness_vbytes;
  if (input_script === 'P2PKH' || input_script === 'P2SH') {
    witness_vbytes = 0;
  } else {
    // Transactions with segwit inputs have extra overhead
    witness_vbytes =
      0.25 + // segwit marker
      0.25 + // segwit flag
      input_count / 4; // witness element count per input
  }

  return (
    4 + // nVersion
    getSizeOfVarInt(input_count) + // number of inputs
    getSizeOfVarInt(output_count) + // number of outputs
    4 + // nLockTime
    witness_vbytes
  );
}

function getTxOverheadExtraRawBytes(input_script, input_count) {
  let witness_bytes;
  // Returns the remaining 3/4 bytes per witness bytes
  if (input_script === 'P2PKH' || input_script === 'P2SH') {
    witness_bytes = 0;
  } else {
    // Transactions with segwit inputs have extra overhead
    witness_bytes =
      0.25 + // segwit marker
      0.25 + // segwit flag
      input_count / 4; // witness element count per input
  }

  return witness_bytes * 3;
}

function getTxSize(
  inputCount,
  inputScript,
  signaturesPerInput,
  pubkeysPerInput,
  p2pkhOutputCount,
  p2shOutputCount,
  p2shP2wpkhOutputCount,
  p2shP2wshOutputCount,
  p2wpkhOutputCount,
  p2wshOutputCount,
  p2trOutputCount
) {
  // Validate transaction input attributes
  if (!Number.isInteger(inputCount) || inputCount < 0) {
    return undefined;
  }
  if (!Number.isInteger(signaturesPerInput) || signaturesPerInput < 0) {
    return undefined;
  }
  if (!Number.isInteger(pubkeysPerInput) || pubkeysPerInput < 0) {
    return undefined;
  }

  // Validate transaction output attributes
  if (!Number.isInteger(p2pkhOutputCount) || p2pkhOutputCount < 0) {
    return undefined;
  }
  if (!Number.isInteger(p2shOutputCount) || p2shOutputCount < 0) {
    return undefined;
  }
  if (!Number.isInteger(p2shP2wpkhOutputCount) || p2shP2wpkhOutputCount < 0) {
    return undefined;
  }

  if (!Number.isInteger(p2shP2wshOutputCount) || p2shP2wshOutputCount < 0) {
    return undefined;
  }
  if (!Number.isInteger(p2wpkhOutputCount) || p2wpkhOutputCount < 0) {
    return undefined;
  }
  if (!Number.isInteger(p2wshOutputCount) || p2wshOutputCount < 0) {
    return undefined;
  }
  if (!Number.isInteger(p2trOutputCount) || p2trOutputCount < 0) {
    return undefined;
  }

  const output_count =
    p2pkhOutputCount +
    p2shOutputCount +
    p2shP2wpkhOutputCount +
    p2shP2wshOutputCount +
    p2wpkhOutputCount +
    p2wshOutputCount +
    p2trOutputCount;

  // In most cases the input size is predictable. For multisig inputs we need to perform a detailed calculation
  var inputSize = 0; // in virtual bytes
  var inputWitnessSize = 0;

  let redeemScriptSize;
  let scriptSigSize;
  switch (inputScript) {
    case 'P2PKH':
      inputSize = P2PKH_IN_SIZE;
      break;
    case 'P2SH-P2WPKH':
      inputSize = P2SH_P2WPKH_IN_SIZE;
      inputWitnessSize = 107; // size(signature) + signature + size(pubkey) + pubkey
      break;
    case 'P2WPKH':
      inputSize = P2WPKH_IN_SIZE;
      inputWitnessSize = 107; // size(signature) + signature + size(pubkey) + pubkey
      break;
    case 'P2TR': // Only consider the cooperative taproot signing path; assume multisig is done via aggregate signatures
      inputSize = P2TR_IN_SIZE;
      inputWitnessSize = 65; // getSizeOfVarInt(schnorrSignature) + schnorrSignature;
      break;
    case 'P2SH':
      redeemScriptSize =
        1 + // OP_M
        pubkeysPerInput * (1 + PUBKEY_SIZE) + // OP_PUSH33 <pubkey>
        1 + // OP_N
        1; // OP_CHECKMULTISIG
      scriptSigSize =
        1 + // size(0)
        signaturesPerInput * (1 + SIGNATURE_SIZE) + // size(SIGNATURE_SIZE) + signature
        getSizeOfScriptLengthElement(redeemScriptSize) +
        redeemScriptSize;
      inputSize = 32 + 4 + getSizeOfVarInt(scriptSigSize) + scriptSigSize + 4;
      break;
    case 'P2SH-P2WSH':
      break;
    case 'P2WSH':
      redeemScriptSize =
        1 + // OP_M
        pubkeysPerInput * (1 + PUBKEY_SIZE) + // OP_PUSH33 <pubkey>
        1 + // OP_N
        1; // OP_CHECKMULTISIG
      inputWitnessSize =
        1 + // size(0)
        signaturesPerInput * (1 + SIGNATURE_SIZE) + // size(SIGNATURE_SIZE) + signature
        getSizeOfScriptLengthElement(redeemScriptSize) +
        redeemScriptSize;
      inputSize =
        36 + // outpoint (spent UTXO ID)
        inputWitnessSize / 4 + // witness program
        4; // nSequence
      if (inputScript === 'P2SH-P2WSH') {
        inputSize += 32 + 3; // P2SH wrapper (redeemscript hash) + overhead?
      }
      break;
    default:
      return undefined;
  }

  let txVBytes =
    getTxOverheadVBytes(inputScript, inputCount, output_count) +
    inputSize * inputCount +
    P2PKH_OUT_SIZE * p2pkhOutputCount +
    P2SH_OUT_SIZE * p2shOutputCount +
    P2SH_P2WPKH_OUT_SIZE * p2shP2wpkhOutputCount +
    P2SH_P2WSH_OUT_SIZE * p2shP2wshOutputCount +
    P2WPKH_OUT_SIZE * p2wpkhOutputCount +
    P2WSH_OUT_SIZE * p2wshOutputCount +
    P2TR_OUT_SIZE * p2trOutputCount;

  let txBytes =
    getTxOverheadExtraRawBytes(inputScript, inputCount) +
    txVBytes +
    (inputWitnessSize * inputCount * 3) / 4;
  let txWeight = txVBytes * 4;

  return {
    vBytes: txVBytes,
    bytes: txBytes,
    weight: txWeight,
  };
}

module.exports = {
  getTxSize,
};
