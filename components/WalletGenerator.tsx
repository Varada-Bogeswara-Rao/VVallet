"use client";

import { Wallet } from '@/types/wallet'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { handleAddWallet, handleClearWallets, handleDeleteWallets, handleGenerateWallet } from '@/utils/wallet';
import MnemonicDisplay from './mnemonicDisplay';
import { copyToClipboard } from '@/utils/otherUtils';
import { DisplayWallet } from './DisplayWallet';


const WalletGenerator = () => {

    const [wallets, setWallets ]= useState<Wallet[]>([]);
    const [pathTypes, setPathTypes] = useState<string[]>([]);
    const [mnemonicInput, setMnemonicInput] = useState<string>("");
    const [ mnemonicWords, setMnemonicWords ] = useState<string[]>(
        Array(12).fill(" ")
    );

    const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);
    const [visiblePhrases, setVisiblePhrases] = useState<boolean[]>([]);
    const [ showMnemonic, setShowMnemonic ] = useState<boolean>(false);
    const [gridView, setGridView] = useState<boolean>(false);
    
    const pathTypeNames: { [key: string]: string } = {
        "501": "Solana",
        "60": "Ethereum",
    };
    const pathTypeName = pathTypeNames[pathTypes[0]] || "";
    
    const onGenerateWalletClick = () => {
        handleGenerateWallet({
        mnemonicInput,
        pathTypes,
        wallets,
        visiblePrivateKeys,
        visiblePhrases,
        setMnemonicWords,
        setWallets,
        setVisiblePrivateKeys,
        setVisiblePhrases,
        });
    };
    

    const onAddWallet = () => {
        handleAddWallet({
            mnemonicWords,
            pathTypes,
            wallets,
            setWallets,
            visiblePrivateKeys,
            setVisiblePrivateKeys,
            visiblePhrases,
            setVisiblePhrases,
        });
    };

    const onClearWallets = () =>{
        handleClearWallets({
        setWallets,
        setMnemonicWords,
        setPathTypes,
        setVisiblePhrases,
        setVisiblePrivateKeys,
        })

    }

    const onDeleteWallet = (index: number) =>{
        handleDeleteWallets({
        setWallets,
        setPathTypes,
        wallets,
        pathTypes,
        visiblePhrases,
        setVisiblePhrases,
        setVisiblePrivateKeys,
        visiblePrivateKeys,
        index,

        })

    }
    useEffect(() => {
    const storedWallets = localStorage.getItem("wallets");
    const storedMnemonic = localStorage.getItem("mnemonics");
    const storedPathTypes = localStorage.getItem("paths");

    if (storedWallets && storedMnemonic && storedPathTypes) {
      setMnemonicWords(JSON.parse(storedMnemonic));
      setWallets(JSON.parse(storedWallets));
      setPathTypes(JSON.parse(storedPathTypes));
      setVisiblePrivateKeys(JSON.parse(storedWallets).map(() => false));
      setVisiblePhrases(JSON.parse(storedWallets).map(() => false));
    }
  }, []);


  return (
    <div className='flex flex-col py-4 px-4 sm:px-10 md:px-20'>
        {wallets.length == 0 && (
            <div>

                <div>

                    {pathTypes.length == 0 && (
                        <div className='flex flex-col'> 
                            <div className='flex flex-col gap-2'>
                                <h1 className='text-4xl tracking-tighter font-[900]'>VVALLET Supports multiple blockChains</h1>
                                <p className='text-primary/80 font-semibold'>Choose a BlockChain to get Started </p>
                            </div>

                            <div className='flex gap-2 py-4'>
                                <Button size={"lg"}
                                        onClick={() =>{
                                            setPathTypes(["501"])
                                        }}
                                    >Solana</Button>
                                <Button size = {"lg"}
                                        onClick={() =>{
                                            setPathTypes(["60"])
                                        }}
                                    >Ethereum</Button>
                            </div>
                        </div>
                    )}

                    {pathTypes.length !== 0 && (
                        <div className='flex flex-col gap-4'>

                            <div className='flex flex-col gap-2'>


                                <h1 className='text-4xl font-[1000] tracking-tighter'>Secret Recovery Phrase</h1>
                                <p className='text-primary/80 font-semibold text-lg'>Save these words in a safe place.</p>
                            </div>
                            
                            <div className='flex flex-col md:flex-row gap-4'>
                                <Input type='password'
                                        placeholder='Enter your secretPhrase (or to leave blank to Generate)'
                                        value={mnemonicInput}
                                        onChange={(e) =>  setMnemonicInput(e.target.value)}
                                />
                                <Button size={"lg"}
                                        onClick={() => onGenerateWalletClick()}

                                >

                                    {mnemonicInput ? "Add Wallet" : "Generate Wallet"}
                                </Button>


                            </div>


                        </div>

                    )}
                </div>
                
            </div>
        )}

        {/* need to display secret Phrase */}

        {mnemonicWords && wallets.length > 0 && (

            // mnemonic display here
            <MnemonicDisplay
                 mnemonicWords={mnemonicWords}
                copyToClipboard={copyToClipboard}
                showMnemonic={showMnemonic}
                setShowMnemonic={setShowMnemonic} 
          />

        )}

        {/* display wallet pairs */}
        {wallets.length > 0  && (

            <DisplayWallet 
                pathTypeName={pathTypeName}
                wallets={wallets}
                gridView = {gridView}
                setGridView = {setGridView}
                visiblePrivateKeys={visiblePrivateKeys}
                setVisiblePrivateKeys={setVisiblePrivateKeys}
                onAddWallet={onAddWallet}      // Pass the new handler
                onClearWallets={onClearWallets}  // Pass the new handler
                onDeleteWallet={onDeleteWallet}
                copyToClipboard = {copyToClipboard}
            />
        )}

    </div>


  )
}

export default WalletGenerator