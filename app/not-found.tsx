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
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            What's next ?
          </h2>
          <p className="text-gray-600 mb-8">
            BACK TO{" "}
            <Link href="/" className="text-blue-500 underline font-semibold">
              HOMEPAGE
            </Link>{" "}
            OR{" "}
            <Link
              href="/events"
              className="text-blue-500 underline font-semibold"
            >
              DISCOVERY
            </Link>{" "}
            EVENTS
          </p>

          {/* Search Bar */}
          <div className="flex max-w-2xl mx-auto">
            <Input
              placeholder="What do you want to search for ?"
              className="flex-1 h-12 text-lg"
            />
            <Button className="h-12 px-8 bg-blue-500 hover:bg-blue-600">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
