import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ProfilePage } from "@/components/dashboard/profile-page"

export const metadata = {
  title: "Profile | QRGate",
  description: "Manage your profile settings",
}

export default async function DashboardProfilePage() {
  const session = await getServerSession(authOptions)

  return <ProfilePage userId={session?.user?.id || ""} />
}
