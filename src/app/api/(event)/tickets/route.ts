import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { transporter } from "@/lib/nodemailer";


export async function POST(req: Request) {
  // 1. Parse the request body
  const { userId, total, reference,tickets } = await req.json();

  try{
    // 2. Validate user and email existence
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) {
      return new Response("User not found or missing email", { status: 400 });
    }
  
    // 3. Create a new order linked to the user
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        reference
      },
    });
  
    // 4. Prepare to store generated QR codes info for the email
    const qrCodes: { code: string; eventId: number; quantity: number; dataUrl: string }[] = [];
  
    // 5. Loop over each ticket requested
    for (const ticketData of tickets) {
      const code = uuidv4(); // Generate unique ticket code
  
      // 6. Save ticket to the DB linked to user and order
      await prisma.ticket.create({
        data: {
          code,
          eventId: ticketData.eventId,
          quantity: ticketData.quantity,
          userId,
          orderId: order.id,
        },
      });
  
      // 7. Generate QR code image (base64 string) for the unique code
      const dataUrl = await QRCode.toDataURL(code);
  
      // 8. Add this ticket's QR code info to the array for email
      qrCodes.push({
        code,
        eventId: ticketData.eventId,
        quantity: ticketData.quantity,
        dataUrl,
      });
    }
  
    // 9. Build the HTML for the email containing all QR codes
    const qrImagesHtml = qrCodes
      .map(
        ({ code, eventId, quantity, dataUrl }) => `
          <div style="margin-bottom: 24px;">
            <h3>Event ID: ${eventId}</h3>
            <p><strong>Code:</strong> ${code}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <img src="${dataUrl}" alt="QR Code for ${code}" />
          </div>
        `
      )
      .join("");
  
    // 10. Send the email with all tickets and QR codes
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
  
    // 11. Respond with success and order ID
    return Response.json({ success: true, orderId: order.id });
  }catch{
    return Response.json({error: "Failed to fetch Events"}, {status: 500})
  }

}
