'use client';

import { useAppStore } from '../lib/store';

const SATOSHIS_PER_BTC = 100_000_000;
const BTC_DECIMALS = 8;

export default function AddressDetails() {
  const selectedNode = useAppStore((s) => s.selectedNode);
  const details = useAppStore((s) => s.selectedDetails);
  const loading = useAppStore((s) => s.loading);

  return (
    <div
      className="bg-slate-800 text-white p-4 rounded-md shadow-md w-full md:w-1/3 h-fit"
      style={{ minHeight: '160px' }}
    >
      <h2 className="text-lg font-semibold mb-2">Address Details</h2>

      {!selectedNode && <p className="text-gray-400 text-sm">Select an address in the graph to view details…</p>}

      {loading && selectedNode && (
        <div className="flex flex-col items-center space-y-2">
          <p className="text-blue-400 animate-pulse">Loading data...</p>
        </div>
      )}

      {details && selectedNode && (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Address:</strong> {selectedNode.label}
          </p>
          <p>
            <strong>Transactions:</strong> {details.n_tx}
          </p>
          <p>
            <strong>Received:</strong> {(details.total_received / SATOSHIS_PER_BTC).toFixed(BTC_DECIMALS)} BTC
          </p>
          <p>
            <strong>Sent:</strong> {(details.total_sent / SATOSHIS_PER_BTC).toFixed(BTC_DECIMALS)} BTC
          </p>
        </div>
      )}
    </div>
  );
}
