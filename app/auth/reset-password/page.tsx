"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      } else {
        setDone(true);
        setTimeout(() => router.push("/auth/signin"), 2000);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex py-5 items-center justify-center md:px-4">
      <Card className="w-full sm:max-w-sm max-w-auto md:max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Set a new password to access your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {done ? (
            <div className="flex flex-col items-center space-y-4 text-green-600 text-center">
              <ShieldCheck className="w-8 h-8" />
              <p className="font-medium">Password reset successfully!</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center text-sm text-gray-600">
          Need help?{" "}
          <a href="/support" className="ml-1 text-blue-600 hover:underline">
            Contact Support
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
