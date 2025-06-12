"use client";


import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    if (!session) {
      alert("You must log in first to join.");
      return;
    }
    if (!email) {
      setMessage("Please enter your email");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application-json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Subscribed successfully!");
        setEmail("");
      } else {
        setMessage(data.error || "Failed to subscribe.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 pt-10 pb-6 px-6 md:px-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Info */}
        <div>
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white uppercase">
            QRGATE
          </h2>
          <p className="text-sm">
            Your one-stop website for Tickets, all trending and Popular events are here.
            Affordable & Reliable.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/products">All Events</Link>
            </li>
            <li>
              <Link href="/products/category/shoes">Entertainment</Link>
            </li>
            <li>
              <Link href="/products/category/shirts">Education</Link>
            </li>
            <li>
              <Link href="/cart">Cart</Link>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h3 className="font-semibold mb-3">Customer Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/help">I want to become an Admin</Link>
            </li>
            <li>
              <Link href="/returns">My Orders</Link>
            </li>
            <li>
              <Link href="/shipping">FAQ&apos;s</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter + Socials */}
        <div>
          <h3 className="font-semibold mb-3">Subscribe</h3>
          <p className="text-sm mb-3">
            Get updates on new arrivals and exclusive offers.
          </p>
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm"
            />
            <Button onClick={handleSubscribe} disabled={loading} size="sm">
              {loading ? "Joining..." : "Join"}
            </Button>
            <div>{message && <p className="text-sm">{message}</p>}</div>
          </div>
          <div className="flex gap-4 text-gray-600 dark:text-gray-300">
            <a href="#" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" aria-label="YouTube">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 dark:border-gray-700 pt-4 text-center text-xs">
        <p>
          &copy; {new Date().getFullYear()} QRGATE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
