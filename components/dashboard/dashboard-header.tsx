"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, LogOut, User, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useSidebarToggle } from "@/components/sidebar-toggle-context";

export function DashboardHeader() {
  const { data: session } = useSession();
  const { setOpen } = useSidebarToggle();

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-3 md:py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center min-w-0 gap-2">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg md:text-2xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              Welcome back, {session?.user?.name || "User"}!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                  />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) ||
                      session?.user?.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
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
        </div>
      </div>
    </header>
  );
}
