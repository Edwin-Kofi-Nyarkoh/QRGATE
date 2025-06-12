import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/date-utils";

interface RelatedEventsProps {
  events: any[]; // Using any for simplicity, but should be properly typed
}

export function RelatedEvents({ events }: RelatedEventsProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Related Events</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <Image
                  src={
                    event.mainImage || "/placeholder.svg?height=200&width=400"
                  }
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-center">
                  <div className="text-xl font-bold">
                    {new Date(event.startDate).getDate()}
                  </div>
                  <div className="text-xs">
                    {new Date(event.startDate).toLocaleString("default", {
                      month: "short",
                    })}
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">
                  {event.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(event.startDate)}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-600">
                    {event._count.tickets} attendees
                  </span>
                  <span className="font-bold text-primary">
                    ${event.price.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
