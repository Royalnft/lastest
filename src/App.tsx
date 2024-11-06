import React, { useEffect, useState } from 'react';
import { Bitcoin, Plus } from 'lucide-react';
import { BitcoinAddress, Note, WalletState } from './types/bitcoin';
import {
  generateMnemonic,
  generateAddressesFromMnemonic,
  inscribeNote,
  transferInscription,
} from './lib/bitcoin';
import { AddressCard } from './components/AddressCard';
import { NoteEditor } from './components/NoteEditor';
import { NoteList } from './components/NoteList';

function App() {
  const [wallet, setWallet] = useState<WalletState>({
    mnemonic: '',
    addresses: [],
    selectedAddress: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      const mnemonic = generateMnemonic();
      const addresses = await generateAddressesFromMnemonic(mnemonic);
      setWallet({
        mnemonic,
        addresses,
        selectedAddress: addresses[0].address,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setWallet((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize wallet',
      }));
    }
  };

  const handleAddAddress = async () => {
    try {
      const newAddresses = await generateAddressesFromMnemonic(
        wallet.mnemonic,
        wallet.addresses.length,
        1
      );
      setWallet((prev) => ({
        ...prev,
        addresses: [...prev.addresses, ...newAddresses],
      }));
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const handleSaveNote = async (content: string, targetAddress: string) => {
    try {
      const address = wallet.addresses.find((a) => a.address === targetAddress);
      if (!address) throw new Error('Address not found');

      const inscriptionId = await inscribeNote(
        address.address,
        content,
        address.privateKey
      );

      const newNote: Note = {
        id: Math.random().toString(36).substr(2, 9),
        content,
        inscriptionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        address: address.address,
      };

      setWallet((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a) =>
          a.address === address.address
            ? { ...a, notes: [...a.notes, newNote] }
            : a
        ),
      }));
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleTransferNote = async (note: Note, targetAddress: string) => {
    try {
      const sourceAddress = wallet.addresses.find(
        (a) => a.address === note.address
      );
      if (!sourceAddress || !note.inscriptionId) {
        throw new Error('Invalid source address or note');
      }

      const success = await transferInscription(
        note.inscriptionId,
        note.address,
        targetAddress,
        sourceAddress.privateKey
      );

      if (success) {
        setWallet((prev) => ({
          ...prev,
          addresses: prev.addresses.map((a) => {
            if (a.address === note.address) {
              return {
                ...a,
                notes: a.notes.filter((n) => n.id !== note.id),
              };
            }
            if (a.address === targetAddress) {
              return {
                ...a,
                notes: [...a.notes, { ...note, address: targetAddress }],
              };
            }
            return a;
          }),
        }));
      }
    } catch (error) {
      console.error('Failed to transfer note:', error);
    }
  };

  const selectedAddressData = wallet.addresses.find(
    (a) => a.address === wallet.selectedAddress
  );

  if (wallet.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Bitcoin className="w-8 h-8 text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bitcoin className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Tai Wallet</h1>
            </div>
            <button
              onClick={handleAddAddress}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <Plus className="w-4 h-4" />
              <span>New Address</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Addresses
            </h2>
            {wallet.addresses.map((address) => (
              <AddressCard
                key={address.address}
                address={address}
                isSelected={address.address === wallet.selectedAddress}
                onSelect={(addr) =>
                  setWallet((prev) => ({ ...prev, selectedAddress: addr }))
                }
              />
            ))}
          </div>

          <div className="md:col-span-2 space-y-8">
            {selectedAddressData && (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Create New Note
                  </h2>
                  <NoteEditor
                    selectedAddress={selectedAddressData}
                    onSave={handleSaveNote}
                    addresses={wallet.addresses}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Your Notes
                  </h2>
                  <NoteList
                    notes={selectedAddressData.notes}
                    addresses={wallet.addresses}
                    onTransfer={handleTransferNote}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;