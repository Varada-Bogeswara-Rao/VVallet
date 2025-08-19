"use client"
import { DisplayWalletProps, Wallet } from '@/types/wallet'
import React from 'react'
import { Button } from './ui/button'
import { Eye, EyeOff, Grid2X2, List, Trash } from 'lucide-react'
// import { handleAddWallet, handleClearWallets, handleDeleteWallets } from '@/utils/wallet'
import { AlertDialog, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from './ui/alert-dialog'
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from './ui/alert-dialog'
// import { copyToClipboard } from '@/utils/otherUtils'
import { toast } from 'sonner'

export const DisplayWallet = ({
    pathTypeName,
    wallets,
    gridView,
    setGridView,
    visiblePrivateKeys,
    setVisiblePrivateKeys,
    onAddWallet,
    onClearWallets,
    onDeleteWallet,
    copyToClipboard,

}: DisplayWalletProps) => {
    const togglePrivateKeyVisibility = (index: number) => {
        setVisiblePrivateKeys(
            visiblePrivateKeys.map((visible, i) => (i === index ? !visible : visible))
        );
    }

    // const copyToClipboard = (content: string) =>{
    //     if(typeof window !== 'undefined'){
    //         navigator.clipboard.writeText(content);
    //         toast.success("Copied to clipboard!");
    //     }

    // }



    return (
        <div className='flex flex-col'>

            <div className='flex md:flex-row flex-col justify-between w-full gap-4 md:items-center py-3'>

                <h2 className='tracking-tight text-3xl md:text-4xl font-extrabold'>
                    {pathTypeName} Wallet
                </h2>

                <div className='flex gap-2'>
                    {wallets.length > 1 && (
                        <Button
                            variant={"ghost"}
                            onClick={() => setGridView(!gridView)}
                            className='hidden md:block'
                        >
                            {gridView ? <Grid2X2 /> : <List />}
                        </Button>
                    )}

                    <Button onClick={onAddWallet}>
                        Add Wallet
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="self-end">Clear Wallet</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    wallets and keys from local storage.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onClearWallets}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>


                </div>
            </div>

            <div className={`grid gap-6 grid-cols-1 ${gridView ? "md:grid-cols-2 lg:grid-cols-3" : ""}`}>
                {wallets.map((wallet: Wallet, index: number) => (

                    <div className='flex flex-col rounded-2xl border border-primary/10' key={index}>
                        <div className='flex justify-between px-8 py-6'>
                            <h3 className='font-bold text-2xl md:text-3xl tracking-tighter'>Wallet {index + 1} </h3>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost">
                                        <Trash className='size-4 text-destructive' />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to delete this wallet?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently
                                            delete your wallet and key from local storage.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => {
                                            onDeleteWallet(index)
                                        }}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {/* wallet keys */}

                        <div className="flex flex-col gap-8 px-8 py-4 rounded-2xl bg-secondary/50">
                            <div
                                className="flex flex-col w-full gap-2"
                                onClick={() => copyToClipboard(wallet.publicKey)}
                            >
                                <span className="text-lg md:text-xl font-bold tracking-tighter">
                                    Public Key
                                </span>
                                <p className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate">
                                    {wallet.publicKey}
                                </p>
                            </div>
                            <div className="flex flex-col w-full gap-2">
                                <span className="text-lg md:text-xl font-bold tracking-tighter">
                                    Private Key
                                </span>
                                <div className="flex justify-between w-full items-center gap-2">
                                    <p
                                        onClick={() => copyToClipboard(wallet.privateKey)}
                                        className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate"
                                    >
                                        {visiblePrivateKeys[index]
                                            ? wallet.privateKey
                                            : "•".repeat(wallet.mnemonic.length)}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        onClick={() => togglePrivateKeyVisibility(index)}
                                    >
                                        {visiblePrivateKeys[index] ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                        </div>


                    </div>
                ))}

            </div>


        </div>
    )
}