"use client"
import React, { useState } from 'react';


import CreateToken from '../components/CreateToken';
// import MintMore from '@/components/MintMore';
// import SendToken from '@/components/SendToken';

import { ToggleGroup,ToggleGroupItem } from '@/components/ui/toggle-group';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
// import { SwapToken } from '@/components/SwapToken';
// import SwapTokenClient from '@/components/SwapTokenClient';
// import SwapTokenServer from '@/components/SwapTokenServer';
import { Button } from '../components/ui/button';

type ActiveComponent = 'create' | 'mint' | 'send' | 'swap';
type Network = 'devnet' | 'mainnet';


const SOLANA_DEV_RPC_ENDPOINT = process.env.NEXT_PUBLIC_ALCHEMY_SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com";
const SOLANA_MAINET_ENDPOINT = process.env.NEXT_PUBLIC_ALCHEMY_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";




const Page = () => {
  // 2. State management remains the same.
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>('create');

  const [network, setNetwork] = useState<Network>('devnet');

  const currentEndpoint = network === 'devnet' ? SOLANA_DEV_RPC_ENDPOINT : SOLANA_MAINET_ENDPOINT;

  return (
    <div>
      <div className='flex flex-col'>
        <div className='flex flex-col md:flex-row justify-between items-center px-4 sm:px-10 md:px-20 py-4'>


          <div className='flex flex-col gap-2 py-4 px-4 sm:px-10 md:px-20'>
            <h1 className='text-4xl tracking-tighter font-[900]'>Token Management</h1>
            <p className='text-primary/80 font-semibold'>Via Vaultory On Solana Blockchain</p>
          </div>
          <Button
              onClick={() => setNetwork(network === 'devnet' ? 'mainnet' : 'devnet')}
            >
              Switch to {network === 'devnet' ? 'Mainnet' : 'Devnet'}
          </Button>
        </div>

        <main className="flex flex-col items-center justify-center py-10 px-4 gap-8">
          
         
          <ToggleGroup
            type="single"
            value={activeComponent}
            onValueChange={(value: ActiveComponent) => {
              // allows de-selecting, so we check if a value exists before setting state.
              if (value) {
                setActiveComponent(value);
              }
            }}
            className="border rounded-lg"
          >
            <ToggleGroupItem value="create" aria-label="Toggle create">
              Create Token
            </ToggleGroupItem>
            <ToggleGroupItem value="mint" aria-label="Toggle mint">
              Mint More
            </ToggleGroupItem>
            <ToggleGroupItem value="send" aria-label="Toggle send">
              Send Token
            </ToggleGroupItem>
            <ToggleGroupItem value="swap" aria-label="Toggle swap">
              Swap Token
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Wallet and Connection Providers */}
          {/* SHOULD ADD MAIN NET ENDPOINT */}
          <ConnectionProvider endpoint={currentEndpoint}>
            <WalletProvider wallets={[]} autoConnect>
              <WalletModalProvider>
                <WalletMultiButton style={{ backgroundColor: '#9945FF', width: '100%', borderRadius: '0.5rem' }} />
                
            
                    {activeComponent === 'create' && <CreateToken/>}
                    {/* {activeComponent === 'mint' && <MintMore />}
                    {activeComponent === 'send' && <SendToken />}
                    {activeComponent === 'swap' && <SwapTokenClient />} */}
                    {/* {activeComponent === 'swap' && <SwapToken />} */}


              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </main>
      </div>
    </div>
  );
}

export default Page;