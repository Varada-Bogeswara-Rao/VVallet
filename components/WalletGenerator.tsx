"use client"; // Marks this as a Client Component, necessary for React hooks and browser APIs

import React, { useState, useEffect } from 'react'; // Importing useState for state management, useEffect for side effects
import { Button } from './ui/button'; // Importing your custom Button component (e.g., Shadcn UI)
import { toast } from "sonner"; // Importing Sonner for toast notifications (user feedback)
import { motion } from "framer-motion"; // Importing Framer Motion for animations
import { icons } from 'lucide-react';
import { CircleChevronRight } from "lucide-react";
// We'll add other crypto-related imports later as we build functionality

const WalletGenerator = () => {
    // 1. State Variables
    // This state will store the selected blockchain type.
    // We'll use an array to match the original code's structure (e.g., ["501"] or ["60"])
    const [pathTypes, setPathTypes] = useState<string[]>([]);

    // This state will hold our generated wallets.
    // Initially, it's empty, which will control the display of the blockchain selection screen.
    const [wallets, setWallets] = useState<any[]>([]); // Using 'any[]' for now, will define Wallet interface later

    // 2. useEffect for Local Storage (Optional for this step, but good to include early)
    // This hook will attempt to load any previously saved wallet data when the component first mounts.
    // If wallets are found, it would skip the blockchain selection and go straight to wallet display.
    useEffect(() => {
        // In a real scenario, you'd load 'wallets' and 'pathTypes' from localStorage here
        // For now, we keep it simple to ensure the initial selection screen is visible.
        // const storedWallets = localStorage.getItem("wallets");
        // const storedPathTypes = localStorage.getItem("paths");
        // if (storedWallets) {
        //   setWallets(JSON.parse(storedWallets));
        // }
        // if (storedPathTypes) {
        //   setPathTypes(JSON.parse(storedPathTypes));
        // }
    }, []); // Empty dependency array means this runs only once on mount

    // 3. Rendered JSX
    return (
        <div className="flex flex-col gap-4">
            {/*
        This section is conditionally rendered:
        It only shows if no wallets have been generated or loaded yet (wallets.length === 0).
        This ensures the user sees the blockchain selection first.
      */}
            {wallets.length === 0 && (
                <motion.div
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, y: -20 }} // Animation: start invisible, slightly above final position
                    animate={{ opacity: 1, y: 0 }}   // Animation: fade in, slide down to final position
                    transition={{
                        duration: 0.3, // Animation duration
                        ease: "easeInOut", // Animation easing function
                    }}
                >
                    {/*
            This inner conditional rendering ensures the blockchain selection buttons
            are only shown if a pathType hasn't been selected yet.
          */}
                    {pathTypes.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: "easeInOut",
                            }}
                            className="flex gap-4 flex-col my-12" // Tailwind classes for layout and spacing
                        >
                            <div className="flex flex-col gap-2">
                                <h1 className="tracking-tighter text-4xl md:text-5xl font-black">
                                    VVallet: Your Gateway to Multi-Blockchain Assets
                                </h1>
                                <p className="text-primary/80 font-semibold text-lg md:text-xl">
                                    Choose a blockchain to get started.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {/* Ethereum Button */}
                                <Button
                                    size={"lg"} // Large size button
                                    variant="outline" // Outlined style
                                    className='hover:text-teal-300' // Custom hover effect
                                    onClick={() => {
                                        // When clicked, set the pathType to "60" (Ethereum's BIP-44 coin type)
                                        setPathTypes(["60"]);
                                        // Provide user feedback with a toast notification
                                        toast.success("Ethereum selected! You can now generate your wallet.");
                                    }}
                                >
                                    Ethereum
                                </Button>
                                {/* Solana Button */}
                                <Button
                                    size={"lg"}
                                    variant="outline"
                                    className='hover:text-teal-300'
                                    onClick={() => {
                                        // When clicked, set the pathType to "501" (Solana's BIP-44 coin type)
                                        setPathTypes(["501"]);
                                        // Provide user feedback
                                        toast.success("Solana selected! You can now generate your wallet.");
                                    }}
                                >
                                    Solana
                                </Button>
                            </div>
                        </motion.div>
                    )}
                    {/*
            Future content will go here:
            - Mnemonic input field (shown after pathType is selected)
            - Wallet display (shown after wallets are generated)
          */}
                </motion.div>
            )}
        </div>
    );
};

export default WalletGenerator;
