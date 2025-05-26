
"use client";
import { useTheme } from "next-themes";
import { FaMoon, FaSun } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Prevents mismatch between SSR/CSR

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 focus:outline-none pointer pt-2"
      aria-label="Toggle Dark Mode"
    >
      <FaSun className="absolute inset-0 m-auto h-6 w-6 text-yellow-500 transition-all duration-300 scale-90 rotate-0 dark:scale-0 dark:rotate-90" />
      <FaMoon className="absolute inset-0 m-auto h-6 w-6 text-gray-200 transition-all duration-300 scale-0 rotate-90 dark:scale-80 dark:rotate-0" />
    </button>
  );
}
