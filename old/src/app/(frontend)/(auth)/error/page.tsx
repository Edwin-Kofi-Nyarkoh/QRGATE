"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = (() => {
    if (!error) return "An unknown error occurred.";

    if (error === "Email already exists with a different login method.") {
      return (
        <>
          This email is already registered with a different sign-in method.<br />
          If you forgot your password, please{" "}
          <Link href="/forgot-password" className="text-blue-600 underline">
            reset it here
          </Link>.
        </>
      );
    }

    if (error === "OAuthAccountNotLinked") {
      return "This email is linked to another account. Please use the correct sign-in method.";
    }

    return error; 
  })();

  return (
    <div className="max-w-md mx-auto my-32 p-6 border rounded shadow-sm text-center">
      <h1 className="text-2xl font-semibold mb-4 text-red-600">Authentication Error</h1>
      <p className="mb-6 text-gray-700">{errorMessage}</p>
      <Link href="/login" className="text-blue-600 underline">
        Back to login
      </Link>
    </div>
  );
}
