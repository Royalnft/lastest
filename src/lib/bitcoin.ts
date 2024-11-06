import * as bitcoin from 'bitcoinjs-lib';
import { generateMnemonic as genMnemonic, validateMnemonic as validateMnem } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { BitcoinAddress } from '../types/bitcoin';
import * as secp256k1 from '@bitcoinerlab/secp256k1';

bitcoin.initEccLib(secp256k1);

const network = bitcoin.networks.testnet; // Change to bitcoin.networks.bitcoin for mainnet

export const generateMnemonic = (): string => {
  return genMnemonic(wordlist);
};

export const validateMnemonic = (mnemonic: string): boolean => {
  return validateMnem(mnemonic, wordlist);
};

export const generateAddressesFromMnemonic = async (
  mnemonic: string,
  startIndex: number = 0,
  count: number = 5
): Promise<BitcoinAddress[]> => {
  const seed = await genMnemonic(wordlist);
  const addresses: BitcoinAddress[] = [];

  for (let i = startIndex; i < startIndex + count; i++) {
    const path = `m/84'/0'/0'/0/${i}`;
    const keyPair = bitcoin.ECPair.fromPrivateKey(
      Buffer.from(seed.slice(0, 32), 'hex'),
      { network }
    );
    
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network,
    });

    if (!address) throw new Error('Failed to generate address');

    addresses.push({
      address,
      privateKey: keyPair.toWIF(),
      path,
      balance: 0,
      notes: [],
    });
  }

  return addresses;
};

export const inscribeNote = async (
  address: string,
  content: string,
  privateKey: string
): Promise<string> => {
  try {
    const keyPair = bitcoin.ECPair.fromWIF(privateKey, network);
    const p2wpkh = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network,
    });

    // This is a simplified version. In production, you'd need to:
    // 1. Get UTXOs for the address
    // 2. Create a transaction with OP_FALSE OP_IF ... OP_ENDIF
    // 3. Sign and broadcast the transaction
    
    console.log('Inscribing note to address:', address);
    return `inscription-${Date.now()}`;
  } catch (error) {
    console.error('Error inscribing note:', error);
    throw error;
  }
};

export const transferInscription = async (
  inscriptionId: string,
  fromAddress: string,
  toAddress: string,
  privateKey: string
): Promise<boolean> => {
  try {
    const keyPair = bitcoin.ECPair.fromWIF(privateKey, network);
    const p2wpkh = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network,
    });

    // This is a simplified version. In production, you'd need to:
    // 1. Get the UTXO containing the inscription
    // 2. Create a transaction sending it to the target address
    // 3. Sign and broadcast the transaction
    
    console.log('Transferring inscription:', inscriptionId);
    return true;
  } catch (error) {
    console.error('Error transferring inscription:', error);
    throw error;
  }
};