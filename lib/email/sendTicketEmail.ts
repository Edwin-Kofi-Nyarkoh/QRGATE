import { transporter } from "./nodemailer";

type TicketEmailItem = {
  qrCode: string;
  type: string;
  price: number;
};

type SendTicketEmailOptions = {
  user: {
    name: string | null;
    email: string;
  };
  tickets: TicketEmailItem[];
  event: {
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
  };
  attachments?: any[];
};

export async function sendTicketEmail({
  user,
  tickets,
  event,
  attachments,
}: SendTicketEmailOptions) {
  const ticketImagesHtml = tickets
    .map(
      (ticket, index) => `
        <div style="margin-bottom: 20px; text-align: center;">
          <p style="font-weight: bold;">Ticket ${index + 1} - ${ticket.type}</p>
          <img src="${
            ticket.qrCode
          }" alt="QR Code" style="width: 200px; height: 200px;" />
          <p style="margin-top: 8px; color: #444;">Price: Ghc${ticket.price.toFixed(
            2
          )}</p>
        </div>
      `
    )
    .join("");

  const formattedStart = new Date(event.startDate).toLocaleDateString();
  const formattedEnd = new Date(event.endDate).toLocaleDateString();
  const sameDay = formattedStart === formattedEnd;

  const mailOptions = {
    from: `"QRGate" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Your Tickets for ${event.title}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px; background: hsl(var(--background,0 0% 100%)); color: hsl(var(--foreground,240 10% 3.9%));">
        <div style="max-width: 600px; margin: auto; background: hsl(var(--card,0 0% 100%)); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px 0 rgba(0,0,0,0.07); border: 1px solid hsl(var(--border,240 5.9% 90%));">
          <div style="background: hsl(var(--primary,346.8 77.2% 49.8%)); color: hsl(var(--primary-foreground,355.7 100% 97.3%)); padding: 24px 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -1px;">Your Event Tickets</h2>
          </div>
          <div style="padding: 24px 20px; color: hsl(var(--foreground,240 10% 3.9%));">
            <p style="margin: 0 0 12px 0;">Hi ${user.name || "there"},</p>
            <p style="margin: 0 0 16px 0;">Thank you for your purchase. Below are your tickets for:</p>
            <h3 style="color: hsl(var(--primary,346.8 77.2% 49.8%)); margin: 0 0 8px 0; font-size: 1.25rem; font-weight: 700;">${
              event.title
            }</h3>
            <p style="margin: 0 0 4px 0;"><strong>Location:</strong> ${
              event.location
            }</p>
            <p style="margin: 0 0 16px 0;"><strong>Date:</strong> ${
              sameDay ? formattedStart : `${formattedStart} — ${formattedEnd}`
            }</p>
            <div style="margin-top: 20px;">
              ${ticketImagesHtml}
            </div>
            <p style="margin-top: 30px; color: hsl(var(--muted-foreground,240 3.8% 46.1%)); font-size: 0.98rem;">Please keep this email safe and present the QR code(s) at the entrance.</p>
          </div>
          <div style="background: hsl(var(--primary,346.8 77.2% 49.8%)); color: hsl(var(--primary-foreground,355.7 100% 97.3%)); text-align: center; padding: 12px 0; font-size: 0.95rem;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} QRGATE</p>
          </div>
        </div>
      </div>
    `,
    attachments: attachments || [],
  };

  await transporter.sendMail(mailOptions);
}
