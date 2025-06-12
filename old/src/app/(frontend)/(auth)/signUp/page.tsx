"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

// 1. Define your validation schema with Zod
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// 2. Infer TypeScript types from schema
type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // 3. On submit, data is typed & validated
  const onSubmit = async (data: RegisterFormData) => {
    const res = await fetch("/api/auth/signUp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await res.json();

    if (res.ok) {
      router.push(`/verify-account?email=${encodeURIComponent(data.email)}`);
    } else {
      alert(resData.error || "Registration failed");
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <Card className="max-w-sm mx-auto my-32">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Sign Up"}
          </Button>
        </form>

        <div className="my-4 flex items-center justify-center text-sm text-gray-500">
          OR
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => handleOAuthSignIn("google")}
          >
            <FcGoogle className="text-red-500" /> Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => handleOAuthSignIn("github")}
          >
            <FaGithub /> Continue with GitHub
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800">
              Forgot Password?
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
