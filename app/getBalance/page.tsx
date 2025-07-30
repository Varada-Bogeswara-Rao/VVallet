"use client"
import NavBar from '@/components/NavBar'
import React, { useState } from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


const page = () => {

    const [chain, setChain] = useState<'sol' | 'eth'>('sol');
    const [address, setAddress] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [network, setNetwork] = useState<'mainnet' | 'devnet'>('mainnet');



    const handleFetchBalance = async () => {
        if (!address) {
            setError("please enter a wallet address.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setBalance(null);

        try {

            const response = await axios.post('/api/getBalance', {
                address,
                chain,
                network
            });

            const data = response.data;

            setBalance(Number(data.balance).toFixed(6))
        }
        catch (e: any) {
            setError(e.message)
        } finally {
            setIsLoading(false);
        }

    }


    return (
        <>
            <NavBar />

            <div className='flex flex-col justify-between  py-4 px-4 sm:px-10 md:px-20'>
                <h1 className='text-2xl md:text-4xl tracking-tight font-[900]'>Wallet Balance Checker</h1>

                <p className='px-1 text-primary/80 font-semibold text-lg md:text-xl'>Get the live balance for any address.</p>

            </div>
            <div className='flex items-center justify-center py-2 md:py-6'>

                <Card className='w-full max-w-2xl mx-auto rounded-lg'>
                    <CardHeader>
                        <CardTitle className='text-2xl flex items-center font-bold'>Check your Balance</CardTitle>
                        <CardDescription>Via VVallet</CardDescription>
                        <CardAction>
                            <Select onValueChange={(value: 'mainnet' | 'devnet') => setNetwork(value)}
                                defaultValue={network}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a network" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mainnet">Main-Net</SelectItem>
                                    <SelectItem value="devnet">Dev-Net</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardAction>
                    </CardHeader>
                    <CardContent>


                        {/* chain selection */}

                        <div className="flex justify-center gap-2 p-1 ">


                            <Button
                                size={"lg"}
                                onClick={() => setChain('sol')}
                                variant={chain === 'sol' ? 'default' : 'outline'}
                            >Solana</Button>
                            <Button

                                size={"lg"}
                                onClick={() => setChain('eth')}
                                variant={chain === 'eth' ? 'default' : 'outline'}
                            >Ethereum</Button>





                        </div>

                        <div className="space-y-2 flex flex-col items-center-safe py-2">
                            <Input
                                type="text"
                                placeholder={chain === 'eth' ? 'Enter Ethereum Address (0x...)' : 'Enter Solana Address'}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="text-center w-3/4"
                            />
                            <Button onClick={handleFetchBalance} disabled={isLoading} className="w-1/2">
                                {isLoading ? 'Checking...' : 'Check Balance'}
                            </Button>

                        </div>

                        <div className='pt-4 flex items-center'>
                            {error &&
                                <p>Error fetching balance </p>

                            }
                            {balance != null &&

                                (
                                    <div>

                                        <p className="text-lg text-gray-600 dark:text-gray-300">

                                            Balance:
                                        </p>
                                        <p className="text-4xl font-bold">
                                            {balance} <span className="text-2xl font-medium text-gray-500">{chain.toUpperCase()}</span>
                                        </p>
                                    </div>
                                )
                            }


                        </div>
                    </CardContent>
                    <CardFooter>
                        {/* <p>Card Footer</p> */}
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}

export default page