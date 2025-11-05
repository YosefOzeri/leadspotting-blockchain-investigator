import { create } from 'zustand';

export enum GraphNodeType {
  ADDRESS = 'address',
  TX = 'tx',
}

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
}

export interface AddressDetailsData {
  n_tx: number;
  total_received: number;
  total_sent: number;
}

interface AppState {
  currentAddress: string | null;
  setCurrentAddress: (addr: string | null) => void;

  selectedNode: GraphNode | null;
  setSelectedNode: (n: GraphNode | null) => void;

  selectedDetails: AddressDetailsData | null;
  setSelectedDetails: (d: AddressDetailsData | null) => void;

  logs: string[];
  addLog: (msg: string) => void;
  clearLogs: () => void;

  loading: boolean;
  setLoading: (v: boolean) => void;

  error: string | null;
  setError: (e: string | null) => void;

  expandAddress: ((address: string, limit?: number, offset?: number) => Promise<void>) | null;
  setExpandAddress: (fn: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentAddress: null,
  setCurrentAddress: (addr) => set({ currentAddress: addr }),

  selectedNode: null,
  setSelectedNode: (n) => set({ selectedNode: n }),

  selectedDetails: null,
  setSelectedDetails: (d) => set({ selectedDetails: d }),

  logs: [],
  addLog: (msg) =>
    set((s) => ({
      logs: [...s.logs, `[${new Date().toLocaleTimeString()}] ${msg}`],
    })),
  clearLogs: () => set({ logs: [] }),

  loading: false,
  setLoading: (v) => set({ loading: v }),

  error: null,
  setError: (e) => set({ error: e }),

  expandAddress: null,
  setExpandAddress: (fn) => set({ expandAddress: fn }),
}));
