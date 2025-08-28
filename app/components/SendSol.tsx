"use client";

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import React, { useState } from 'react';

// Import shadcn/ui components
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

const SendSol = () => {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [feedback, setFeedback] = useState("");
    const [signature, setSignature] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSend() {
        setFeedback("");
        setSignature("");

        if (!publicKey || !sendTransaction) {
            setFeedback('Please connect your wallet first.');
            return;
        }

        try {
            const recipientPubKey = new PublicKey(toAddress);
            const numericAmount = parseFloat(amount);

            if (isNaN(numericAmount) || numericAmount <= 0) {
                setFeedback('Please enter a valid, positive amount.');
                return;
            }

            setIsLoading(true);
            setFeedback("Processing transaction...");

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPubKey,
                    lamports: numericAmount * LAMPORTS_PER_SOL,
                })
            );

            const sig = await sendTransaction(transaction, connection);

            setSignature(sig);
            setFeedback("Transaction Successful!");
            
        } catch (error: any) {
            console.error("Transaction failed", error);
            setFeedback(`Transaction Failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
        
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-700 text-white">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Send SOL</CardTitle>
                <CardDescription className="text-zinc-400">
                    Connect your wallet to send SOL to another address.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 p-6">
                <div className="center">
                    <WalletMultiButton style={{ backgroundColor: '#9945FF', width: '100%', borderRadius: '0.5rem' }} />
                </div>
                
                {publicKey && (
                    <div className="w-full space-y-4 pt-4 text-center">
                         <p className="text-xs text-zinc-300 break-all bg-zinc-800 p-2 rounded-md">
                            Your Address: {publicKey.toBase58()}
                        </p>
                        <Input
                            type="text"
                            value={toAddress}
                            onChange={(e) => setToAddress(e.target.value)}
                            placeholder="Recipient's Address"
                            className="bg-zinc-800 border-zinc-600 text-white text-center"
                            disabled={isLoading}
                        />
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Amount in SOL"
                            className="bg-zinc-800 border-zinc-600 text-white text-center"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={isLoading || !toAddress || !amount}
                            className="w-full"
                        >
                            {isLoading ? "Sending..." : "Send SOL"}
                        </Button>
                    </div>
                )}

                {feedback && <p className="text-sm text-zinc-400 pt-4 text-center break-all">{feedback}</p>}
                {signature && (
                    <p className="text-xs text-center break-all text-zinc-500">
                        Tx: <a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{signature}</a>
                    </p>
                )}
            </CardContent>
        </Card>

        </>
    );
};

export default SendSol;