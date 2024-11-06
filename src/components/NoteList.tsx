import React from 'react';
import { Clock, Send } from 'lucide-react';
import { Note, BitcoinAddress } from '../types/bitcoin';

interface NoteListProps {
  notes: Note[];
  addresses: BitcoinAddress[];
  onTransfer: (note: Note, targetAddress: string) => Promise<void>;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  addresses,
  onTransfer,
}) => {
  const [selectedNote, setSelectedNote] = React.useState<Note | null>(null);
  const [targetAddress, setTargetAddress] = React.useState<string>('');

  const handleTransfer = async (note: Note) => {
    if (!targetAddress) return;
    await onTransfer(note, targetAddress);
    setSelectedNote(null);
    setTargetAddress('');
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No notes found. Create your first note above!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="p-4 border rounded-lg hover:border-orange-300 transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <p className="whitespace-pre-wrap text-gray-800">{note.content}</p>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(note.createdAt).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => setSelectedNote(note)}
              className="ml-4 p-2 text-gray-500 hover:bg-gray-100 rounded"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {selectedNote?.id === note.id && (
            <div className="mt-4 flex items-center space-x-2">
              <select
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                className="flex-1 p-2 text-sm border rounded focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select target address</option>
                {addresses
                  .filter((addr) => addr.address !== note.address)
                  .map((addr) => (
                    <option key={addr.address} value={addr.address}>
                      {addr.address.substring(0, 8)}...
                    </option>
                  ))}
              </select>
              <button
                onClick={() => handleTransfer(note)}
                disabled={!targetAddress}
                className="px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Transfer
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};