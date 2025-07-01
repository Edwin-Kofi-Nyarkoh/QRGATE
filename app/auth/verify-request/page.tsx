import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            A sign in link has been sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-sm text-gray-600">
            If you don't see it, check your spam folder. Still nothing? Try{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              signing in
            </Link>{" "}
            again.
          </p>
          <p className="text-xs text-gray-500">
            You can close this window now and continue from your email.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
