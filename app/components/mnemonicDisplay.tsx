"use client"
import { MnemonicDisplayProps } from '@/types/wallet'
import React from 'react'
import { Button } from './ui/button'
import { ChevronDown, ChevronUp, Copy } from 'lucide-react'

const MnemonicDisplay = ({
    mnemonicWords,
    copyToClipboard,
    showMnemonic,
    setShowMnemonic,
}: MnemonicDisplayProps) => {
    return (

        <div
            className="group flex w-full flex-col items-center gap-4 rounded-lg border border-primary/10 p-4 md:p-8"
        >
            <div
                className="flex w-full cursor-pointer justify-between items-center"
                onClick={() => setShowMnemonic(!showMnemonic)}
            >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
                    Your Secret Phrase
                </h2>
                <Button onClick={() => setShowMnemonic(!showMnemonic)} variant="ghost">
                    {showMnemonic ? (
                        <ChevronUp className="size-4" />
                    ) : (
                        <ChevronDown className="size-4" />
                    )}
                </Button>
            </div>

            {showMnemonic && (
                <div

                    className="flex flex-col w-full items-center justify-center"
                    onClick={() => copyToClipboard(mnemonicWords.join(" "))}
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-4">
                        {mnemonicWords.map((word, index) => (
                            <p
                                key={index}
                                className="md:text-lg text-center bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 rounded-lg p-3"
                            >
                                <span className="text-primary/50 mr-2">{index + 1}.</span>
                                {word}
                            </p>
                        ))}
                    </div>
                    <div className="text-sm md:text-base text-primary/50 flex w-full gap-2 items-center group-hover:text-primary/80 transition-all duration-300">
                        <Copy className="size-4" /> Click phrase to copy
                    </div>
                </div>
            )}
        </div>
    )
}

export default MnemonicDisplay