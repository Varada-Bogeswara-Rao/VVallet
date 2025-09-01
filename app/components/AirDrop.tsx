"use client"
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { copyToClipboard } from '@/utils/otherUtils';

const SolanaAirdropController = () => {
    const { connection } = useConnection();
    const { connected, publicKey } = useWallet(); // Destructure publicKey here
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [feedback, setFeedback] = useState('');
    const [feedback, setFeedback] = useState<React.ReactNode>('');

    // Get address from publicKey, handles null safely
    const address = publicKey?.toBase58();

    const handleClaimAirdrop = async () => {

        if (!publicKey) {
            setFeedback('Please connect your wallet first.');
            return;
        }

        // --- Input Validation and Type Conversion ---
        const numericAmount = parseFloat(amount); // Convert to number
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setFeedback('Please enter a valid, positive amount.');
            return;
        }

        setIsLoading(true);
        setFeedback(`Requesting ${numericAmount} SOL for ${address}...`);

        try {

            // 1. `publicKey` is guaranteed to be a `PublicKey` object.
            // 2. `numericAmount` is a `number`, allowing for multiplication.
            const signature = await connection.requestAirdrop(publicKey, numericAmount * LAMPORTS_PER_SOL);

        


            // setFeedback(`Airdrop of ${numericAmount} SOL successful! <div>Transaction: ${signature}</div>`);

            setFeedback(
                <>
                    Airdrop of {numericAmount} SOL successful!
                    <div className="cursor-pointer" onClick={() => copyToClipboard(signature)}>Transaction: {signature}</div>
                </>
            );
            setAmount('');
        } catch (error: any) {
            console.error(error);
            setFeedback('An error occurred during the airdrop.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-700 text-white">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Solana Airdrop</CardTitle>
                <CardDescription className="text-zinc-400">Connect your wallet and enter an amount to claim tokens.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 p-8">
                {/* Solana Wallet Connection Button */}
                <div className="w-full flex justify-center">
                    <WalletMultiButton style={{ backgroundColor: '#9945FF', width: '100%', borderRadius: '0.5rem' }} />
                </div>

                {/* Airdrop UI (shown only when wallet is connected) */}
                {connected && address ? (
                    <div className="text-center space-y-4 w-full pt-4">
                        <p className="text-sm  font-semibold">Wallet Connected!</p>
                        <p className="text-xs text-zinc-300 break-all bg-zinc-800 p-2 rounded-md">Address: {address}</p>

                        <Input
                            type="number"
                            placeholder="Enter amount of SOL to airdrop"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-zinc-800 border-zinc-600 text-white text-center"
                            disabled={isLoading}
                        />

                        <Button onClick={handleClaimAirdrop} className="w-full " disabled={isLoading || !amount}>
                            {isLoading ? 'Processing...' : 'Claim Airdrop'}
                        </Button>


                    </div>
                ) : (
                    <p className="text-zinc-500 pt-4">Please connect your wallet to proceed.</p>
                )}

                {/* Feedback message area */}
                {feedback && <div className="text-sm text-zinc-400 pt-4 text-center break-all">{feedback}</div>}
            </CardContent>
        </Card>
    );
};

export default SolanaAirdropController;