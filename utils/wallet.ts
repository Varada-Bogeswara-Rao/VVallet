import { GenerateWalletArgs, handleAddWalletProps, handleClearWalletsProps, handleDeleteWalletsProps, Wallet } from "@/types/wallet";
import { Keypair } from "@solana/web3.js";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { toast } from "sonner";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { ethers } from "ethers";


export const handleGenerateWallet = ({
    mnemonicInput,
    pathTypes,
    wallets,
    visiblePrivateKeys,
    visiblePhrases,
    setMnemonicWords,
    setWallets,
    setVisiblePrivateKeys,
    setVisiblePhrases,

}: GenerateWalletArgs) =>{
    let mnemonic = mnemonicInput.trim();

    if (mnemonic) {
      if (!validateMnemonic(mnemonic)) {
        toast.error("Invalid recovery phrase. Please try again.");
        return;
      }
    } else {
      mnemonic = generateMnemonic();
    }

    const words = mnemonic.split(" ");
    setMnemonicWords(words);

    const wallet = generateWalletFromMnemonic(
      pathTypes[0],
      mnemonic,
      wallets.length
    );
    if (wallet) {
      const updatedWallets = [...wallets, wallet];
      setWallets(updatedWallets);
      localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      localStorage.setItem("mnemonics", JSON.stringify(words));
      localStorage.setItem("paths", JSON.stringify(pathTypes));
      setVisiblePrivateKeys([...visiblePrivateKeys, false]);
      setVisiblePhrases([...visiblePhrases, false]);
      toast.success("Wallet generated successfully!");
    }
    
}

const generateWalletFromMnemonic = (
    pathType: string,
    mnemonic: string,
    accountIndex: number
) : Wallet | null =>{

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
        privateKeyEncoded = privateKey;

        const wallet = new ethers.Wallet(privateKey);
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
      toast.error("Failed to generate wallet. Please try again.");
      return null;
    }


};

export const handleAddWallet = ({

  mnemonicWords,
  pathTypes,
  wallets,
  setWallets,
  visiblePrivateKeys,
  visiblePhrases,

  setVisiblePrivateKeys,
  setVisiblePhrases
}:handleAddWalletProps) =>{
  if (!mnemonicWords) {
        toast.error("No mnemonic found. Please generate a wallet first.");
        return;
      }

      const wallet = generateWalletFromMnemonic(
        pathTypes[0],
        mnemonicWords.join(" "),
        wallets.length
      );
      if (wallet) {
        const updatedWallets = [...wallets, wallet];
        const updatedPathType = [pathTypes, pathTypes];
        setWallets(updatedWallets);
        localStorage.setItem("wallets", JSON.stringify(updatedWallets));
        localStorage.setItem("pathTypes", JSON.stringify(updatedPathType));
        setVisiblePrivateKeys([...visiblePrivateKeys, false]);
        setVisiblePhrases([...visiblePhrases, false]);
        toast.success("Wallet generated successfully!");
      }

}

export const handleClearWallets = ({

  setWallets,
  setMnemonicWords,
  setPathTypes,
  setVisiblePhrases,
  setVisiblePrivateKeys,

}:handleClearWalletsProps) =>{
    localStorage.removeItem("wallets");
    localStorage.removeItem("mnemonics");
    localStorage.removeItem("paths");
    setWallets([]);
    setMnemonicWords([]);
    setPathTypes([]);
    setVisiblePrivateKeys([]);
    setVisiblePhrases([]);
    toast.success("All wallets cleared.");

}

export const handleDeleteWallets = ({
  setWallets,
  setPathTypes,
  wallets,
  pathTypes,
  visiblePhrases,
  setVisiblePhrases,
  setVisiblePrivateKeys,
  visiblePrivateKeys,
  index,

}: handleDeleteWalletsProps ) =>{
    const updatedWallets = wallets.filter((_, i) => i !== index);
    const updatedPathTypes = pathTypes.filter((_, i) => i !== index);

    setWallets(updatedWallets);
    setPathTypes(updatedPathTypes);
    localStorage.setItem("wallets", JSON.stringify(updatedWallets));
    localStorage.setItem("paths", JSON.stringify(updatedPathTypes));
    setVisiblePrivateKeys(visiblePrivateKeys.filter((_, i) => i !== index));
    setVisiblePhrases(visiblePhrases.filter((_, i) => i !== index));
    toast.success("Wallet deleted successfully!");

}