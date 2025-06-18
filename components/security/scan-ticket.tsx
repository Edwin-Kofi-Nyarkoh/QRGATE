"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Scan,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Ticket,
  Camera,
  CameraOff,
  RefreshCw,
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { toast } from "sonner";

interface TicketData {
  id: string;
  qrCode: string;
  type: string;
  price: number;
  isUsed: boolean;
  usedAt: Date | null;
  status: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    profileImage: string | null;
  };
  event: {
    id: string;
    title: string;
    startDate: Date;
    location: string;
  };
  order: {
    id: string;
    createdAt: Date;
  };
  ticketType?: {
    id: string;
    name: string;
    price: number;
  };
}

interface ScanTicketProps {
  eventId: string;
  securityId?: string;
  onVerificationUpdate?: (stats: {
    totalVerified: number;
    recentActivity: number;
  }) => void;
}

export function ScanTicket({
  eventId,
  securityId,
  onVerificationUpdate,
}: ScanTicketProps) {
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMarkingUsed, setIsMarkingUsed] = useState(false);
  const [searchType, setSearchType] = useState<
    "qr" | "name" | "phone" | "email"
  >("name");
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
      try {
        await scanner.stop();
        await scanner.clear();
        scannerRef.current = null;
        setIsCameraActive(false);
        setIsScanning(false);
      } catch (err) {
        console.warn("Failed to stop scanner:", err);
      }
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;

    const qrRegionId = "qr-reader";
    const scanner = new Html5Qrcode(qrRegionId);
    scannerRef.current = scanner;

    try {
      const cameras = await Html5Qrcode.getCameras();
      const backCamera =
        cameras.find((cam) => cam.label.toLowerCase().includes("back")) ||
        cameras[0];

      if (!backCamera) {
        toast("Camera Error", {
          description: "No camera found on this device.",
        });
        return;
      }

      setIsCameraActive(true);
      setIsScanning(true);

      await scanner.start(
        backCamera.id,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          setIsScanning(false);
          await handleTicketVerification(decodedText, "qr");
          await stopScanner();
        },
        (errorMessage, error) => {
          // Ignore decode errors - they're normal when no QR code is visible
        }
      );
    } catch (err) {
      console.error("Failed to start scanner:", err);
      toast("Camera Error", {
        description: "Failed to initialize camera.",
      });
      setIsCameraActive(false);
      setIsScanning(false);
    }
  }, [stopScanner]);

  // Ensure qr-reader div is present before starting scanner
  useEffect(() => {
    if (
      isCameraActive &&
      document.getElementById("qr-reader") &&
      !scannerRef.current
    ) {
      startScanner();
    }
    // Stop scanner on unmount
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive]);

  const handleTicketVerification = async (
    input: string,
    type: "qr" | "name" | "phone" | "email"
  ) => {
    if (!input.trim()) return;

    setIsVerifying(true);
    try {
      const endpoint = securityId
        ? "/api/security/verify-ticket"
        : "/api/tickets/verify";
      const requestBody = {
        eventId,
        ...(securityId && { securityId }),
        [type === "qr" ? "qrCode" : type]: input.trim(),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setTicketData(data.ticket);

        // Add to verification history
        setVerificationHistory((prev) => [
          {
            id: Date.now(),
            ticket: data.ticket,
            timestamp: new Date(),
            action: "verified",
          },
          ...prev.slice(0, 9),
        ]);

        // Update verification stats
        if (onVerificationUpdate && data.stats) {
          onVerificationUpdate(data.stats);
        }

        toast("✅ Ticket Found", {
          description: `Valid ticket for ${
            data.ticket.user.name || data.ticket.user.email
          }`,
        });
      } else {
        setTicketData(null);
        const errorMessage = getErrorMessage(response.status, data.message);
        toast(getErrorTitle(response.status), {
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast("❌ Verification Failed", {
        description: "Network error. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMarkAsUsed = async () => {
    if (!ticketData || ticketData.isUsed) return;

    setIsMarkingUsed(true);
    try {
      const endpoint = securityId
        ? "/api/security/mark-ticket-used"
        : "/api/tickets/mark-used";
      const requestBody = {
        ticketId: ticketData.id,
        eventId,
        ...(securityId && { securityId }),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedTicket = {
          ...ticketData,
          isUsed: true,
          usedAt: new Date(),
          status: "USED",
        };
        setTicketData(updatedTicket);

        // Update verification history
        setVerificationHistory((prev) => [
          {
            id: Date.now(),
            ticket: updatedTicket,
            timestamp: new Date(),
            action: "marked_used",
          },
          ...prev.slice(0, 9),
        ]);

        // Update verification stats
        if (onVerificationUpdate && data.stats) {
          onVerificationUpdate(data.stats);
        }

        toast("✅ Ticket Marked as Used", {
          description: "Ticket has been successfully validated.",
        });
      } else {
        toast("❌ Failed to Mark Ticket", {
          description: data.message || "Failed to mark ticket as used.",
        });
      }
    } catch (error) {
      console.error("Mark as used error:", error);
      toast("❌ Error", {
        description: "Network error. Please try again.",
      });
    } finally {
      setIsMarkingUsed(false);
    }
  };

  const getErrorMessage = (status: number, message?: string) => {
    switch (status) {
      case 404:
        return "Ticket not found in the system.";
      case 409:
        return "This ticket has already been used.";
      case 403:
        return "You are not authorized to verify tickets for this event.";
      default:
        return message || "Invalid ticket or verification failed.";
    }
  };

  const getErrorTitle = (status: number) => {
    switch (status) {
      case 404:
        return "❌ Ticket Not Found";
      case 409:
        return "⚠️ Already Used";
      case 403:
        return "🚫 Access Denied";
      default:
        return "❌ Invalid Ticket";
    }
  };

  const getStatusBadge = (ticket: TicketData) => {
    if (ticket.isUsed) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Already Used
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-600">
        <CheckCircle className="w-3 h-3" />
        Valid
      </Badge>
    );
  };

  const resetVerification = () => {
    setTicketData(null);
    setManualInput("");
  };

  return (
    <div className="space-y-6">
      {/* Input Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button
                onClick={() => setIsCameraActive((prev) => !prev)}
                variant={isCameraActive ? "destructive" : "default"}
                className="w-full"
                disabled={isVerifying}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </>
                )}
              </Button>
            </div>

            {/* Always render qr-reader div, but hide if not active */}
            <div className={isCameraActive ? "flex justify-center" : "hidden"}>
              <div
                id="qr-reader"
                className="w-full max-w-sm border rounded-lg overflow-hidden"
              />
            </div>

            {isScanning && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>Scanning for QR codes...</AlertDescription>
              </Alert>
            )}

            {isVerifying && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Verifying ticket... Please wait.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Manual Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Manual Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Search by:</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={searchType === "name" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchType("name")}
                >
                  <User className="w-4 h-4 mr-1" />
                  Name
                </Button>
                <Button
                  variant={searchType === "email" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchType("email")}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                <Button
                  variant={searchType === "phone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchType("phone")}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Phone
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {searchType === "name"
                  ? "Ticket Holder Name"
                  : searchType === "email"
                  ? "Email Address"
                  : "Phone Number"}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={
                    searchType === "name"
                      ? "Enter ticket holder's name"
                      : searchType === "email"
                      ? "Enter email address"
                      : "Enter phone number"
                  }
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    handleTicketVerification(manualInput, searchType)
                  }
                  disabled={isVerifying}
                />
                <Button
                  onClick={() =>
                    handleTicketVerification(manualInput, searchType)
                  }
                  disabled={!manualInput.trim() || isVerifying}
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Display Card */}
      {ticketData && (
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Ticket Details
              </CardTitle>
              {getStatusBadge(ticketData)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ticket Holder Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={ticketData.user.profileImage || "/placeholder.svg"}
                  alt={ticketData.user.name || "User"}
                />
                <AvatarFallback className="text-lg">
                  {ticketData.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {ticketData.user.name || "Unknown User"}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {ticketData.user.email}
                  </div>
                  {ticketData.user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {ticketData.user.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Ticket Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Ticket Type
                  </Label>
                  <p className="text-lg font-semibold">
                    {ticketData.ticketType?.name || ticketData.type}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Price
                  </Label>
                  <p className="text-lg font-semibold">
                    GHC {ticketData.ticketType?.price || ticketData.price}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Purchase Date
                  </Label>
                  <p className="text-sm">
                    {new Date(ticketData.order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Event
                  </Label>
                  <p className="font-semibold">{ticketData.event.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Event Date
                  </Label>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(ticketData.event.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Location
                  </Label>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    {ticketData.event.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Information */}
            {ticketData.isUsed && ticketData.usedAt && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-yellow-800">
                  This ticket was used on{" "}
                  {new Date(ticketData.usedAt).toLocaleString()}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleMarkAsUsed}
                disabled={ticketData.isUsed || isMarkingUsed}
                className={
                  ticketData.isUsed
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }
              >
                {isMarkingUsed ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Marking...
                  </>
                ) : ticketData.isUsed ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Already Used
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Used
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetVerification}>
                Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Verifications */}
      {verificationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Recent Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationHistory.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={item.ticket.user.profileImage || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {item.ticket.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.ticket.user.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.ticket.type} - GHC {item.ticket.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        item.action === "marked_used" ? "default" : "secondary"
                      }
                    >
                      {item.action === "marked_used" ? "Used" : "Verified"}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Scanning Tickets:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Use the camera to scan QR codes on tickets</li>
                <li>• Ensure good lighting for better scanning</li>
                <li>• Hold the device steady when scanning</li>
                <li>• Valid tickets show green status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Manual Search:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Search by ticket holder's name, email, or phone</li>
                <li>• Use exact spelling for name searches</li>
                <li>• Include country code for phone searches</li>
                <li>• Each ticket can only be used once</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
