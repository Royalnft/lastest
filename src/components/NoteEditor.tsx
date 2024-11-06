import React, { useState } from 'react';
import { Save, Send } from 'lucide-react';
import { BitcoinAddress, Note } from '../types/bitcoin';

interface NoteEditorProps {
  selectedAddress: BitcoinAddress;
  onSave: (content: string, targetAddress: string) => Promise<void>;
  addresses: BitcoinAddress[];
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  selectedAddress,
  onSave,
  addresses,
}) => {
  const [content, setContent] = useState('');
  const [targetAddress, setTargetAddress] = useState(selectedAddress.address);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      await onSave(content, targetAddress);
      setContent('');
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note here..."
        className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      />
      <div className="flex items-center space-x-4">
        <select
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          {addresses.map((addr) => (
            <option key={addr.address} value={addr.address}>
              {addr.address.substring(0, 8)}...{addr.address.substring(addr.address.length - 8)}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={isSaving || !content.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>Save Note</span>
        </button>
      </div>
    </div>
  );
};