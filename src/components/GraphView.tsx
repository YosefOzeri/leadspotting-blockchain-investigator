'use client';

import cytoscape from 'cytoscape';
import * as cytoscapeCoseBilkent from 'cytoscape-cose-bilkent';
import { useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import { DEFAULTS } from '@/lib/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchAddressTxs } from '../lib/api';
import { GraphNodeType, useAppStore } from '../lib/store';

const SHORT_LABEL_MIN_LENGTH = 5;
const SHORT_LABEL_PREFIX_LENGTH = 3;
const SHORT_LABEL_PREFIX_START_INDEX = 0;
const SHORT_LABEL_SUFFIX_LENGTH = 2;

const INITIAL_TX_COUNT = 0;
const GRAPH_LAYOUT_DELAY_MS = 300;

const INITIAL_TIMESTAMP = 0;
const EXPAND_ADDRESS_THROTTLE_MS = 1500;

cytoscape.use((cytoscapeCoseBilkent as any).default || (cytoscapeCoseBilkent as any));

export default function GraphView() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [cyInstance, setCyInstance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadedTxCount, setLoadedTxCount] = useState<Record<string, number>>({});

  const addLog = useAppStore((s) => s.addLog);
  const currentAddress = useAppStore((s) => s.currentAddress);
  const setSelectedNode = useAppStore((s) => s.setSelectedNode);
  const setSelectedDetails = useAppStore((s) => s.setSelectedDetails);
  const loadedAddresses = useRef<Set<string>>(new Set());

  const shortenLabel = (address: string) => {
    if (!address) return '';
    if (address.length <= SHORT_LABEL_MIN_LENGTH) return address;
    return `${address.slice(SHORT_LABEL_PREFIX_START_INDEX, SHORT_LABEL_PREFIX_LENGTH)}..${address.slice(-SHORT_LABEL_SUFFIX_LENGTH)}`;
  };

  const elements = useMemo(
    () => [
      ...nodes.map((n) => ({
        data: {
          ...n,
          label: shortenLabel(n.label),
        },
      })),
      ...edges.map((e) => ({ data: e })),
    ],
    [nodes, edges]
  );

  const runLayout = (cy: any) => {
    if (!cy) return;
    const layout = cy.layout({
      name: 'cose-bilkent',
      fit: true,
      animate: true,
      randomize: false,
      padding: 80,
    });
    layout.run();
    setTimeout(() => {
      cy.center();
      cy.fit(undefined, 50);
    }, 500);
  };

  const expandAddress = async (address: string, limit = DEFAULTS.LIMIT, offset = DEFAULTS.OFFSET, cy?: any) => {
    const key = `${address}-${offset}`;
    if (loadedAddresses.current.has(key)) return;
    loadedAddresses.current.add(key);

    setLoading(true);
    addLog(`Fetching data for address: ${address} (offset ${offset})`);

    try {
      const data = await fetchAddressTxs(address, limit, offset);
      addLog(`Loaded ${data.txs?.length || DEFAULTS.TX_COUNT} transactions for ${address}`);
      setSelectedDetails({
        n_tx: data.n_tx,
        total_received: data.total_received,
        total_sent: data.total_sent,
      });

      const newNodes: any[] = [];
      const newEdges: any[] = [];

      data.txs.forEach((tx: any, i: number) => {
        const txId = `tx:${tx.hash}`;
        if (!nodes.find((n) => n.id === txId)) {
          newNodes.push({ id: txId, label: tx.hash, type: GraphNodeType.TX });
        }

        tx.inputs.forEach((inp: any, j: number) => {
          const from = inp.prev_out?.addr ?? `unknown:${j}`;
          if (!nodes.find((n) => n.id === from)) {
            newNodes.push({ id: from, label: from, type: GraphNodeType.ADDRESS });
          }
          newEdges.push({ id: `e:${from}->${txId}:${i}:${j}`, source: from, target: txId });
        });

        tx.out.forEach((o: any, k: number) => {
          const to = o.addr ?? `unknownout:${k}`;
          if (!nodes.find((n) => n.id === to)) {
            newNodes.push({ id: to, label: to, type: GraphNodeType.ADDRESS });
          }
          newEdges.push({ id: `e:${txId}->${to}:${i}:${k}`, source: txId, target: to });
        });
      });

      setNodes((prev) => [...prev, ...newNodes]);
      setEdges((prev) => [...prev, ...newEdges]);

      setLoadedTxCount((prev) => ({
        ...prev,
        [address]: (prev[address] || INITIAL_TX_COUNT) + data.txs.length,
      }));

      if (cy) setTimeout(() => runLayout(cy), GRAPH_LAYOUT_DELAY_MS);
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async (address: string) => {
    const offset = loadedTxCount[address] || DEFAULTS.OFFSET;
    await expandAddress(address, DEFAULTS.LIMIT, offset, cyInstance);
  };

  useEffect(() => {
    if (!currentAddress) return;
    addLog(`Searching for root address: ${currentAddress}`);
    setNodes([{ id: currentAddress, label: currentAddress, type: GraphNodeType.ADDRESS }]);
    setEdges([]);
    loadedAddresses.current.clear();
    setSelectedNode({ id: currentAddress, label: currentAddress, type: GraphNodeType.ADDRESS });
    setSelectedDetails(null);
    setLoadedTxCount({});
    if (cyInstance) expandAddress(currentAddress, DEFAULTS.LIMIT, DEFAULTS.OFFSET, cyInstance);
  }, [currentAddress, cyInstance]);

  const throttle = (func: any, delay: number) => {
    let last = INITIAL_TIMESTAMP;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        func(...args);
      }
    };
  };
  const throttledExpand = throttle(expandAddress, EXPAND_ADDRESS_THROTTLE_MS);

  return (
    <div className="relative h-full" style={{ display: 'flex', flexDirection: 'column' }}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white z-10 space-y-2">
          <LoadingSpinner />
          <p>Loading graph...</p>
        </div>
      )}

      <CytoscapeComponent
        elements={elements as any}
        style={{
          width: '100%',
          height: '100%',
          background: '#0f172a',
          borderRadius: '8px',
        }}
        layout={{ name: 'preset' }}
        stylesheet={[
          {
            selector: 'node',
            style: {
              'background-color': (ele: any) => (ele.data('type') === 'tx' ? '#34d399' : '#60a5fa'),
              label: 'data(label)',
              color: '#fff',
              'font-size': '8px',
              'text-valign': 'center',
              'text-outline-color': '#000',
              'text-outline-width': 1,
              cursor: (ele: any) => (ele.data('type') === 'address' ? 'pointer' : 'default'),
            },
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 3,
              'border-color': '#facc15',
              'background-color': '#2563eb',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#a1a1aa',
              'target-arrow-color': '#a1a1aa',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
            },
          },
        ]}
        cy={(cy) => {
          setCyInstance(cy);
          runLayout(cy);

          cy.on('tap', 'node', (evt) => {
            const data = evt.target.data();
            if (data.type === GraphNodeType.ADDRESS) {
              cy.$('node').unselect();
              evt.target.select();
              setSelectedNode(data);
              setSelectedDetails(null);
              throttledExpand(data.id, 5, 0, cy);
            }
          });
        }}
      />

      {currentAddress && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button
            onClick={() => handleLoadMore(currentAddress)}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '6px',
              fontWeight: 500,
            }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
