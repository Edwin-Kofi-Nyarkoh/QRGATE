import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { initializePayment } from "@/lib/paystack";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        event: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order already has a reference
    if (order.reference) {
      return NextResponse.json(
        {
          error: "Order already has a payment reference",
          reference: order.reference,
        },
        { status: 400 }
      );
    }

    // Generate a unique reference - ensure it's a single string
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000);
    const reference = `qrgate-${timestamp}-${randomId}`;

    // Initialize payment with PayStack
    const paymentData = await initializePayment({
      email: order.user.email,
      amount: order.total,
      reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/verify?reference=${reference}`,
      metadata: {
        orderId: order.id,
        eventId: order.eventId,
        userId: order.userId,
      },
    });

    // Update order with payment reference - use the reference from PayStack response
    await prisma.order.update({
      where: { id: orderId },
      data: {
        reference: paymentData.reference || reference, // Use PayStack reference if available
      },
    });

    return NextResponse.json({
      ...paymentData,
      reference: paymentData.reference || reference,
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
