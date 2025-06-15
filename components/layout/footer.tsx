"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  // Facebook,
  // Twitter,
  // Instagram,
  // Youtube,
  // Linkedin,
  // Rss,
  Github,
} from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary dark:bg-secondary text-card-foreground">
      {/* Back to Top Button */}
      <div className="flex justify-center py-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-background hover:bg-muted-foreground rounded-full"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white dark:text-card-foreground">
              CONTACT.
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Address: Cape Coast, UCC Ghana, Ghana</p>
              <p>Phone: +233 59 834 6928</p>
              <p>
                Email:{" "}
                <Link href="mailto:info@qrgates.me" className="text-blue-400">
                  info@qrgates.me
                </Link>
              </p>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-semibold mb-4 text-white dark:text-card-foreground">
              INFORMATION.
            </h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/about"
                className="block text-gray-300 hover:text-white"
              >
                About Us
              </Link>
              {/* <Link
                href="/delivery"
                className="block text-gray-300 hover:text-white"
              >
                Delivery Information
              </Link>
              <Link
                href="/privacy"
                className="block text-gray-300 hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-gray-300 hover:text-white"
              >
                Terms & Conditions
              </Link> */}
            </div>
          </div>

          {/* Customer */}
          <div>
            <h3 className="font-semibold mb-4 text-white dark:text-card-foreground">
              CUSTOMER.
            </h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/dashboard"
                className="block text-gray-300 hover:text-white hover:underline"
              >
                My Account
              </Link>
              <Link
                href="/dashboard/order-history"
                className="block text-gray-300 hover:text-white hover:underline"
              >
                Order History
              </Link>
              <Link
                href="/events"
                className="block text-gray-300 hover:text-white hover:underline"
              >
                Events list
              </Link>
            </div>
          </div>

          {/* Extra Links */}
          {/* <div>
            <h3 className="font-semibold mb-4">EXTRA LINKS.</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/partners"
                className="block text-gray-300 hover:text-white"
              >
                Our Partner
              </Link>
              <Link
                href="/vouchers"
                className="block text-gray-300 hover:text-white"
              >
                Gift Vouchers
              </Link>
              <Link
                href="/affiliates"
                className="block text-gray-300 hover:text-white"
              >
                Affiliates
              </Link>
            </div>
          </div> */}

          {/* Newsletter */}
          {/* <div>
            <h3 className="font-semibold mb-4">NEWSLETTER.</h3>
            <p className="text-sm text-gray-300 mb-4">
              Get the news updated via email ...
            </p>
            <div className="space-y-2">
              <Input
                placeholder="Email address..."
                className="  placeholder:text-gray-400"
              />
              <Button className="w-full">Subscribe</Button>
            </div>
          </div> */}
        </div>

        <Separator className="my-8 bg-slate-600" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            COPYRIGHT 2025 <span className="font-semibold">QRGate</span>.
            DEVELOPED BY <span className="font-semibold">QRGATE TEAM</span> with
            PASSION.
          </p>

          {/* Social Links */}
          <div className="flex gap-2">
            {/* {[Facebook, Twitter, Instagram, Youtube, Linkedin, Rss, Github].map( */}
            {[Github].map((Icon, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-slate-700"
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
