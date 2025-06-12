"use client";

import { useEffect, useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTicketCart } from './cart/TicketCartContext';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarCheck } from "lucide-react";
import { HiOutlineCloudUpload } from "react-icons/hi";
import ThemeToggle from "./themeToggle";

type EventResult = {
    id: string;
    name: string;
    slug: string;
  };

const Navbar = () => {

    const [query, setQuery] = useState('');
  const [results, setResults] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();
  const { cart } = useTicketCart();
  const router = useRouter();
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  
  
  useEffect(() => {
      if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
        setLoading(true);
      try {
          const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
          console.error('Search error:', err);
        setResults([]);
    } finally {
        setLoading(false);
    }
}, 300); // Debounce

return () => clearTimeout(timeout);
}, [query]);

useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (searchRef.current && !searchRef.current.contains(target)) {
      setQuery('');
      setResults([]);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

if (status === 'loading') return null;

  const handleSelect = (slug: string) => {
    setQuery('');
    setResults([]);
    router.push(`/events/${slug}`);
  };
  

  return (
    <header className="bg-white/90 dark:bg-gray-900/60 text-black dark:text-white backdrop-blur-md px-6 py-3 flex items-center justify-between fixed top-0 left-0 w-full z-50 shadow-sm transition-all duration-500">
      {/* Left: Logo + Search */}
      <div className="flex items-center space-x-4 flex-nowrap w-full">
        {/* Logo */}
        <div
          className="sm:text-lg font-bold cursor-pointer uppercase"
          onClick={() => router.push("/")}
        >
          QRGATE
        </div>

        {/* Search */}
        <div ref={searchRef} className="flex-grow max-w-xs sm:max-w-sm lg:max-w-md">
          <Input
            placeholder="Search events..."
            className="w-full bg-transparent border border-gray-300 dark:border-gray-700 text-black dark:text-white transition-all duration-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
           {query && (
    <button
      onClick={() => {
        setQuery('');
        setResults([]);
      }}
      className="absolute right-[600px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
    >
      ×
    </button>
  )}
          {loading && <p className="absolute text-sm text-gray-400 mt-4">Searching...</p>}
          {results.length > 0 && (
        <ul className="absolute w-full border mt-4 rounded shadow z-50 max-h-60 overflow-y-auto">
          {results.map((event) => (
            <li
              key={event.id}
              onClick={() => handleSelect(event.slug)}
              className="p-2 cursor-pointer bg-white dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-gray-500"
            >
              {event.name}
            </li>
          ))}
        </ul>
      )}
        </div>
      </div>

      {/* Right: Theme toggle + Cart + Auth */}
      <div className="flex items-center space-x-1 sm:space-x-4">
        <ThemeToggle />

        {/* Upload Icon */}
        <HiOutlineCloudUpload
          onClick={() => router.push('/eventUpload')}
          className="cursor-pointer"
        />

        {/* Cart Button */}
        <Button
          variant="link"
          className="relative p-0 hover:no-underline"
          onClick={() => router.push("/cart")}
        >
          <CalendarCheck className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
              {totalItems}
            </span>
          )}
        </Button>

        {/* Auth Button */}
        <div>
          {session ? (
            <Button onClick={() => signOut()}>
              Logout
            </Button>
          ) : (
            <Button onClick={() => router.push('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
