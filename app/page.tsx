
import WalletGenerator from '@/components/WalletGenerator'
import NavBar from '@/components/NavBar'
import React from 'react'

const Home = () => {
  return (
    <main className="max-w-7xl mx-auto flex flex-col gap-4 p-4 min-h-[92vh]" >
      <NavBar />
      <WalletGenerator />

    </main>
  )
}

export default Home