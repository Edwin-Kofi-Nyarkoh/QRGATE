import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { verifyPayment } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const orderId = searchParams.get("orderId");

    if (!reference || !orderId) {
      return NextResponse.json(
        { error: "Missing reference or order ID" },
        { status: 400 }
      );
    }

    // Verify the payment with Paystack
    const paymentData = await verifyPayment(reference);

    if (!paymentData || paymentData.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed", paymentData },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        tickets: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the order with payment information
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        paymentMethod: "PAYSTACK",
        paymentId: paymentData.id.toString(),
        reference,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            mainImage: true,
          },
        },
        tickets: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
