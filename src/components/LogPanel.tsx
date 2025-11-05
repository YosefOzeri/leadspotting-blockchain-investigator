'use client';

import { useEffect, useRef } from 'react';

import { useAppStore } from '../lib/store';

const EMPTY_LOG_COUNT = 0;

export function LogPanel() {
  const logs = useAppStore((s) => s.logs);
  const clearLogs = useAppStore((s) => s.clearLogs);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div
      style={{
        background: '#1e1e1e',
        color: '#cbd5e1',
        borderRadius: '8px',
        height: '150px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}> API Log</h3>
        <button
          onClick={clearLogs}
          style={{
            background: '#374151',
            border: 'none',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>

      <div
        style={{
          background: '#111',
          borderRadius: '6px',
          padding: '8px',
          height: '100%',
          overflowY: 'auto',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        {logs.length === EMPTY_LOG_COUNT ? (
          <div style={{ opacity: 0.7 }}>— THERE IS NO LOG YET —</div>
        ) : (
          logs.map((line, i) => <div key={i}>{line}</div>)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
