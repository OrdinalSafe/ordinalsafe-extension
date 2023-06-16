export interface Inscription {
  id: string;
  genesisFee: number;
  genesisHeight: number;
  number: number;
  satpoint: string;
  timestamp: number;
}

export interface CardinalUTXO {
  status: string;
  txId: string;
  index: number;
  value: number;
  script: string;
  address: string;
  blockHeight: number;
  type: string;
  inscriptions: never;
}

export interface OrdinalUTXO {
  status: string;
  txId: string;
  index: number;
  value: number;
  script: string;
  address: string;
  blockHeight: number;
  type: string;
  inscriptions: Array<Inscription>;
}

export interface UnconfirmedTransactionGraphNode {
  ancestors: Array<string>;
  descendants: Array<string>;
  size: number; // size in vBytes
}

export interface UnconfirmedTransactionGraph {
  [key: string]: UnconfirmedTransactionGraphNode;
}
