import type React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrganizerSidebar } from "@/components/organizer/organizer-sidebar";
import { OrganizerHeader } from "@/components/organizer/organizer-header";
import { SidebarToggleProvider } from "@/components/sidebar-toggle-context";
import { getCurrentUser } from "@/app/api/auth/actions";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !user.isOrganizer) {
    redirect("/auth/signin");
  }
  return (
    <SidebarToggleProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <OrganizerHeader />
        <div className="flex flex-1 min-h-0">
          <OrganizerSidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarToggleProvider>
  );
}
