"use client"
import { toast } from "sonner";

export const copyToClipboard = (content: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(content)
            .then(() => toast.success("Copied to clipboard!"))
            .catch(() => fallbackCopy(content));
    } else {
        fallbackCopy(content);
    }

    function fallbackCopy(text: string) {
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed"; // Prevent scrolling to bottom
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            toast.success("Copied to clipboard!");
        } catch {
            toast.error("Failed to copy!");
        }
    }
}
// export const togglePrivateKeyVisibility = (index: number, visiblePrivateKeys ,setVisiblePrivateKeys:(show:string) => void) =>{
//     setVisiblePrivateKeys(
//         visiblePrivateKeys.map((visible:string, i: number) => (i === index ? !visible : visible))
//     );
// }