"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScanTicket } from "@/components/security/scan-ticket"
import { SecurityOfficerStats } from "@/components/security/security-officer-stats"
import { Calendar, MapPin, Users, Ticket, Clock } from "lucide-react"
import { format } from "date-fns"

interface EventData {
  id: string
  title: string
  description: string | null
  location: string
  startDate: Date
  endDate: Date
  mainImage: string | null
  status: string
  totalTickets: number
  soldTickets: number
  organizer: {
    name: string | null
    email: string
  }
}

interface OfficerData {
  id: string
  name: string
  email: string
  phone: string
  active: boolean
  user?: {
    id: string
    name: string | null
    email: string
    profileImage: string
  }
}

interface SecurityOfficerVerificationPageProps {
  eventId: string
  securityId: string
  eventData: EventData
  officerData: OfficerData
}

export function SecurityOfficerVerificationPage({
  eventId,
  securityId,
  eventData,
  officerData,
}: SecurityOfficerVerificationPageProps) {
  const [activeTab, setActiveTab] = useState("scan")
  const [verificationStats, setVerificationStats] = useState({
    totalVerified: 0,
    recentActivity: 0,
  })

  // Calculate event status
  const now = new Date()
  const startDate = new Date(eventData.startDate)
  const endDate = new Date(eventData.endDate)

  let eventStatus = "upcoming"
  if (now >= startDate && now <= endDate) {
    eventStatus = "ongoing"
  } else if (now > endDate) {
    eventStatus = "completed"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ongoing":
        return "Live Now"
      case "completed":
        return "Completed"
      case "upcoming":
        return "Upcoming"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-6">
      {/* Event Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{eventData.title}</CardTitle>
                <Badge className={getStatusColor(eventStatus)}>{getStatusText(eventStatus)}</Badge>
              </div>
              {eventData.description && <p className="text-gray-600 text-sm">{eventData.description}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-gray-600">{format(new Date(eventData.startDate), "MMM dd, yyyy")}</p>
                <p className="text-xs text-gray-500">{format(new Date(eventData.startDate), "h:mm a")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-gray-600">{format(new Date(eventData.endDate), "MMM dd, yyyy")}</p>
                <p className="text-xs text-gray-500">{format(new Date(eventData.endDate), "h:mm a")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-gray-600">{eventData.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Tickets</p>
                <p className="text-sm text-gray-600">
                  {eventData.soldTickets} / {eventData.totalTickets}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((eventData.soldTickets / eventData.totalTickets) * 100)}% sold
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Organized by {eventData.organizer.name || eventData.organizer.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Verification Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Scan Tickets
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-4">
          <ScanTicket
            eventId={eventId}
            securityId={securityId}
            onVerificationUpdate={(stats) => setVerificationStats(stats)}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <SecurityOfficerStats eventId={eventId} securityId={securityId} eventData={eventData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
