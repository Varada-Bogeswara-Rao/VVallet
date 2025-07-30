import { WalletMinimal, WalletMinimalIcon } from 'lucide-react'
import React from 'react'
import  ModeToggle  from './ui/mode-toggle'

const NavBar = () => {
  return (
    <nav className='flex justify-between items-center py-4 px-4 sm:px-10 md:px-20'>

        
        <div className='flex gap-2'><WalletMinimal className='size-10' />
        
        <p className='text-4xl'>VVallet</p>
        
        </div>
    
        <ModeToggle />
    
    </nav>
  )
}

export default NavBar