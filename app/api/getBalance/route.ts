// File: src/app/api/getBalance/route.ts

import { NextResponse } from 'next/server';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';


interface BalanceRequest {
    address: string;
    chain: 'eth' | 'sol';
    network: 'mainnet' | 'devnet';
}

export async function POST(request: Request) {
    try {
        const { address, chain, network }: BalanceRequest = await request.json();

        if (!address || !chain || !network) {
            return NextResponse.json({ error: 'Address, chain, and network are required' }, { status: 400 });
        }

        let rpcUrl: string | undefined;

        if (chain === 'eth') {
            rpcUrl = network === 'mainnet'
                ? process.env.ALCHEMY_ETHEREUM_RPC_URL
                : process.env.ALCHEMY_ETHEREUM_DEVNET_RPC_URL;
        } else if (chain === 'sol') {
            rpcUrl = network === 'mainnet'
                ? process.env.ALCHEMY_SOLANA_RPC_URL
                : process.env.ALCHEMY_SOLANA_DEVNET_RPC_URL;
        } else {
            return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
        }

        if (!rpcUrl) {
            console.error(`RPC URL is not configured for: ${chain} on ${network}`);
            return NextResponse.json({ error: `Server configuration error: RPC URL is missing for ${network}.` }, { status: 500 });
        }


        const payload = {
            id: 1,
            jsonrpc: '2.0',
            method: chain === 'eth' ? 'eth_getBalance' : 'getBalance',
            params: [address, ...(chain === 'eth' ? ['latest'] : [])],
        };

        const alchemyResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!alchemyResponse.ok) {
            const errorBody = await alchemyResponse.text();
            console.error("Alchemy request failed:", errorBody);
            return NextResponse.json({ error: 'Failed to fetch balance from the node. The address may be invalid.' }, { status: 500 });
        }

        const data = await alchemyResponse.json();

        if (data.error) {
            return NextResponse.json({ error: `Node error: ${data.error.message}` }, { status: 400 });
        }
        if (data.result == null) {
            return NextResponse.json({ error: 'Invalid address or no balance found.' }, { status: 404 });
        }

        let balance: number;
        if (chain === 'eth') {
            const balanceInWei = parseInt(data.result, 16);
            if (isNaN(balanceInWei)) {
                return NextResponse.json({ error: 'Received an invalid balance format from Ethereum node.' }, { status: 500 });
            }
            balance = balanceInWei / 1e18;
        } else { // Solana
            if (typeof data.result.value !== 'number') {
                return NextResponse.json({ error: 'Invalid address or no balance found for this Solana account.' }, { status: 404 });
            }
            const balanceInLamports = data.result.value;
            balance = balanceInLamports / LAMPORTS_PER_SOL;
        }

        return NextResponse.json({ balance });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}