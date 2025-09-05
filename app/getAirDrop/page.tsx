"use client"
import React, { useState, useMemo, FC } from 'react';



import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

import SolanaAirdropController from '../components/AirDrop';

import '@solana/wallet-adapter-react-ui/styles.css';


const SOLANA_RPC_ENDPOINT = process.env.ALCHEMY_SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com";


// --- UNIFIED SOLANA AIRDROP COMPONENT ---
// This component contains all the business logic for the Solana airdrop.



const page = () => {

    // const wallets = useMemo(() => [], []);
    return (

        <>
            {/* <NavBar /> */}

            <div className='flex flex-col'>

                <div className='flex flex-col gap-2 py-4 px-4 sm:px-10 md:px-20'>
                    <h1 className='text-4xl tracking-tighter font-[900]'>AirDrop YourSelf Some Sol</h1>
                    <p className='text-primary/80 font-semibold'>Via VVallet </p>
                </div>

                <main className="flex items-center justify-center py-15 px-4">
                    <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
                        <WalletProvider wallets={[]} autoConnect>

                            <WalletModalProvider>
                                <SolanaAirdropController />
                            </WalletModalProvider>
                        </WalletProvider>
                    </ConnectionProvider>
                </main>
            </div>

        </>
    )
}


export default page