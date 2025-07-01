import { OrderHistoryPage } from "@/components/dashboard/order-history-page"

export const metadata = {
  title: "Order History | QRGate",
  description: "View your order history and transaction details",
}

export default function DashboardOrdersPage() {
  return <OrderHistoryPage />
}
