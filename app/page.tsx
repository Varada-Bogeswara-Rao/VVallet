import GetBalance from "@/components/GetBalance";
import NavBar from "@/components/NavBar";
import  ModeToggle  from "@/components/ui/mode-toggle";
import WalletGenerator from "@/components/WalletGenerator";
import Image from "next/image";

export default function Home() {
  return (
   <div className="flex flex-col">
    <NavBar/>
    <GetBalance />
   
    <WalletGenerator />

   </div>
  )
}