"use client"

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

// Validation Schema with Zod
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

// infer typescript from schema

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage(){
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState:{errors, isSubmitting}
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        const res = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        });
    
        if (res?.ok) {
          router.push("/");
        } else {
          alert("Login failed. Check your credentials.");
        }
      };
    
      const handleSocialLogin = async (provider: "google" | "github") => {
        await signIn(provider, { callbackUrl: "/" });
      };

      return (
        <Card className="max-w-sm mx-auto my-32">
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  {...register("email")}
                  disabled={isSubmitting}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  {...register("password")}
                  disabled={isSubmitting}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
    
            <div className="my-4 text-center text-sm text-gray-600">or continue with</div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleSocialLogin("google")}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <FcGoogle className="text-xl" />
                Login with Google
              </Button>
              <Button
                onClick={() => handleSocialLogin("github")}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <FaGithub className="text-xl" />
                Login with GitHub
              </Button>
            </div>
    
            <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/signUp" className="text-blue-600 hover:text-blue-800">
                  Sign up
                </Link>
              </p>
              <p>
                <Link
                  href="/forgot-password"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Forgot Password?
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      );
}