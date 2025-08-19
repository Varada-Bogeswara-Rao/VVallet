"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/app/components/ui/switch"; // Ensure this path is correct for your Switch component

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect runs only on the client side, after the initial render.
  // This helps prevent hydration mismatches, especially when accessing `window` or `localStorage`.
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // If the component hasn't mounted yet (i.e., during server-side rendering or initial client-side hydration),
  // return null to prevent errors related to browser-specific APIs (like window.matchMedia).
  if (!mounted) {
    return null;
  }

  // Determine if the current theme is dark or if the system preference is dark.
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="flex items-center gap-2">
      {/* Sun icon: Dims when in dark mode */}
      <Sun
        className={`h-5 w-5 ${isDarkMode ? "text-primary/50" : "text-primary"}`}
      />
      {/* Switch component: Toggles between dark and light themes */}
      <Switch
        checked={isDarkMode}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      {/* Moon icon: Brightens when in dark mode */}
      <Moon
        className={`h-5 w-5 ${isDarkMode ? "text-primary" : "text-primary/50"}`}
      />
    </div>
  );
}
