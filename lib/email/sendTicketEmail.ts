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
};

export async function sendTicketEmail({ user, tickets, event }: SendTicketEmailOptions) {
  const ticketImagesHtml = tickets
    .map(
      (ticket, index) => `
        <div style="margin-bottom: 20px; text-align: center;">
          <p style="font-weight: bold;">Ticket ${index + 1} - ${ticket.type}</p>
          <img src="${ticket.qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
          <p style="margin-top: 8px; color: #444;">Price: $${ticket.price.toFixed(2)}</p>
        </div>
      `
    )
    .join("");

  const formattedStart = new Date(event.startDate).toLocaleDateString();
  const formattedEnd = new Date(event.endDate).toLocaleDateString();
  const sameDay = formattedStart === formattedEnd;

  const mailOptions = {
    from: `"Event Gate" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Your Tickets for ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <div style="background-color: #003566; color: #fff; padding: 20px; text-align: center;">
            <h2>Your Event Tickets</h2>
          </div>
          <div style="padding: 20px; color: #333;">
            <p>Hi ${user.name || "there"},</p>
            <p>Thank you for your purchase. Below are your tickets for:</p>
            <h3 style="color: #003566;">${event.title}</h3>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Date:</strong> ${sameDay ? formattedStart : `${formattedStart} — ${formattedEnd}`}</p>
            <div style="margin-top: 20px;">
              ${ticketImagesHtml}
            </div>
            <p style="margin-top: 30px;">Please keep this email safe and present the QR code(s) at the entrance.</p>
          </div>
          <div style="background-color: #003566; color: #fff; text-align: center; padding: 10px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Event Gate</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
