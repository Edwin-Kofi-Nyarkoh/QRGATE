"use client"; // Ensures this file runs only on the client

import { SessionProvider } from "next-auth/react";
//import { CartProvider } from "@/components/Cart/CartContext"; 
import { ThemeProvider } from "next-themes";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
        <ThemeProvider attribute="class" enableSystem defaultTheme="system">
      {/* <CartProvider>*/}{children} {/* </CartProvider> */}
      </ThemeProvider>
    </SessionProvider>
  );
}