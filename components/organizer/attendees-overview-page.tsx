"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Search, Eye, Download } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useEvents } from "@/lib/api/events"
import { PageLoader } from "@/components/ui/loader"

export function AttendeesOverviewPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data: eventsData,
    isLoading,
    error,
  } = useEvents({
    organizerId: session?.user?.id,
    page: 1,
    limit: 50,
  })

  if (isLoading) return <PageLoader />

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">Failed to load events</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const events = eventsData?.events || []
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Attendees</h1>
          <p className="text-gray-600">Manage attendees across all your events</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
                {event.mainImage ? (
                  <img
                    src={event.mainImage || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <Badge
                  className="absolute top-2 right-2"
                  variant={
                    event.status === "UPCOMING"
                      ? "default"
                      : event.status === "ONGOING"
                        ? "secondary"
                        : event.status === "COMPLETED"
                          ? "outline"
                          : "destructive"
                  }
                >
                  {event.status}
                </Badge>
              </div>
              <CardTitle className="line-clamp-2">{event.title}</CardTitle>
              <CardDescription className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(event.startDate), "MMM dd, yyyy")}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.location}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Attendee Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">
                      {event.soldTickets} / {event.totalTickets} attendees
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {((event.soldTickets / event.totalTickets) * 100).toFixed(0)}% sold
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((event.soldTickets / event.totalTickets) * 100, 100)}%`,
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button asChild className="flex-1" size="sm">
                    <Link href={`/organizer/events/${event.id}/attendees`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Attendees
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Recent Attendees Preview */}
                {event.soldTickets > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-2">Recent attendees:</p>
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(event.soldTickets, 5))].map((_, i) => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-white">
                          <AvatarFallback className="text-xs">{String.fromCharCode(65 + i)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {event.soldTickets > 5 && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{event.soldTickets - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "No events match your search criteria." : "You haven't created any events yet."}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/organizer/events/create">Create Your First Event</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
