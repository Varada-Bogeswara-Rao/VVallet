"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplTokenMetadata, TokenStandard, transferV1 } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';
import bs58 from 'bs58';



const SendToken = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [isLoading, setIsLoading] = useState(false);

    const [tokenMintAddress, setTokenMintAddress] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [tokenAmount, setTokenAmount] = useState('');
    const [decimals, setDecimals] = useState(9);

    const umi = useMemo(() => 
        createUmi(connection.rpcEndpoint)
            .use(walletAdapterIdentity(wallet))
            .use(mplTokenMetadata()),
        [connection, wallet]
    );

    const handleSend = async () => {
        if (!wallet.publicKey) return toast.error("Wallet not connected");

        setIsLoading(true);
        const promise = async (): Promise<string> => {
            try {
                const amountInSmallestUnit = BigInt(Number(tokenAmount) * (10 ** decimals));
                
                
                const mint = publicKey(tokenMintAddress);
                const destinationOwner = publicKey(recipientAddress);

                const transferTx = await transferV1(umi, {
                    mint,
                    authority: umi.identity,
                    tokenOwner: umi.identity.publicKey,
                    destinationOwner,
                    amount: amountInSmallestUnit,
                    tokenStandard: TokenStandard.Fungible,
                }).sendAndConfirm(umi, { send: { skipPreflight: true } });
                
                // return Buffer.from(transferTx.signature).toString('base64');

                return bs58.encode(transferTx.signature);
            } catch (error: any) {
                throw new Error(error.message || "An unexpected error occurred during transfer.");
            }
        };

        toast.promise(promise(), {
            loading: 'Sending token...',
            success: (signature) => (
                <div className="flex flex-col">
                    <span>Token sent successfully!</span>
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
                <CardTitle>Send Your Token</CardTitle>
                <CardDescription>Transfer your created SPL token to another wallet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input value={tokenMintAddress} onChange={(e) => setTokenMintAddress(e.target.value)} placeholder="Token Mint Address" disabled={isLoading} />
                <Input value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="Recipient's Wallet Address" disabled={isLoading} />
                <Input type="number" value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} placeholder="Amount to Send" disabled={isLoading} />
                <Button onClick={handleSend} disabled={isLoading || !tokenMintAddress || !recipientAddress || !tokenAmount} className="w-full">
                    {isLoading ? "Sending..." : "Send Token"}
                </Button>
            </CardContent>
        </Card>
    );
};

export default SendToken;