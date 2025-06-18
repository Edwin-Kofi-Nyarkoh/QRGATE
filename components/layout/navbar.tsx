"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  ShoppingCart,
  Ticket,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { UserSidebar } from "@/components/layout/user-sidebar";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/lib/store/cart-store";
import Image from "next/image";
import { useCurrentUser } from "@/lib/services";
import { ModeToggle } from "../theme-toggle";
import { usePathname } from "next/navigation";

export function Navbar() {
  // State for managing cart and user sidebar visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  // Get session and user data
  const { data: session } = useSession();
  const { data: user, isLoading: loadingUserSession } = useCurrentUser({
    enabled: !!session,
  });
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();
  const pathname = usePathname();
  const isSticky = pathname === "/" || pathname.startsWith("/events");

  return (
    <nav
      className={`bg-background px-4 py-3 dark:bg-background dark:text-foreground ${
        isSticky ? "sticky top-0 z-30" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Image
              src="/logo.png"
              alt="QRGates Logo"
              width={40}
              height={40}
              className="h-8 w-8 rounded-full object-cover"
              loading="lazy"
              unoptimized
              quality={100}
              fetchPriority="high"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            />
            <span className="hidden sm:inline">QRGates</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link
            href="/"
            className="hover:text-foreground transition-colors font-medium"
          >
            HOME
          </Link>
          <Link
            href="/events"
            className="hover:text-foreground transition-colors font-medium"
          >
            DISCOVER EVENTS
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Cart */}
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-primary relative dark:text-gray-100 dark:hover:text-primary"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">CART</span>
                {cartCount > 0 && (
                  <Badge className="ml-2 bg-primary text-white dark:bg-secondary">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              {/* <SheetHeader>
                <SheetTitle>Cart</SheetTitle>
              </SheetHeader> */}
              <CartSidebar onClose={() => setIsCartOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* User Authentication */}
          {loadingUserSession ? (
            <div className="flex items-center justify-center h-10 w-10">
              <span className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : session ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.profileImage || ""}
                        alt={session.user?.name || ""}
                      />
                      <AvatarFallback className="bg-primary text-white dark:bg-background">
                        {session.user?.name?.charAt(0) ||
                          session.user?.email?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === "ORGANIZER" ? (
                    <DropdownMenuItem asChild>
                      <Link href="/organizer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/tickets">
                      <Ticket className="mr-2 h-4 w-4" />
                      <span>My Tickets</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                className="bg-transparent border border-primary hover:bg-primary hover:text-white text-primary font-medium rounded-md px-4 py-2 transition-colors"
              >
                <Link href="/auth/signin">JOIN US NOW</Link>
              </Button>
            </>
          )}

          {/* Move ModeToggle outside the session conditional so it shows always */}
          <ModeToggle />

          {/* Mobile Menu & User Sidebar */}
          <Sheet open={isUserSidebarOpen} onOpenChange={setIsUserSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 max-w-full p-0">
              {/* <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader> */}
              <UserSidebar onClose={() => setIsUserSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Mobile Navigation (not sticky, always at bottom of navbar) */}
      {!isSticky && (
        <div className="flex w-full justify-center gap-8 mt-2 md:hidden order-last">
          <Link
            href="/"
            className="hover:text-primary transition-colors font-medium"
          >
            HOME
          </Link>
          <Link
            href="/events"
            className="hover:text-primary transition-colors font-medium"
          >
            DISCOVER EVENTS
          </Link>
        </div>
      )}
    </nav>
  );
}
