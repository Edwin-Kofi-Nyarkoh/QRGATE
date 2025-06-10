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

    // 5. Prepare array to hold QR code info with data URLs (inside transaction)
    const qrCodes: { code: string; eventId: number; eventName: string; quantity: number; dataUrl: string }[] = [];

    // 6. For each ticket, do all DB ops + QR code generation in transaction
    for (const ticketData of tickets) {
      await prisma.$transaction(async (tx) => {
        // Fetch event & check stock
        const event = await tx.event.findUnique({ where: { id: ticketData.eventId }, select: { id: true, name: true, stock: true }, });
        if (!event) throw new Error(`Event ${ticketData.eventId} not found`);
        if (event.stock < ticketData.quantity) throw new Error(`Not enough tickets for event ${ticketData.eventId}`);

        // Generate unique code
        const code = uuidv4();

        // Generate QR code data URL (inside transaction)
        const dataUrl = await QRCode.toDataURL(code);

        // Create ticket linked to user and order
        await tx.ticket.create({
          data: {
            code,
            eventId: ticketData.eventId,
            quantity: ticketData.quantity,
            userId,
            orderId: order.id,
            qrCodeData: dataUrl,
          },
        });

        // Decrement event stock
        await tx.event.update({
          where: { id: ticketData.eventId },
          data: { stock: { decrement: ticketData.quantity } },
        });


        // Add to qrCodes array for email after transaction commits
        qrCodes.push({
          code,
          eventId: ticketData.eventId,
          eventName: event.name,
          quantity: ticketData.quantity,
          dataUrl,
        });
      });
    }

    // 7. Build attachments array for Nodemailer from qrCodes data URLs
    const attachments = qrCodes.map(({ code, dataUrl }, index) => ({
      filename: `qrcode-${code}.png`,
      content: Buffer.from(dataUrl.split(",")[1], "base64"), // convert base64 to buffer
      cid: `qrcode${index}`, // unique cid for inline images
    }));

    // 8. Construct HTML for inline images referencing the attachments
    const qrImagesHtml = qrCodes
      .map(
        ({ code, eventId, eventName, quantity }, index) => `
          <div style="margin-bottom: 24px;">
            <h3>Event ID: ${eventName}</h3>
            <h3>Event ID: ${eventId}</h3>
            <p><strong>Code:</strong> ${code}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <img src="cid:qrcode${index}" alt="QR Code for ${code}" />
          </div>`
      )
      .join("");

    // 9. Send email with inline attachments
    await transporter.sendMail({
      from: `"QRGATE" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Tickets",
      html: `
        <h2>Thanks for your purchase!</h2>
        <p>Here are your tickets:</p>
        ${qrImagesHtml}
      `,
      attachments,
    });

    // 10. Return success response
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
}
