"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

export default function QrScanner() {
  const [ticketInfo, setTicketInfo] = useState<null | {
    event: string;
    email: string;
    used: number;
    quantity: number;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
      try {
        console.log("🔴 Stopping scanner...");
        await scanner.stop();
        await scanner.clear();
        scannerRef.current = null;
        isScanningRef.current = false;
      } catch (err) {
        console.warn("⚠️ Failed to stop scanner:", err);
      }
    }
  }, []);

  const startScanner = useCallback(async () => {
    const qrRegionId = "qr-reader";

    if (scannerRef.current) {
      console.warn("⚠️ Scanner already running.");
      return;
    }

    const scanner = new Html5Qrcode(qrRegionId);
    scannerRef.current = scanner;

    try {
      const cameras = await Html5Qrcode.getCameras();
      const backCamera = cameras.find(cam =>
        cam.label.toLowerCase().includes("back")
      ) || cameras[0];

      if (!backCamera) {
        setError("No camera found.");
        return;
      }

      console.log("📷 Starting camera:", backCamera.label);

      await scanner.start(
        backCamera.id,
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (isScanningRef.current) return;
          isScanningRef.current = true;
          console.log("✅ QR scanned:", decodedText);

          try {
            const res = await fetch(`/api/tickets/verify?code=${encodeURIComponent(decodedText)}`, {
              method: "POST",
            });

            const data = await res.json();
            if (!res.ok) {
              setError(data.message || "Invalid QR code");
            } else {
              setTicketInfo(data.ticket);
            }
          } catch (err) {
            console.error("❌ Fetch error:", err);
            setError("Network error validating QR code.");
          }

          await stopScanner();
          setScanning(false);
        },
        (errorMessage) => {
          console.log("⛔ Decode error:", errorMessage);
        }
      );
    } catch (err) {
      console.error("❌ Failed to start scanner:", err);
      setError("Camera initialization failed.");
    }
  }, [stopScanner]);

  useEffect(() => {
    if (scanning) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner, scanning]);

  const reset = () => {
    setTicketInfo(null);
    setError(null);
    isScanningRef.current = false;
    setScanning(true);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 my-24pos">
      <h2 className="text-2xl font-bold">🎯 QR Scanner</h2>

      {scanning && !error && !ticketInfo && (
        <div id="qr-reader" className="w-full max-w-sm rounded border" />
      )}

      {ticketInfo && (
        <div className="bg-green-100 text-green-800 p-4 rounded shadow-md">
          <h3 className="text-lg font-semibold">✅ Ticket Verified</h3>
          <p><strong>Event:</strong> {ticketInfo.event}</p>
          <p><strong>Email:</strong> {ticketInfo.email}</p>
          <p><strong>Used:</strong> {ticketInfo.used} / {ticketInfo.quantity}</p>
          <button
            onClick={reset}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Scan Another
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded shadow-md">
          <h3 className="font-semibold">❌ Error</h3>
          <p>{error}</p>
          <button
            onClick={reset}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
