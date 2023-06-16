export declare function getTxSize(
  inputCount: number,
  inputScript: string,
  signaturesPerInput: number,
  pubkeysPerInput: number,
  p2pkhOutputCount: number,
  p2shOutputCount: number,
  p2shP2wpkhOutputCount: number,
  p2shP2wshOutputCount: number,
  p2wpkhOutputCount: number,
  p2wshOutputCount: number,
  p2trOutputCount: number
): {
  vBytes: number;
  bytes: number;
  weight: number;
};
