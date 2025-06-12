"use client";

import { useState } from "react";
import { useEvent } from "@/lib/api/events";
import { useVerifyTicket } from "@/lib/api/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Scan,
  Search,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { QrReader } from "react-qr-reader";

interface SecurityOfficerPageProps {
  eventId: string;
}

export function SecurityOfficerPage({ eventId }: SecurityOfficerPageProps) {
  const [qrCode, setQrCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const { data: event } = useEvent(eventId);
  const verifyTicketMutation = useVerifyTicket();

  const handleScan = async (qrCodeValue: string) => {
    if (!qrCodeValue) return;

    setIsScanning(true);
    try {
      const result = await verifyTicketMutation.mutateAsync(qrCodeValue);
      setVerificationResult(result);
      setQrCode(qrCodeValue);
    } catch (error) {
      setVerificationResult({
        valid: false,
        message: "Failed to verify ticket",
      });
    } finally {
      setIsScanning(false);
      setShowScanner(false);
    }
  };

  const handleManualVerify = async () => {
    if (!qrCode.trim()) return;
    await handleScan(qrCode.trim());
  };

  const handleQrScan = (result: any) => {
    if (result) {
      handleScan(result.text);
    }
  };

  const handleQrError = (error: any) => {
    console.error("QR Scanner Error:", error);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Security Officer Portal
        </h1>
        {event && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>Date:</strong>{" "}
                {new Date(event.startDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Time:</strong>{" "}
                {new Date(event.startDate).toLocaleTimeString()}
              </div>
              <div>
                <strong>Location:</strong> {event.location}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Ticket Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Manual Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Manual QR Code Entry
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter QR code or ticket ID"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleManualVerify()}
                />
                <Button
                  onClick={handleManualVerify}
                  disabled={!qrCode.trim() || isScanning}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* QR Scanner Toggle */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowScanner(!showScanner)}
                variant="outline"
                className="w-full"
              >
                {showScanner ? "Hide Scanner" : "Open QR Scanner"}
              </Button>

              {showScanner && (
                <div className="border rounded-lg overflow-hidden">
                  <QrReader
                    onResult={(result, error) => {
                      if (result) handleQrScan(result);
                      if (error) handleQrError(error);
                    }}
                    constraints={{ facingMode: "environment" }}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {isScanning && (
              <Alert>
                <AlertDescription>
                  Verifying ticket... Please wait.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Verification Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult?.valid ? (
                <CheckCircle className="w-5 h-5 text-primary" />
              ) : verificationResult && !verificationResult.valid ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!verificationResult ? (
              <div className="text-center py-8 text-gray-500">
                <Scan className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Scan or enter a QR code to verify ticket</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status */}
                <Alert
                  className={
                    verificationResult.valid
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }
                >
                  <AlertDescription
                    className={
                      verificationResult.valid
                        ? "text-green-800"
                        : "text-red-800"
                    }
                  >
                    {verificationResult.message}
                  </AlertDescription>
                </Alert>

                {/* Ticket Holder Information */}
                {verificationResult.valid && verificationResult.ticket && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={
                            verificationResult.ticket.user.profileImage ||
                            "/placeholder.svg"
                          }
                        />
                        <AvatarFallback className="text-lg">
                          {verificationResult.ticket.user.name?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {verificationResult.ticket.user.name ||
                            "Unknown User"}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {verificationResult.ticket.user.email}
                          </div>
                          {verificationResult.ticket.user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {verificationResult.ticket.user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Ticket Type:</strong>
                        <p>{verificationResult.ticket.type}</p>
                      </div>
                      <div>
                        <strong>Price:</strong>
                        <p>${verificationResult.ticket.price}</p>
                      </div>
                      <div>
                        <strong>Purchase Date:</strong>
                        <p>
                          {new Date(
                            verificationResult.ticket.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <Badge
                          className={
                            verificationResult.ticket.isUsed
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {verificationResult.ticket.isUsed ? "Used" : "Valid"}
                        </Badge>
                      </div>
                    </div>

                    {verificationResult.ticket.isUsed &&
                      verificationResult.ticket.usedAt && (
                        <Alert className="border-yellow-200 bg-yellow-50">
                          <AlertDescription className="text-yellow-800">
                            This ticket was already used on{" "}
                            {new Date(
                              verificationResult.ticket.usedAt
                            ).toLocaleString()}
                          </AlertDescription>
                        </Alert>
                      )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">How to Scan Tickets:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Use the QR scanner or manual entry</li>
                <li>• Valid tickets will show green status</li>
                <li>• Invalid/used tickets show red status</li>
                <li>• Each ticket can only be used once</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Attendee Information:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Name and contact details are displayed</li>
                <li>• Verify identity if needed</li>
                <li>• Check ticket type and price</li>
                <li>• Note any special requirements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
