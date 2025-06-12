import type React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrganizerSidebar } from "@/components/organizer/organizer-sidebar";
import { OrganizerHeader } from "@/components/organizer/organizer-header";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <OrganizerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganizerHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
