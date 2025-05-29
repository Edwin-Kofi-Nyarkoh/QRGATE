"use client";

import { useState, useEffect } from "react";
import { useTicketCart } from "@/components/cart/TicketCartContext";
import Card from "./card";

interface Event {
  id: number;
  name: string;
  slug: string;
  stock: number;
  organiserEmail: string;
  organiserContact: string;
  startDate: string;
  endDate: string;
  description: string;
  price: number;
  image: string;
}

interface TrendingSectionProps {
  limit?: number;
}

export default function Trending({ limit }: TrendingSectionProps) {
  const { addToCart } = useTicketCart();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedQuantity, setSelectedQuantity] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/event");
        if (!res.ok) throw new Error("Failed to fetch trending events");
        const data: Event[] = await res.json();
        setEvents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading trending events...</p>;
  }

  const displayedEvents = limit ? events.slice(0, limit) : events;

  const handleAddToCart = (event: Event) => {
    const quantity = selectedQuantity[event.id] || 1;
    addToCart({
      eventId: event.id,
      eventName: event.name,
      price: event.price,
      quantity,
    });
  };

  return (
    <div className="px-6 md:px-16">
      <h1 className="text-2xl font-bold mb-6 capitalize">Trending Events</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displayedEvents.map((event) => (
          <Card
            key={event.id}
            image={event.image}
            name={event.name}
            slug={event.slug}
            price={event.price}
            description={event.description}
            organiserEmail={event.organiserEmail}
            organiserContact={event.organiserContact}
            startDate={event.startDate}
            endDate={event.endDate}
            quantity={selectedQuantity[event.id] || 1}
            onQuantityChange={(val) =>
              setSelectedQuantity((prev) => ({ ...prev, [event.id]: val }))
            }
            onAddToCart={() => handleAddToCart(event)}
          />
        ))}
      </div>
    </div>
  );
}
