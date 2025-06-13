import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { verifyPayment } from "@/lib/paystack";
import { generateQRCode } from "@/lib/qr-code";

export default async function VerifyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const reference =
    typeof params.reference === "string" ? params.reference : undefined;
  if (!reference) {
    redirect("/");
  }

  let paymentStatus = "pending";
  let orderId = "";
  let errorMessage = "";

  try {
    // Verify payment with PayStack
    const paymentData = await verifyPayment(reference);

    if (paymentData.status === "success") {
      // Find order by reference
      const order = await prisma.order.findFirst({
        where: { reference },
        include: {
          event: true,
          tickets: true, // Include existing tickets
        },
      });

      if (order) {
        // Update order status to COMPLETED
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "COMPLETED",
            paymentId: paymentData.id?.toString(),
          },
        });

        // Check if tickets already exist for this order
        if (order.tickets.length === 0) {
          // Create tickets for the order (single ticket type per order)
          const ticketType = order.tickets[0]?.type || "Standard";
          const quantity = order.tickets.length || 1;

          // Get the price for this ticket type
          let ticketPrice = order.event.price; // Default price

          // Find ticket type price if available
          const ticketTypeInfo = await prisma.ticketType.findFirst({
            where: {
              eventId: order.eventId,
              name: ticketType,
            },
          });

          if (ticketTypeInfo) {
            ticketPrice = ticketTypeInfo.price;
          }

          // Create tickets
          for (let i = 0; i < quantity; i++) {
            const qrCode = await generateQRCode({
              eventId: order.eventId,
              userId: order.userId,
              orderId: order.id,
              ticketNumber: order.event.soldTickets + i + 1,
              timestamp: Date.now(),
            });

            await prisma.ticket.create({
              data: {
                eventId: order.eventId,
                userId: order.userId,
                orderId: order.id,
                type: ticketType,
                price: ticketPrice,
                qrCode,
              },
            });
          }

          // Update event sold tickets count
          await prisma.event.update({
            where: { id: order.eventId },
            data: {
              soldTickets: {
                increment: quantity,
              },
            },
          });

          // Update ticket type sold count if applicable
          if (ticketTypeInfo) {
            await prisma.ticketType.update({
              where: { id: ticketTypeInfo.id },
              data: {
                soldCount: {
                  increment: quantity,
                },
              },
            });
          }
        }

        paymentStatus = "success";
        orderId = order.id;
      } else {
        paymentStatus = "error";
        errorMessage = "Order not found";
      }
    } else {
      paymentStatus = "error";
      errorMessage = "Payment was not successful";
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    paymentStatus = "error";
    errorMessage = "Failed to verify payment";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {paymentStatus === "success" ? (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Payment Successful</CardTitle>
              <CardDescription>
                Your tickets have been generated and sent to your email
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Payment Failed</CardTitle>
              <CardDescription>
                {errorMessage || "There was an issue with your payment"}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">
            Reference: <span className="font-medium">{reference}</span>
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          {paymentStatus === "success" ? (
            <Button asChild>
              <Link href={`/dashboard/tickets?order=${orderId}`}>
                View My Tickets
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
