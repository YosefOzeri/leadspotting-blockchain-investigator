'use client';

import AddressDetails from '@/components/AddressDetails';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import GraphView from '@/components/GraphView';
import { LogPanel } from '@/components/LogPanel';
import SearchAddress from '@/components/SearchAddress';

export default function Page() {
  return (
    <ErrorBoundary>
      <main
        style={{
          background: '#000',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
        }}
      >
        <SearchAddress />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '16px',
            height: '60vh',
            resize: 'vertical',
            overflow: 'auto',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '8px',
          }}
        >
          <GraphView />

          <AddressDetails />
        </div>

        <div
          style={{
            overflow: 'auto',
            minHeight: '120px',
            maxHeight: '50vh',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '4px',
            resize: 'none',
          }}
        >
          <LogPanel />
        </div>
      </main>
    </ErrorBoundary>
  );
}
