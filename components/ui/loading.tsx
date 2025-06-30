"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader } from "@/components/ui/loader";

interface LoadingPageProps {
  message?: string;
  showProgress?: boolean;
}

export function LoadingPage({
  message = "Loading...",
  showProgress = false,
}: LoadingPageProps) {
  const [progress, setProgress] = useState(0);
  const logoUrl = process.env.NEXT_PUBLIC_APP_LOGO || "/logo.png";

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [showProgress]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-white dark:bg-background rounded-full p-4 shadow-lg">
            <Image
              src={logoUrl || "/placeholder.svg"}
              alt="QRGate Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
              priority
            />
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center space-y-4">
          <Loader size="lg" variant="spinner" />

          {/* Message */}
          <p className="text-lg font-medium text-foreground animate-pulse">
            {message}
          </p>

          {/* Progress Bar */}
          {showProgress && (
            <div className="w-64 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Animated Dots */}
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-8 text-center">
        <p className="text-sm text-muted-foreground">
          QRGate - Your Ticket Booking Solution
        </p>
      </div>
    </div>
  );
}

export function AppLoadingPage() {
  return <LoadingPage message="Initializing QRGate..." showProgress />;
}

export function AuthLoadingPage() {
  return <LoadingPage message="Authenticating..." />;
}

export function DashboardLoadingPage() {
  return <LoadingPage message="Loading Dashboard..." />;
}
