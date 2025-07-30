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
    Grid2X2,
    Trash,
    List,
} from "lucide-react";
import { text } from "stream/consumers";
import { Checkbox } from "@/components/ui/checkbox";
import nacl from "tweetnacl";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { ethers } from "ethers"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog"

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
    const [gridView, setGridView] = useState<boolean>(false);


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
    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
    };

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
    const handleDeleteWallet = (index: number) => {
        const updatedWallets = wallets.filter((_, i) => i !== index);
        // Note: If pathTypes is meant to be 1:1 with wallets, it should also be filtered.
        // For now, assuming pathTypes is just the *selected* type, not one per wallet.
        setWallets(updatedWallets);
        // setPathTypes(updatedPathTypes); // Uncomment if pathTypes needs to be filtered too
        setVisiblePrivateKeys(visiblePrivateKeys.filter((_, i) => i !== index));
        setVisiblePhrases(visiblePhrases.filter((_, i) => i !== index));
        toast.success("Wallet deleted successfully!");
    };

    // NEW: Handler to clear all wallets
    const handleClearWallets = () => {
        setWallets([]);
        setMnemonicWords(Array(12).fill(" ")); // Reset mnemonic words display
        setPathTypes([]); // Reset selected path type
        setShowMnemonic(false); // Hide mnemonic display
        setMnemonicInput(""); // Clear mnemonic input
        setAcknowledgedLoss(false); // Reset checkboxes
        setAcknowledgedWritten(false); // Reset checkboxes
        setVisiblePrivateKeys([]);
        setVisiblePhrases([]);
        toast.success("All wallets cleared.");
    };
    const generateWalletFromMnemonic = (
        pathType: string,
        mnemonic: string,
        accountIndex: number
    ): Wallet | null => {
        try {
            const seedBuffer = mnemonicToSeedSync(mnemonic);
            const path = `m/44'/${pathType}'/0'/${accountIndex}'`;
            const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));

            let publicKeyEncoded: string;
            let privateKeyEncoded: string;

            if (pathType === "501") {
                // Solana
                const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
                const keypair = Keypair.fromSecretKey(secretKey);

                privateKeyEncoded = bs58.encode(secretKey);
                publicKeyEncoded = keypair.publicKey.toBase58();
            } else if (pathType === "60") {
                // Ethereum
                const privateKey = Buffer.from(derivedSeed).toString("hex");
                privateKeyEncoded = `0x${privateKey}`; // Ensure 0x prefix for ethers.js

                const wallet = new ethers.Wallet(privateKeyEncoded);
                publicKeyEncoded = wallet.address;
            } else {
                toast.error("Unsupported path type.");
                return null;
            }

            return {
                publicKey: publicKeyEncoded,
                privateKey: privateKeyEncoded,
                mnemonic,
                path,
            };
        } catch (error) {
            console.error("Wallet generation error:", error);
            toast.error("Failed to generate wallet. Please try again.");
            return null;
        }
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
        if (pathTypes.length === 0) {
            toast.error("Please select a blockchain first.");
            return;
        }
        const wallet = generateWalletFromMnemonic(
            pathTypes[0], // Use the selected blockchain type
            mnemonic,
            wallets.length // Use current number of wallets as the account index for derivation
        );
        if (wallet) {
            setWallets([wallet]); // Replace dummy wallet with the real one
            setVisiblePrivateKeys([false]);
            setVisiblePhrases([false]);
        }
        setMnemonicInput(""); // Clear the input field after processing
    };

    // Placeholder for handleAddWallet (will be implemented in a later step)
    const handleAddWallet = () => {
        if (mnemonicWords[0] === " " || wallets.length === 0) {
            toast.error("Please generate a base wallet first.");
            return;
        }
        if (pathTypes.length === 0) {
            toast.error("Blockchain type not selected.");
            return;
        }

        const newWallet = generateWalletFromMnemonic(
            pathTypes[0], // Use the currently selected path type
            mnemonicWords.join(" "), // Use the existing mnemonic
            wallets.length // Use the next available index
        );

        if (newWallet) {
            setWallets([...wallets, newWallet]); // Add new wallet to the array
            setVisiblePrivateKeys([...visiblePrivateKeys, false]);
            setVisiblePhrases([...visiblePhrases, false]);
            toast.success("New wallet added successfully!");
        }
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
                                    onClick={() => handleAddWallet()}
                                >
                                    Generate Keys
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
            {wallets.length > 0 && ( // Only show this section if wallets exist
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.3, // Delayed animation for this section
                        duration: 0.3,
                        ease: "easeInOut",
                    }}
                    className="flex flex-col gap-8 mt-6"
                >
                    {/* Wallet Section Header with Actions */}
                    <div className="flex md:flex-row flex-col justify-between w-full gap-4 md:items-center">
                        <h2 className="tracking-tighter text-3xl md:text-4xl font-extrabold">
                            {pathTypeName} Wallet {/* Displays "Solana Wallet" or "Ethereum Wallet" */}
                        </h2>
                        <div className="flex gap-2">
                            {wallets.length > 1 && ( // Grid/List view toggle only if more than one wallet
                                <Button
                                    variant={"ghost"}
                                    onClick={() => setGridView(!gridView)}
                                    className="hidden md:block" // Hidden on small screens
                                >
                                    {gridView ? <Grid2X2 /> : <List />} {/* Icon changes based on view */}
                                </Button>
                            )}
                            <Button className=" text-lg  border  border-black  dark:border-white px-4 py-2 rounded transition-colors duration-300" onClick={() => handleAddWallet()}>Add Wallet</Button> {/* Add another wallet from same mnemonic */}
                            {/* Clear All Wallets Button with AlertDialog Confirmation */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="self-end bg-red-700 hover:bg-red-900">
                                        Clear Wallets
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you sure you want to delete all wallets?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete
                                            your wallets and keys from local storage.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleClearWallets()}>
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    {/* Wallet Cards Display */}
                    <div
                        className={`grid gap-6 grid-cols-1 col-span-1  ${gridView ? "md:grid-cols-2 lg:grid-cols-3" : "" // Dynamic grid layout based on `gridView` state
                            }`}
                    >
                        {wallets.map((wallet: Wallet, index: number) => (
                            <motion.div // Animation for each wallet card
                                key={index}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 0.3 + index * 0.1, // Staggered animation for each card
                                    duration: 0.3,
                                    ease: "easeInOut",
                                }}
                                className="flex flex-col rounded-2xl border border-primary/10"
                            >
                                {/* Wallet Card Header (Wallet # and Delete Button) */}
                                <div className="flex justify-between px-8 py-6">
                                    <h3 className="font-bold text-2xl md:text-3xl tracking-tighter ">
                                        Wallet {index + 1}
                                    </h3>
                                    {/* Individual Wallet Delete Button with AlertDialog Confirmation */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="flex gap-2 items-center"
                                            >
                                                <Trash className="size-4 text-red-700 " />  {/* Trash icon */}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you sure you want to delete this wallet? {/* Corrected title */}
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently
                                                    delete this wallet and its keys from local storage. {/* Corrected description */}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteWallet(index)} // Calls delete function for this specific wallet
                                                    className="text-destructive" // Styles "Delete" button as destructive
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                {/* Public and Private Key Display */}
                                <div className="flex flex-col gap-8 px-8 py-4 rounded-2xl bg-secondary/50">
                                    {/* Public Key */}
                                    <div
                                        className="flex flex-col w-full gap-2"
                                        onClick={() => copyToClipboard(wallet.publicKey)} // Click to copy public key
                                    >
                                        <span className="text-lg md:text-xl font-bold tracking-tighter">
                                            Public Key
                                        </span>
                                        <p className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate">
                                            {wallet.publicKey}
                                        </p>
                                    </div>
                                    {/* Private Key */}
                                    <div className="flex flex-col w-full gap-2">
                                        <span className="text-lg md:text-xl font-bold tracking-tighter">
                                            Private Key
                                        </span>
                                        <div className="flex justify-between w-full items-center gap-2">
                                            <p
                                                onClick={() => copyToClipboard(wallet.privateKey)} // Click to copy private key
                                                className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate"
                                            >
                                                {visiblePrivateKeys[index]
                                                    ? wallet.privateKey
                                                    : "•".repeat(wallet.privateKey.length > 0 ? wallet.privateKey.length : 20)} {/* Mask based on actual private key length */}
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
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default WalletGenerator;