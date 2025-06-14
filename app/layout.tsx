import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QRGate - Ticket Booking App",
  description: "The best solution for buying & selling tickets online.",
  keywords: [
    "ticket booking",
    "event tickets",
    "buy tickets",
    "sell tickets",
    "online ticketing",
    "event management",
    "ticket marketplace",
    "QRGate",
    "event booking",
    "ticket sales",
  ],
  authors: [
    {
      name: "Edwin Kofi Nyarkoh",
      url: "www.github.com/Edwin-Kofi-Nyarkoh",
    },
    {
      name: "Masood Acheampong",
      url: "www.github.com/masood-zone",
    },
  ],
  generator: "QRGates Dev Team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
