import GetBalance from "@/app/components/GetBalance";
import NavBar from "@/app/components/NavBar";
import ModeToggle from "@/app/components/ui/mode-toggle";
import WalletGenerator from "@/app/components/WalletGenerator";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col">
      <NavBar />
      <GetBalance />

      <WalletGenerator />

    </div>
  )
}