"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Send,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { apiPost } from "@/lib/services"
import { toast } from "sonner"

export function Footer() {
  const [email, setEmail] = useState("")

  // Use the mutation hook at component level
  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiPost("/newsletter", { email })
    },
    onSuccess: () => {
      toast.success("You've subscribed successfully!")
      setEmail("") 
    },
    onError: () => {
      toast.error("Subscription failed. Please try again.")
    },
  })

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault() 
    if (email.trim()) {
      newsletterMutation.mutate(email)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-slate-900 text-white">
      <div className="flex justify-center py-6 bg-slate-800">
        <Button
          variant="ghost"
          size="icon"
          className="bg-primary hover:bg-slate-600 rounded-full text-white hover:text-white transition-all duration-300"
          onClick={scrollToTop}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {/* Company Info & Contact */}
          <div className="lg:col-span-2 xl:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">QRGate</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Revolutionizing event management with cutting-edge QR technology. Create, manage, and track your events
                seamlessly with our comprehensive platform.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-white mb-4">GET IN TOUCH</h3>
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <div>
                  <p>University of Cape Coast</p>
                  <p>Cape Coast, Central Region, Ghana</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <Link href="tel:+233598346928" className="hover:text-white transition-colors">
                  +233 59 834 6928
                </Link>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <Link href="mailto:info@qrgates.me" className="hover:text-white transition-colors">
                  info@qrgates.me
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg text-white mb-4">QUICK LINKS</h3>
            <div className="space-y-3 text-sm">
              <Link
                href="/about"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                About Us
              </Link>
              <Link
                href="/events"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Browse Events
              </Link>
              <Link
                href="/create-event"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Create Event
              </Link>
              <Link
                href="/pricing"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="font-semibold text-lg text-white mb-4">SUPPORT</h3>
            <div className="space-y-3 text-sm">
              <Link
                href="/dashboard"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                My Account
              </Link>
              <Link
                href="/dashboard/events"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                My Events
              </Link>
              <Link
                href="/dashboard/tickets"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                My Tickets
              </Link>
              <Link
                href="/help"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Help Center
              </Link>
              <Link
                href="/support"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Support
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2 xl:col-span-1">
            <h3 className="font-semibold text-lg text-white mb-4">STAY UPDATED</h3>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Subscribe to our newsletter and never miss out on the latest events, features, and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={newsletterMutation.isPending}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-400 focus:border-primary focus:ring-primary pr-12"
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <Button
                type="submit"
                disabled={newsletterMutation.isPending}
                className="w-full bg-primary hover:bg-muted-foreground text-white transition-colors duration-200"
              >
                {newsletterMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Subscribe
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8 bg-slate-700" />

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
            <p className="text-center sm:text-left">
              © 2025 <span className="font-semibold text-white">QRGate</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-600">•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="text-slate-600">•</span>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 mr-2">Follow us:</span>
            {[
              { Icon: Facebook, href: "https://facebook.com/qrgate", label: "Facebook" },
              { Icon: Twitter, href: "https://twitter.com/qrgate", label: "Twitter" },
              { Icon: Instagram, href: "https://instagram.com/qrgate", label: "Instagram" },
              { Icon: Youtube, href: "https://youtube.com/qrgate", label: "YouTube" },
              { Icon: Linkedin, href: "https://linkedin.com/company/qrgate", label: "LinkedIn" },
              { Icon: Github, href: "https://github.com/qrgate", label: "GitHub" },
            ].map(({ Icon, href, label }, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                asChild
                className="text-gray-400 hover:text-white hover:bg-slate-700 transition-all duration-200 hover:scale-110"
              >
                <Link href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  <Icon className="w-4 h-4" />
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Developer Credit */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-center text-xs text-gray-500">
            Crafted with ❤️ by the <span className="font-semibold text-gray-400">QRGate Team</span> • Powered by Next.js
            & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}
