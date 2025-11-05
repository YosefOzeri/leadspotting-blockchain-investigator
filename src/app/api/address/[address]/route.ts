import { NextResponse } from 'next/server';

import { DEFAULTS, HTTP_STATUS } from '@/lib/constants';

export const PARAM_LIMIT = 'limit';
export const PARAM_OFFSET = 'offset';

export const REQUEST_TIMEOUT_MS = 10_000;
export const DEFAULT_TX_COUNT = 0;

export async function GET(req: Request, context: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await context.params;
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get(PARAM_LIMIT) || DEFAULTS.LIMIT;
    const offset = searchParams.get(PARAM_OFFSET) || DEFAULTS.OFFSET;

    const url = `https://blockchain.info/rawaddr/${address}?offset=${offset}&limit=${limit}`;
    console.log(`Fetching blockchain data for: ${address}`);
    console.log(`URL: ${url}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const res = await fetch(url, {
      headers: { 'Cache-Control': 'no-store' },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    console.log(`Blockchain API responded with status: ${res.status}`);

    if (!res.ok) {
      const text = await res.text();
      console.error(`Blockchain API error: ${res.status} - ${text}`);
      return NextResponse.json({ error: `Blockchain API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    console.log(`Successfully fetched ${data.txs?.length || DEFAULT_TX_COUNT} transactions for ${address}`);
    return NextResponse.json(data, { status: HTTP_STATUS.OK });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.name === 'AbortError'
          ? 'Request timed out (Blockchain API not responding)'
          : error.message
        : 'Unexpected server error';

    console.error(`Error in /api/address: ${message}`);
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.ERROR });
  }
}
