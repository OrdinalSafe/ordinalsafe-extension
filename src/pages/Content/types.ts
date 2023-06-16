export interface IWallet {
  isOrdinalSafe: boolean;
  version: string;

  /**
   * Should be called before any other method in order to initialize the wallet.
   * OrdinalSafe is taproot only.
   * @returns accounts List of taproot addresses. The first one is the default account.
   */
  requestAccounts(): Promise<string[]>;

  /**
   * Should be called to sign out. It clears the webpage from the wallet session.
   * @returns status Status of the sign out process
   */
  forgetIdentity(): Promise<string>;

  /**
   * Should be called to get signed psbt.
   * Only signs the inputs that is owned by the wallet.
   * Only send taproot inputs. Any other inputs that is not taproot will result in reject message.
   * @param psbt Hex string of psbt
   * @returns psbt Hex string of signed psbt
   */
  signPsbt(psbt: string): Promise<string>;

  /**
   * Inscribes trustlessly on behalf of the wallet.
   * @param mimeType Mime type of the data (Types of data that will be displayed:
   * image/jpeg,
   * image/png,
   * image/gif',
   * image/webp',
   * image/svg+xml,
   * application/json,
   * text/html;charset=utf-8,
   * text/plain;charset=utf-8)
   * @param data Hex encoded data to inscribe
   * @param websiteFeeReceiver Address of the website fee receiver (if left null, no fee will be paid)
   * @param websiteFeeInSats Amount of satoshis that will be paid to the website (if websiteFeeReceiver is null, this has to be null too)
   * @param inscriptionReceiver Address of the inscription receiver (if left null, data will be inscribed to the default wallet of the user)
   * @param isTestnet If true, inscribes on testnet
   * @returns commit Commit transaction id
   * @returns reveal Reveal transaction id
   */
  inscribe(
    mimeType: string,
    data: string,
    externalFees: Array<ExternalFee> | null,
    inscriptionReceiver: string | null,
    isTestnet: boolean
  ): Promise<{ commit: string; reveal: string }>;

  /**
   * Sends bitcoin to an address.
   * Handles UTXO selection and fee calculation.
   * @param address Address to send bitcoin
   * @param amountInSats Amount of satoshis to send
   * @returns txHash Hash of the transaction
   */
  sendBitcoin(address: string, amountInSats: number): Promise<string>;

  /**
   * Sends an inscription to an address.
   * Handles UTXO selection and fee calculation.
   * @param address Address to send inscription
   * @param inscriptionId Id of the inscription to send
   * @returns txHash Hash of the transaction
   */
  sendInscription(address: string, inscriptionId: string): Promise<string>;

  /**
   * Broadcasts a transaction to the network.
   * Just propagates to rpc.
   * Does not wait for confirmation.
   * Does not check if the transaction is valid.
   * @param txHex Hex string of transaction
   * @returns txHash Hash of the transaction
   */
  broadcastTransaction(txHex: string): Promise<string>;

  /**
   * Sign a message with the wallet.
   * Signs according to bip-322 (https://github.com/bitcoin/bips/blob/master/bip-0322.mediawiki).
   * @param message Message to sign
   * @returns signature Base64 encoded string of signature
   */
  signMessage(message: string): Promise<string>;

  /**
   * Balance of the default account.
   * @returns balance Balance in satoshis
   */
  getBalance(): Promise<number>;

  /**
   * Inscriptions of the default account.
   * @returns inscriptions List of inscriptionIds that are owned by the default account
   */
  getInscriptions(): Promise<string[]>;

  /**
   * Returns confirmed UTXOs of the default account.
   * Ordinal UTXOs are marked as frozen. They also contain extra information about the inscription.
   * @param type "all" for all utxos, "cardinals" for cardinals only, "ordinals" for ordinals only
   * @returns utxos List of UTXOs
   */
  getUTXOs(
    type: string
  ): Promise<
    CardinalUTXO[] | OrdinalUTXO[] | Array<CardinalUTXO | OrdinalUTXO>
  >;
}

export interface Inscription {
  id: string;
  genesisFee: number;
  genesisHeight: number;
  number: number;
  satpoint: string;
  timestamp: number;
}

export interface CardinalUTXO {
  status: string; // mined or unconfirmed
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
  status: string; // mined or unconfirmed
  txId: string;
  index: number;
  value: number;
  script: string;
  address: string;
  blockHeight: number;
  type: string;
  inscriptions: Array<Inscription>;
}

export interface ExternalFee {
  receiver: string; // address
  fee: number; // in satoshis
}