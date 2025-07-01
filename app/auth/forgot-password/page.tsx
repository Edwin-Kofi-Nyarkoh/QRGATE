"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      } else {
        setSent(true);
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-reset-link", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to resend.");
      } else {
        alert("Reset link resent to your email.");
      }
    } catch {
      setError("Something went wrong during resend.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex py-5 items-center justify-center md:px-4">
      <Card className="w-full sm:max-w-sm max-w-auto md:max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-green-600">
                A reset link has been sent to <strong>{email}</strong>.
              </p>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleResend}
                disabled={resending}
                variant="outline"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend Link"
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center text-sm text-gray-600">
          Remembered your password?{" "}
          <a href="/auth/signin" className="ml-1 text-blue-600 hover:underline">
            Login
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
