import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export const metadata = {
  title: "Dashboard | QRGate",
  description: "Your personal dashboard",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return <DashboardOverview user={session?.user} />
}
