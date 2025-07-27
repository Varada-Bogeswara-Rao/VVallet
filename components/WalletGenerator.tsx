"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { Input } from "./ui/input";
import { color, hover, motion } from "framer-motion"; // Corrected import
import {
    ChevronDown,
    ChevronUp,
    Copy,
    Eye,
    EyeOff,
} from "lucide-react";
import { text } from "stream/consumers";
import { Checkbox } from "@/components/ui/checkbox";
// NOTE: Other necessary imports for Wallet Generation (nacl, Keypair, bs58, ethers)
// are commented out for now as they will be added in Step 3.
// If you uncomment the `generateWalletFromMnemonic` function in this file for testing,
// you might need to uncomment these imports temporarily.

interface Wallet {
    publicKey: string;
    privateKey: string;
    mnemonic: string;
    path: string;
}

const WalletGenerator = () => {
    // --- State Variables ---
    const [mnemonicWords, setMnemonicWords] = useState<string[]>(
        Array(12).fill(" ")
    );
    const [pathTypes, setPathTypes] = useState<string[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
    const [mnemonicInput, setMnemonicInput] = useState<string>("");
    const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);
    const [visiblePhrases, setVisiblePhrases] = useState<boolean[]>([]);
    const [acknowledgedLoss, setAcknowledgedLoss] = useState<boolean>(false);
    const [acknowledgedWritten, setAcknowledgedWritten] = useState<boolean>(false);


    // --- Derived State for Display ---
    const pathTypeNames: { [key: string]: string } = {
        "501": "Solana",
        "60": "Ethereum",
    };
    const pathTypeName = pathTypeNames[pathTypes[0]] || "";

    // --- useEffect for Local Storage Loading (Still commented out for future step) ---
    useEffect(() => {
        // In a later step, we will uncomment this to load from local storage
        // const storedWallets = localStorage.getItem("wallets");
        // const storedMnemonic = localStorage.getItem("mnemonics");
        // const storedPathTypes = localStorage.getItem("paths");

        // if (storedWallets && storedMnemonic && storedPathTypes) {
        //   setMnemonicWords(JSON.parse(storedMnemonic));
        //   setWallets(JSON.parse(storedWallets));
        //   setPathTypes(JSON.parse(storedPathTypes));
        //   setVisiblePrivateKeys(JSON.parse(storedWallets).map(() => false));
        //   setVisiblePhrases(JSON.parse(storedWallets).map(() => false));
        // }
    }, []);

    // --- Helper Functions ---

    const togglePrivateKeyVisibility = (index: number) => {
        setVisiblePrivateKeys(
            visiblePrivateKeys.map((visible, i) => (i === index ? !visible : visible))
        );
    };

    const togglePhraseVisibility = (index: number) => {
        setVisiblePhrases(
            visiblePhrases.map((visible, i) => (i === index ? !visible : visible))
        );
    };

    // --- Main Handlers for Mnemonic/Wallet Flow ---
    const handleGenerateWallet = () => {
        let mnemonic = mnemonicInput.trim();

        if (mnemonic) {
            if (!validateMnemonic(mnemonic)) {
                toast.error("Invalid recovery phrase. Please try again.");
                return;
            }
            setMnemonicWords(mnemonic.split(" "));
            toast.success("Recovery phrase validated!");
        } else {
            mnemonic = generateMnemonic();
            setMnemonicWords(mnemonic.split(" "));
            toast.success("New recovery phrase generated!");
        }

        // --- TEMPORARY: Simulate a wallet being created for the UI to move to next stage ---
        // This will be replaced by actual wallet generation in Step 3.
        setWallets([
            {
                publicKey: "TEMP_PUBLIC_KEY",
                privateKey: "TEMP_PRIVATE_KEY",
                mnemonic: mnemonic,
                path: `m/44'/${pathTypes[0]}'/0'/0'`,
            },
        ]);
        setVisiblePrivateKeys([false]);
        setVisiblePhrases([false]);
        // --- END TEMPORARY ---

        setMnemonicInput(""); // Clear the input field after processing
    };

    // Placeholder for handleAddWallet (will be implemented in a later step)
    const handleAddWallet = () => {
        toast.info("Add wallet functionality coming soon!");
    };

    // --- Component Rendering (JSX) ---
    return (
        <div className="flex flex-col gap-4">
            {/* SECTION 1: Initial Blockchain Selection OR Mnemonic Input */}
            {wallets.length === 0 && ( // Only show this entire section if no real wallets are loaded/generated
                <motion.div
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    {pathTypes.length === 0 ? ( // SUB-SECTION A: Choose Blockchain
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="flex gap-4 flex-col my-12"
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
                                <Button
                                    className=" hover:text-teal-500 text-lg border border-teal-500 px-4 py-2 rounded"
                                    size={"lg"}
                                    onClick={() => {
                                        setPathTypes(["501"]);
                                        toast.success("Wallet selected. Please generate a wallet to continue.");

                                    }}
                                >
                                    Solana
                                </Button>
                                <Button
                                    className=" hover:text-teal-500 text-lg border border-teal-500 px-4 py-2 rounded"
                                    size={"lg"}
                                    onClick={() => {
                                        setPathTypes(["60"]);
                                        toast.success("Wallet selected. Please generate a wallet to continue.");
                                    }}
                                >
                                    Ethereum
                                </Button>
                            </div>
                        </motion.div>
                    ) : ( // SUB-SECTION B: Secret Recovery Phrase Input (shown after blockchain is selected)
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="flex flex-col gap-4 my-12"
                        >
                            <div className="flex flex-col gap-2">
                                <h1 className="tracking-tighter text-4xl md:text-5xl font-black">
                                    Secret Recovery Phrase
                                </h1>
                                <p className="text-primary/80 font-semibold text-lg md:text-xl">
                                    Save these words in a safe place.
                                </p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4">
                                <Input
                                    type="password"
                                    placeholder="Enter your secret phrase (or leave blank to generate)"
                                    onChange={(e) => setMnemonicInput(e.target.value)}
                                    value={mnemonicInput}
                                />
                                <Button className=" hover:text-teal-500 text-lg border border-teal-500 px-4 py-2 rounded"
                                    size={"lg"} onClick={() => handleGenerateWallet()}>
                                    {mnemonicInput ? "Add Wallet" : "Generate Wallet"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* SECTION 2: Display Secret Phrase (Shows only if mnemonic exists AND wallets are simulated) */}
            {mnemonicWords[0] !== " " && wallets.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="group flex flex-col items-center gap-4 cursor-pointer rounded-lg border border-primary/10 p-8"
                >
                    {/* Header for Secret Phrase section with toggle button */}
                    <div
                        className="flex w-full justify-between items-center"
                        onClick={() => setShowMnemonic(!showMnemonic)}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
                            Your Secret Phrase
                        </h2>
                        <Button
                            onClick={() => setShowMnemonic(!showMnemonic)}
                            variant="ghost"
                        >
                            {showMnemonic ? (
                                <ChevronUp className="size-4" />
                            ) : (
                                <ChevronDown className="size-4" />
                            )}
                        </Button>
                    </div>

                    {/* Mnemonic Words Display (conditionally rendered) */}
                    {showMnemonic && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="flex flex-col w-full items-center justify-center"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8"
                            >
                                {mnemonicWords.map((word, index) => (
                                    <p
                                        key={index}
                                        className="md:text-lg bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 rounded-lg p-4"
                                    >
                                        {word}
                                    </p>
                                ))}
                            </motion.div>

                            <div className="flex flex-col gap-4 mt-8 w-full">
                                {/* Checkbox 1: Losing words means losing funds */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="acknowledge-loss"
                                        checked={acknowledgedLoss}
                                        onCheckedChange={(checked: boolean) => setAcknowledgedLoss(checked)}
                                    />
                                    <label
                                        htmlFor="acknowledge-loss"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I understand that losing these words means losing my funds.
                                    </label>
                                </div>

                                {/* Checkbox 2: Words written down accurately */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="acknowledge-written"
                                        checked={acknowledgedWritten}
                                        onCheckedChange={(checked: boolean) => setAcknowledgedWritten(checked)}
                                    />
                                    <label
                                        htmlFor="acknowledge-written"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I have written these words down accurately.
                                    </label>
                                </div>

                                {/* Future: A "Continue" or "Generate Keys" button would go here,
                    disabled until both checkboxes are checked. */}
                                <Button
                                    size="lg"
                                    className="mt-4"
                                    disabled={!acknowledgedLoss || !acknowledgedWritten}
                                    onClick={() => toast.info("Ready to generate keys!")} // Placeholder action
                                >
                                    Continue
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* SECTION 3: Display Wallet Pairs (Will be implemented in Step 4) */}
            {/* Currently, this section is empty in this step. */}
            {/* {wallets.length > 0 && (
        <motion.div>
           ... Wallet display logic will go here in a later step ...
        </motion.div>
      )} */}
        </div>
    );
};

export default WalletGenerator;
