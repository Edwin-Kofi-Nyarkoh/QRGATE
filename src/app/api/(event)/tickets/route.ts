import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { transporter } from "@/lib/nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Parse request body
    const { userId, total, reference, tickets } = await req.json();

    // 2. Verify payment with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const verifyJson = await verifyRes.json();
    const paymentData = verifyJson.data;

    if (paymentData.status !== "success") {
      return NextResponse.json({ message: "Payment not successful" }, { status: 400 });
    }

    // 3. Validate user exists and has email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) {
      return NextResponse.json({ message: "User not found or missing email" }, { status: 400 });
    }

    // 4. Create order record
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        reference,
      },
    });

    // 5. Prepare array to hold QR codes info for email
    const qrCodes: { code: string; eventId: number; quantity: number; dataUrl: string }[] = [];

    // 6. For each ticket, do all related DB ops in one transaction
    for (const ticketData of tickets) {
      await prisma.$transaction(async (tx) => {
        // Fetch event & check stock
        const event = await tx.event.findUnique({ where: { id: ticketData.eventId } });
        if (!event) throw new Error(`Event ${ticketData.eventId} not found`);
        if (event.stock < ticketData.quantity) throw new Error(`Not enough tickets for event ${ticketData.eventId}`);

        // Generate unique code
        const code = uuidv4();

        // Create ticket linked to user and order
        await tx.ticket.create({
          data: {
            code,
            eventId: ticketData.eventId,
            quantity: ticketData.quantity,
            userId,
            orderId: order.id,
          },
        });

        // Decrement event stock
        await tx.event.update({
          where: { id: ticketData.eventId },
          data: { stock: { decrement: ticketData.quantity } },
        });

        // Generate QR code data URL
        const dataUrl = await QRCode.toDataURL(code);

        // Add to qrCodes array for email after transaction commits
        qrCodes.push({
          code,
          eventId: ticketData.eventId,
          quantity: ticketData.quantity,
          dataUrl,
        });
      });
    }

    // 7. Construct HTML for all QR codes in email
    const qrImagesHtml = qrCodes
      .map(
        ({ code, eventId, quantity, dataUrl }) => `
          <div style="margin-bottom: 24px;">
            <h3>Event ID: ${eventId}</h3>
            <p><strong>Code:</strong> ${code}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <img src="${dataUrl}" alt="QR Code for ${code}" />
          </div>`
      )
      .join("");

    // 8. Send email with tickets
    await transporter.sendMail({
      from: `"QRGATE" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Tickets",
      html: `
        <h2>Thanks for your purchase!</h2>
        <p>Here are your tickets:</p>
        ${qrImagesHtml}
      `,
    });

    // 9. Return success response
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }}