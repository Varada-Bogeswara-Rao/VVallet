"use client"
import React from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

const GetBalance = () => {

    const router = useRouter();


    return (
        <div className='flex flex-row  gap-2 py-4 px-4 sm:px-10 md:px-20 self-end'>
            <Button onClick={() => router.push("/getBalance")}>get balance</Button>
            <Button onClick={() => router.push("/getairDrop")}>get AirDrop</Button>
            <Button onClick={() => router.push("/createToken")}>create Token</Button>
            {/* <Button></Button> */}



        </div>
    )
}

export default GetBalance