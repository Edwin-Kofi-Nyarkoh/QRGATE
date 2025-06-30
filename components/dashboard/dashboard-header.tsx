"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, User, Menu } from "lucide-react";
import { useSidebarToggle } from "@/components/sidebar-toggle-context";

export function DashboardHeader() {
  const { data: session } = useSession();
  const { setOpen } = useSidebarToggle();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-card border-b border-border sticky top-0 z-20">
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
        <h2 className="truncate text-lg md:text-xl font-semibold text-foreground">
          Welcome back, {session?.user?.name || "User"}
        </h2>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="w-5 h-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session?.user?.image || ""}
                  alt={session?.user?.name || ""}
                />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0) || "U"}
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
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
