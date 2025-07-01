"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  QrCode,
  Check,
  X,
  User,
  Calendar,
  MapPin,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/date-utils";
import { useVerifyTicket } from "@/lib/api/tickets";

interface ScanTicketProps {
  eventId: string;
}

export function ScanTicket({ eventId }: ScanTicketProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [qrCode, setQrCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const verifyTicketMutation = useVerifyTicket();

  // Check if the browser supports getUserMedia
  const hasGetUserMedia = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const startScanning = async () => {
    if (!hasGetUserMedia()) {
      toast.error("Your browser doesn't support camera access");
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanQRCode();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const scanQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanQRCode);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR code scanning
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Use a QR code library to scan the image data
    // For this example, we'll simulate finding a QR code
    // In a real implementation, you would use a library like jsQR

    // Simulate QR code detection (replace with actual QR code scanning)
    if (Math.random() > 0.95) {
      // Simulate occasional QR code detection
      const simulatedQrCode = `ticket-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      handleQrCodeDetected(simulatedQrCode);
      return;
    }

    // Continue scanning if no QR code was detected
    requestAnimationFrame(scanQRCode);
  };

  const handleQrCodeDetected = (code: string) => {
    setQrCode(code);
    verifyTicket(code);
    stopScanning();
  };

  const verifyTicket = async (code: string = qrCode) => {
    if (!code) {
      toast.error("Please enter a QR code");
      return;
    }

    try {
      const result = await verifyTicketMutation.mutateAsync({
        qrCode: code,
        eventId,
      });

      if (result.valid) {
        setScanResult(result.ticket);
        setScanError(null);
        toast.success("Ticket verified successfully");
      } else {
        setScanError(result.error || "Invalid ticket");
        setScanResult(result.ticket || null);
        toast.error(result.error || "Invalid ticket");
      }
    } catch (error: any) {
      console.error("Error verifying ticket:", error);
      setScanError(error.message || "Failed to verify ticket");
      toast.error("Failed to verify ticket");
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // if (!session) {
  //   return (
  //     <Alert variant="destructive">
  //       <AlertTitle>Unauthorized</AlertTitle>
  //       <AlertDescription>
  //         You must be logged in to scan tickets.
  //       </AlertDescription>
  //     </Alert>
  //   );
  // }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isScanning ? (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-primary">
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 border-2 border-primary rounded-lg opacity-50"></div>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={stopScanning}
                >
                  Cancel Scanning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="qrCode">QR Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qrCode"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="Enter QR code manually"
                    />
                    <Button onClick={() => verifyTicket()}>Verify</Button>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">or</p>
                  <Button onClick={startScanning}>
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan QR Code
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {verifyTicketMutation.isPending && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {scanResult && (
        <Card className={scanError ? "border-red-500" : "border-green-500"}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ticket Information</span>
              {scanError ? (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Invalid
                </Badge>
              ) : (
                <Badge
                  variant="default"
                  className="flex items-center gap-1 bg-green-500"
                >
                  <Check className="h-3 w-3" />
                  Valid
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scanError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Ticket Type:</span>
                <span>{scanResult.ticketType?.name || scanResult.type}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Attendee:</span>
                <span>{scanResult.user?.name || "N/A"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Event Date:</span>
                <span>
                  {formatDate(scanResult.event?.startDate)} at{" "}
                  {formatTime(scanResult.event?.startDate)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Location:</span>
                <span>{scanResult.event?.location || "N/A"}</span>
              </div>

              {scanResult.isUsed && (
                <div className="mt-4 p-2 bg-red-50 text-red-700 rounded-md">
                  <p className="font-medium">
                    This ticket was already used on{" "}
                    {formatDate(scanResult.usedAt)} at{" "}
                    {formatTime(scanResult.usedAt)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
