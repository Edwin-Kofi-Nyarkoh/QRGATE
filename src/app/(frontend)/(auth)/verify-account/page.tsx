"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type FormData = z.infer<typeof schema>;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailFromQuery, otp: "" },
  });

  useEffect(() => {
    if (emailFromQuery) setValue("email", emailFromQuery);
  }, [emailFromQuery, setValue]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const res = await fetch("/api/auth/verify-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, otp: data.otp }),
    });
    setLoading(false);
    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Verified successfully");
      router.push("/login");
    } else {
      alert(result.error || "Verification failed");
    }
  };

  return (
    <Card className="max-w-sm mx-auto my-32">
      <CardHeader>
        <CardTitle>Verify Email</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} disabled={!!emailFromQuery} />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label>OTP Code</Label>
            <Input type="text" maxLength={6} {...register("otp")} />
            {errors.otp && <p className="text-red-600 text-sm mt-1">{errors.otp.message}</p>}
          </div>
          <div className="text-sm text-gray-500">
            {timeLeft > 0 ? (
              <p>
                OTP expires in: <strong>{formatTime(timeLeft)}</strong>
              </p>
            ) : (
              <p className="text-red-500">OTP expired.</p>
            )}
          </div>
          <Button type="submit" disabled={loading || timeLeft === 0} className="w-full">
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
