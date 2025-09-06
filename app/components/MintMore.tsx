"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplTokenMetadata, TokenStandard, mintV1 } from '@metaplex-foundation/mpl-token-metadata';

import { publicKey } from '@metaplex-foundation/umi';
import bs58 from "bs58"

const MintMore = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [isLoading, setIsLoading] = useState(false);

    const [tokenMintAddress, setTokenMintAddress] = useState('');
    const [tokenAmount, setTokenAmount] = useState('');
    const [decimals, setDecimals] = useState(9);

    const umi = useMemo(() => 
        createUmi(connection.rpcEndpoint)
            .use(walletAdapterIdentity(wallet))
            .use(mplTokenMetadata()),
        [connection, wallet]
    );

    const handleMintMore = async () => {
        if (!wallet.publicKey) return toast.error("Wallet not connected");

        setIsLoading(true);
        const promise = async (): Promise<string> => {
            try {
                const amountInSmallestUnit = BigInt(Number(tokenAmount) * (10 ** decimals));

                const mintAddressAsUmiPublicKey = publicKey(tokenMintAddress);

                const mintTx = await mintV1(umi, {
                    mint: mintAddressAsUmiPublicKey,
                    authority: umi.identity,
                    amount: amountInSmallestUnit,
                    tokenOwner: umi.identity.publicKey,
                    tokenStandard: TokenStandard.Fungible,
                }).sendAndConfirm(umi, { send: { skipPreflight: true } });

                // return Buffer.from(mintTx.signature).toString('base64');

                return bs58.encode(mintTx.signature);
            } catch (error: any) {
                throw new Error(error.message || "An unexpected error occurred while minting.");
            }
        };

        toast.promise(promise(), {
            loading: 'Minting more tokens...',
            success: (signature) => (
                 <div className="flex flex-col">
                    <span>Mint successful!</span>
                    <a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                        View Transaction
                    </a>
                </div>
            ),
            error: (err) => err.message,
            finally: () => setIsLoading(false),
        });
    };

    return (
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-700 text-white mt-6">
            <CardHeader>
                <CardTitle>Mint More Tokens</CardTitle>
                <CardDescription>Mint additional supply for a token you control.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input value={tokenMintAddress} onChange={(e) => setTokenMintAddress(e.target.value)} placeholder="Token Mint Address" disabled={isLoading} />
                <Input type="number" value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} placeholder="Amount to Mint" disabled={isLoading} />
                <Button onClick={handleMintMore} disabled={isLoading || !tokenMintAddress || !tokenAmount} className="w-full">
                    {isLoading ? "Minting..." : "Mint More"}
                </Button>
            </CardContent>
        </Card>
    );
};

export default MintMore;