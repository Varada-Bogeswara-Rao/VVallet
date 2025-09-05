"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';
import axios from 'axios';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { createFungible, mintV1, mplTokenMetadata, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

import { generateSigner, some, percentAmount } from '@metaplex-foundation/umi';

const createToken = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [tokenImage, setTokenImage] = useState("");
    const [tokenDescription, setTokenDescription] = useState("");
    const [tokenSupply, setTokenSupply] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const umi = useMemo(() =>
        createUmi(connection.rpcEndpoint)
            .use(walletAdapterIdentity(wallet))
            .use(mplTokenMetadata()),
        [connection, wallet]
    );

    const uploadMetadata = async (): Promise<string | null> => {
        if (tokenName.length > 32 || tokenSymbol.length > 10 || tokenName.length === 0 || tokenSymbol.length === 0) {
            toast.error("Name must be 1-32 chars & Symbol must be 1-10 chars.");
            return null;
        }
        try {
            const { data } = await axios.post('/api/upload', {
                name: tokenName, symbol: tokenSymbol, image: tokenImage, description: tokenDescription,
            });
            return data.uri;
        }
        catch (e) {
            toast.error("failed to upload metaData");
            return null;
        }
    };
    const createToken = async () => {
        if (!wallet.publicKey) return toast.warning("wallet not connected");
        const supply = Number(tokenSupply);
        if (isNaN(supply) || supply < 0) return toast.warning("please enter a valid value");

        setIsLoading(true);
        const promise = async (): Promise<string> => {
            const metadataUri = await uploadMetadata();
            if (!metadataUri) throw new Error("Metadata upload failed");

            const mint = generateSigner(umi);
            const decimals = 9;

            await createFungible(umi, {
                mint,
                name: tokenName,
                symbol: tokenSymbol,
                uri: metadataUri,

                sellerFeeBasisPoints: percentAmount(0),
                decimals: some(decimals),
            }).sendAndConfirm(umi, { send: { skipPreflight: true } });

            const amountToMint = BigInt(supply * (10 ** decimals));
            await mintV1(umi, {
                mint: mint.publicKey,
                authority: umi.identity,
                amount: amountToMint,
                tokenOwner: umi.identity.publicKey,
                tokenStandard: TokenStandard.Fungible,
            }).sendAndConfirm(umi, { send: { skipPreflight: true } });

            return `https://explorer.solana.com/address/${mint.publicKey.toString()}?cluster=devnet`;
        };
        toast.promise(promise(), {
            loading: 'Creating and minting token...',
            success: (link) => (
                <div className="flex flex-col">
                    <span>Token created successfully!</span>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                        View Token on Explorer
                    </a>
                </div>
            ),
            error: (err) => `Error: ${err.message}`,
            finally: () => setIsLoading(false),
        });
    };

    return (
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-700 text-white">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Create Token</CardTitle>
                <CardDescription className="text-zinc-400">Using the modern Umi library for reliability.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6">
                {/* <WalletMultiButton style={{ backgroundColor: '#9945FF', width: '100%', borderRadius: '0.5rem' }} /> */}

                {wallet.publicKey && (
                    <div className="w-full space-y-4 pt-4 text-center">
                        <Input value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder="Token Name (e.g. My Token)" disabled={isLoading} />
                        <Input value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} placeholder="Token Symbol (e.g. MYT)" disabled={isLoading} />
                        <Input value={tokenImage} onChange={(e) => setTokenImage(e.target.value)} placeholder="Token Image URL" disabled={isLoading} />
                        <Input value={tokenDescription} onChange={(e) => setTokenDescription(e.target.value)} placeholder="Description (Optional)" disabled={isLoading} />
                        <Input type='number' value={tokenSupply} onChange={(e) => setTokenSupply(e.target.value)} placeholder="Total Supply" disabled={isLoading} />
                        <Button onClick={createToken} disabled={isLoading || !tokenName || !tokenSymbol || !tokenImage || !tokenSupply} className="w-full">
                            {isLoading ? "Creating..." : "Create Token"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default createToken;

