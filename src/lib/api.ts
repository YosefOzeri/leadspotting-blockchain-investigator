import { DEFAULTS } from '@/lib/constants';
import { useAppStore } from './store';

export interface RawAddrResponse {
  address: string;
  n_tx: number;
  total_received: number;
  total_sent: number;
  txs: {
    hash: string;
    inputs: { prev_out: { addr?: string; value: number } }[];
    out: { addr?: string; value: number }[];
  }[];
}

export async function fetchAddressTxs(address: string, limit = DEFAULTS.LIMIT, offset = DEFAULTS.OFFSET) {
  const { addLog, setLoading, setError } = useAppStore.getState();
  const url = `/api/address/${address}?offset=${offset}&limit=${limit}`;
  addLog(`GET ${url}`);

  try {
    setLoading(true);
    setError(null);

    const res = await fetch(url, {
      headers: { 'Cache-Control': 'no-store' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as RawAddrResponse;
    addLog(`OK ${url}`);
    return data;
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    addLog(`ERR ${url} :: ${errMsg}`);
    setError(errMsg);
    throw e;
  } finally {
    setLoading(false);
  }
}
