import { WalletMinimal } from "lucide-react";
import React from "react";
import ModeToggle from "../components/ui/mode-toggle";

const NavBar = () => {
    return (
        <nav className="flex justify-between items-center py-4">
            <div className="flex  gap-4">
                <WalletMinimal className="size-18" />

                <p className=" text-6xl">VVallet</p>
            </div>
            <div>
                <ModeToggle />
            </div>

        </nav>
    );
};

export default NavBar;

