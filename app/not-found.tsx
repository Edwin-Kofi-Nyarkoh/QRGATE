import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Geometric Background */}
      <section
        className="relative h-96 flex items-center justify-center text-white"
        style={{
          backgroundImage: "url('/not-found.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center">
          <p className="text-sm uppercase tracking-wider mb-4 opacity-90">
            WE ARE SORRY
          </p>
          <h1 className="text-5xl md:text-7xl font-bold">PAGE NOT FOUND</h1>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-8">What's next ?</h2>
          <p className=" mb-8">
            BACK TO{" "}
            <Link href="/" className="text-blue-500 underline font-semibold">
              HOMEPAGE
            </Link>{" "}
            OR{" "}
            <Link
              href="/events"
              className="text-blue-500 underline font-semibold"
            >
              DISCOVER
            </Link>{" "}
            EVENTS
          </p>
        </div>
      </section>
    </div>
  );
}
