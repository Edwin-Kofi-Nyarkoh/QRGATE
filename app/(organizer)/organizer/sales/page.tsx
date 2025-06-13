import { Suspense } from "react"
import { TicketSalesPage } from "@/components/organizer/ticket-sales-page"
import { PageLoader } from "@/components/ui/loader"

export default function Sales() {
  return (
    <Suspense fallback={<PageLoader />}>
      <TicketSalesPage />
    </Suspense>
  )
}
