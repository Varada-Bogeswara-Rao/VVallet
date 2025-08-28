"use client"
import SendSol from '@/app/components/SendSol'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import React from 'react'
import '@solana/wallet-adapter-react-ui/styles.css';



const SOLANA_RPC_ENDPOINT = process.env.ALCHEMY_SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com";

const page = () => {

    return (
        <div>

            <div className='flex flex-col'>

                <div className='flex flex-col gap-2 py-4 px-4 sm:px-10 md:px-20'>
                    <h1 className='text-4xl tracking-tighter font-[900]'>Send Solana with a click</h1>
                    <p className='text-primary/80 font-semibold'>Via VVallet </p>
                </div>
                <main className="flex items-center justify-center py-15 px-4">
                    <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
                        <WalletProvider wallets={[]} autoConnect>
                            <WalletModalProvider>
                                <SendSol />
                            </WalletModalProvider>
                        </WalletProvider>
                    </ConnectionProvider>
                </main>
            </div>

        </div>
    )
}

export default page