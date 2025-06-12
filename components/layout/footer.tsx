"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Rss,
} from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      {/* Back to Top Button */}
      <div className="flex justify-center py-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-orange-500 hover:bg-orange-600 rounded-full"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">CONTACT.</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Address: 123 Street, Province, Country</p>
              <p>Phone: +84. 123 456 78 / 84. 111 222 333</p>
              <p>
                Email:{" "}
                <Link href="mailto:info@ticketbox.me" className="text-blue-400">
                  info@ticketbox.me
                </Link>
              </p>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-semibold mb-4">INFORMATION.</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/about"
                className="block text-gray-300 hover:text-white"
              >
                About Us
              </Link>
              <Link
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
              </Link>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h3 className="font-semibold mb-4">CUSTOMER.</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/account"
                className="block text-gray-300 hover:text-white"
              >
                My Account
              </Link>
              <Link
                href="/order-history"
                className="block text-gray-300 hover:text-white"
              >
                Order History
              </Link>
              <Link
                href="/create-event"
                className="block text-gray-300 hover:text-white"
              >
                Create event
              </Link>
              <Link
                href="/events"
                className="block text-gray-300 hover:text-white"
              >
                Events list
              </Link>
            </div>
          </div>

          {/* Extra Links */}
          <div>
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
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">NEWSLETTER.</h3>
            <p className="text-sm text-gray-300 mb-4">
              Get the news updated via email ...
            </p>
            <div className="space-y-2">
              <Input
                placeholder="Email address..."
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
              <Button className="w-full bg-green-500 hover:bg-primary">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-slate-600" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            COPYRIGHT 2015 <span className="font-semibold">TICKETBOX</span>.
            DESIGN BY <span className="font-semibold">BONCHENKI</span> with
            PASSION.
          </p>

          {/* Social Links */}
          <div className="flex gap-2">
            {[Facebook, Twitter, Instagram, Youtube, Linkedin, Rss].map(
              (Icon, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-slate-700"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
