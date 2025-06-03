"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useSession } from "next-auth/react";
import Link from "next/link";

// Define types
interface TicketData {
  email: string;
  event: string;
  used: boolean;
  quantity: number;
  isExpired: boolean;
  orderId: string | null;
}

export default function QrScanner() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [message, setMessage] = useState<string>("");
  const [valid, setValid] = useState<boolean | null>(null); 
  const {data: session, status} = useSession();

  
  useEffect(() => {
    if (!scannerRef.current) return;
    
    navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      // Permission granted, now stopping the stream
      stream.getTracks().forEach((track) => track.stop());
    })
    .catch((error) => {
      alert("Camera access denied or not available.");
      console.error(error);
    });
    
    const html5QrCode = new Html5Qrcode("qr-reader");
    
    html5QrCode
    .start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      async (decodedText) => {
        try {
          const res = await fetch(`/api/tickets/verify?code=${decodedText}`);
          const data = await res.json();
          
          setValid(data.valid ?? false); // Set the `valid` status
          
          if (res.ok && data.valid) {
            setTicket(data.ticket);
            setMessage(data.message);
          } else {
            setTicket(null);
            setMessage(data.error || "Invalid ticket");
          }
        } catch {
          setValid(false);
          setTicket(null);
          setMessage("Failed to verify ticket");
        }
        
        // Stop scanner after a scan
        await html5QrCode.stop();
      },
      () => {
        // scan error — optional
      }
    )
    .catch((err) => {
      console.error("Camera start failed", err);
    });
    
    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, []);
  if (status === "loading") return <p>Loading....</p>;

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-center text-red-600 text-xl font-semibold mb-6">
          Unauthorized - Admins only
        </p>
        <Link href="/" className="text-green-600 text-2xl font-bold hover:underline">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold">Scan Ticket QR Code</h2>
      <div id="qr-reader" ref={scannerRef} className="w-full max-w-xs" />
      {message && <p className="mt-4 font-medium">{message}</p>}
      {valid !== null && (
        <p className={`font-semibold ${valid ? "text-green-600" : "text-red-600"}`}>
          {valid ? "✅ Ticket is valid" : "❌ Ticket is invalid"}
        </p>
      )}
      {ticket && (
        <div className="mt-4 border p-4 rounded-md w-full max-w-xs bg-gray-50">
          <p><strong>Email:</strong> {ticket.email}</p>
          <p><strong>Event:</strong> {ticket.event}</p>
          <p><strong>Used:</strong> {ticket.used ? "Yes" : "No"}</p>
          <p><strong>Quantity:</strong> {ticket.quantity}</p>
          <p><strong>Expired:</strong> {ticket.isExpired ? "Yes" : "No"}</p>
          <p><strong>Order ID:</strong> {ticket.orderId ?? "N/A"}</p>
        </div>
      )}
    </div>
  );
}
