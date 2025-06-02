"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useTicketCart } from "@/components/cart/TicketCartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Event {
    id: number;
    image: string;
    name: string;
    slug: string;
    price: number;
    description: string;
    organiserEmail: string;
    organiserContact: string;
    startDate: string;
    endDate: string;
    quantity: number;
    stock: number;
}

export default function EventDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const { addToCart } = useTicketCart();
  const [event, setEvents] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(`/api/event/${slug}`);
      const data = await res.json();
      if (!data.error) {
        setEvents(data);
      }
    };
    if (slug) fetchEvent();
  }, [slug]);

  const handleAddToCart = () => {
    if (!event) return;
    addToCart({
      eventId: event.id,
      eventName: event.name,
      price: event.price,
      quantity: quantity,
    });
  };

  if (!event) {
    return <div className="p-6 text-center">Loading event...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto my-32">
      <div className="grid md:grid-cols-2 gap-6">
        <Image
          src={event.image}
          alt={event.name}
          width={600}
          height={400}
          className="rounded-lg object-cover"
        />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-gray-600">{event.description}</p>
          <p className="text-xl font-semibold">GHS{event.price / 100}</p>
          <div className="flex items-center space-x-2">
            <Label htmlFor="quantity">Quantity:</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
          <Button onClick={handleAddToCart}>Buy Ticket</Button>
        </div>
      </div>
    </div>
  );
}
