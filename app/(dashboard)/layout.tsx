import type React from "react";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarToggleProvider } from "@/components/sidebar-toggle-context";
import { getCurrentUser } from "../api/auth/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <SidebarToggleProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <DashboardHeader />
        <div className="flex flex-1 min-h-0">
          <DashboardSidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarToggleProvider>
  );
}
