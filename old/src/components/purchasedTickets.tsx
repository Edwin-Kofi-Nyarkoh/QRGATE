"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Ticket = {
  id: number;
  code: string;
  quantity: number;
  used: number;
  qrCodeData: string;
  event: {
    id: number;
    name: string;
    date: string;
  } | null;
};

export default function PurchasedTickets() {
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setTickets(null);
      setError("You must be logged in to view tickets.");
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      setError("User ID not found in session.");
      return;
    }

    setLoading(true);
    fetch(`/api/tickets/purchased-tickets?userId=${encodeURIComponent(userId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch tickets");
        }
        return res.json();
      })
      .then((data) => {
        setTickets(data.tickets);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setTickets(null);
      })
      .finally(() => setLoading(false));
  }, [session, status]);

  if (status === "loading") return <p>Loading session...</p>;
  if (loading) return <p>Loading tickets...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!tickets || tickets.length === 0) return <p>No tickets found.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Purchased Tickets</h2>
      <ul className="space-y-4">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="border p-4 rounded shadow">
            <p><strong>Event:</strong> {ticket.event?.name || "Unknown Event"}</p>
            <p>
              <strong>Date:</strong>{" "}
              {ticket.event?.date
                ? new Date(ticket.event.date).toLocaleString()
                : "N/A"}
            </p>
            <p><strong>Code:</strong> {ticket.code}</p>
            <Image
  src={ticket.qrCodeData} 
  width={200}
  height={200}
  alt={`QR Code for ticket ${ticket.code}`}
/>
            <p><strong>Used:</strong> {ticket.used} / {ticket.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
