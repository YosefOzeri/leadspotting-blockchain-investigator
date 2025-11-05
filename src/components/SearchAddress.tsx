'use client';

import { useState } from 'react';

import { DEFAULTS } from '@/lib/constants';
import { fetchAddressTxs } from '../lib/api';
import { useAppStore } from '../lib/store';

export default function SearchAddress() {
  const [input, setInput] = useState('');
  const setCurrentAddress = useAppStore((s) => s.setCurrentAddress);
  const addLog = useAppStore((s) => s.addLog);
  const setError = useAppStore((s) => s.setError);
  const setLoading = useAppStore((s) => s.setLoading);

  async function handleSearch() {
    if (!input) {
      setError('Please enter a valid Bitcoin address.');
      return;
    }

    addLog(`Searching for address ${input}...`);
    setError(null);
    setLoading(true);

    try {
      const data = await fetchAddressTxs(input, DEFAULTS.LIMIT, DEFAULTS.OFFSET);
      addLog(`Found ${data.txs?.length ?? DEFAULTS.TX_COUNT} transactions`);
      setCurrentAddress(input);
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: '#1e293b',
        color: 'white',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      <h2>Bitcoin Address Search</h2>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <input
          type="text"
          placeholder="e.g. 3CMCRgEm8HVz3DrWaCCid3vAANE42jcEv9"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #4b5563',
            color: 'black',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            background: '#2563eb',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>
    </div>
  );
}
