import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { initializePayment } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is already paid
    if (order.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Generate a unique reference
    const reference = `qrgate-${Date.now()}-${Math.floor(
      Math.random() * 1000000
    )}`;

    // Update order with reference
    await prisma.order.update({
      where: { id: orderId },
      data: { reference },
    });

    // Initialize payment with Paystack
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/verify`;

    const paymentData = await initializePayment({
      email: order.user.email,
      amount: order.total,
      reference,
      callbackUrl,
      metadata: {
        orderId,
        userId: session.user.id,
        eventId: order.eventId,
      },
    });

    return NextResponse.json({ success: true, data: paymentData });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
