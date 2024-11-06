export interface BitcoinAddress {
  address: string;
  privateKey: string;
  path: string;
  balance: number;
  notes: Note[];
}

export interface Note {
  id: string;
  content: string;
  inscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
  address: string;
}

export interface WalletState {
  mnemonic: string;
  addresses: BitcoinAddress[];
  selectedAddress: string | null;
  isLoading: boolean;
  error: string | null;
}