import QRCode from "qrcode";

interface QRCodeData {
  eventId: string;
  userId: string;
  orderId: string;
  ticketNumber: number;
  timestamp: number;
}

// Returns a data URL (PNG) for the QR code
export async function generateQRCode(data: QRCodeData): Promise<string> {
  // The QR code will encode the JSON string of the ticket data
  const qrString = JSON.stringify(data);
  // Generate a PNG data URL for the QR code
  return await QRCode.toDataURL(qrString, { errorCorrectionLevel: "H" });
}

export function decodeQRCode(qrCode: string): QRCodeData | null {
  // This function is only valid if you store the raw JSON string, not the PNG
  // In a real app, you would scan the QR code image and decode it using a QR code scanner library
  // Here, we assume you have the original JSON string (for demo/testing only)
  try {
    const decoded = Buffer.from(qrCode, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}
