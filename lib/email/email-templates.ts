// General HTML email template for QRGATE
export function QrGateEmailTemplate({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  // Use a public CDN fallback for logo
  const logoUrl = `${
    process.env.NEXT_PUBLIC_APP_URL
      ? "c:\\Users\\masoo\\Downloads\\Telegram Desktop\\UI's and Logo Components & Assets\\uilogos-v2.0\\uilogos-v2.0\\uilogos-2.0\\logomark\\png\\muzica.png"
      : "c:\\Users\\masoo\\Downloads\\Telegram Desktop\\UI's and Logo Components & Assets\\uilogos-v2.0\\uilogos-v2.0\\uilogos-2.0\\logomark\\png\\muzica.png"
  }/logo.png`;
  return `
    <div style="background:hsl(0,0%,100%);padding:32px 0;font-family:Inter,Arial,Helvetica,sans-serif;min-height:100vh;">
      <div style="max-width:480px;margin:0 auto;background:hsl(0,0%,100%);border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.04);overflow:hidden;">
        <div style="padding:32px 32px 16px 32px;text-align:center;">
          <img src='${logoUrl}' alt="QRGATE Logo" style="width:64px;height:64px;border-radius:50%;margin-bottom:16px;object-fit:cover;background:#f1f5f9;display:inline-block;" onerror="this.onerror=null;this.src='c:\\Users\\masoo\\Downloads\\Telegram Desktop\\UI's and Logo Components & Assets\\uilogos-v2.0\\uilogos-v2.0\\uilogos-2.0\\logomark\\png\\muzica.png'" />
          <h1 style="font-size:1.5rem;font-weight:700;color:hsl(240,10%,3.9%);margin-bottom:8px;">${title}</h1>
        </div>
        <div style="padding:0 32px 32px 32px;font-size:1rem;color:hsl(240,10%,3.9%);">
          ${body}
        </div>
        <div style="background:hsl(240,4.8%,95.9%);padding:16px 32px;text-align:center;font-size:0.9rem;color:hsl(240,3.8%,46.1%);">
          &copy; ${new Date().getFullYear()} QRGATE. All rights reserved.
        </div>
      </div>
    </div>
  `;
}

// 1. Registration Confirmation Email
export function registrationConfirmationEmail({ name }: { name: string }) {
  return QrGateEmailTemplate({
    title: "Welcome to QRGATE!",
    body: `
      <p style=\"margin-bottom:24px;\">Hi <strong>${name}</strong>,</p>
      <p style=\"margin-bottom:24px;\">Your account has been successfully created. You can now browse and purchase tickets for upcoming events, manage your profile, and enjoy seamless event access with QRGATE.</p>
      <p style=\"margin-bottom:24px;\">If you have any questions or need help, just reply to this email or visit our Help Center.</p>
      <p style=\"color:hsl(240,3.8%,46.1%);font-size:0.95rem;\">Thank you for joining QRGATE!</p>
    `,
  });
}

// 2. Purchase Confirmation Email (Success)
export function purchaseConfirmationEmail({
  name,
  eventTitle,
  eventDate,
  eventLocation,
  ticketType,
  ticketNumber,
  qrCodeUrl,
}: {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  ticketNumber: string | number;
  qrCodeUrl?: string;
}) {
  return QrGateEmailTemplate({
    title: "Your Ticket Purchase is Confirmed!",
    body: `
      <p style=\"margin-bottom:24px;\">Hi <strong>${name}</strong>,</p>
      <p style=\"margin-bottom:24px;\">Thank you for your purchase! Your ticket for <strong>${eventTitle}</strong> is confirmed.</p>
      <ul style=\"margin-bottom:24px;padding-left:20px;\">
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Date & Time:</strong> ${eventDate}</li>
        <li><strong>Location:</strong> ${eventLocation}</li>
        <li><strong>Ticket Type:</strong> ${ticketType}</li>
        <li><strong>Ticket Number:</strong> ${ticketNumber}</li>
      </ul>
      ${
        qrCodeUrl
          ? `<div style=\"text-align:center;margin-bottom:24px;\"><img src=\"${qrCodeUrl}\" alt=\"QR Code\" style=\"width:120px;height:120px;object-fit:contain;border-radius:8px;background:#f1f5f9;\" /></div>`
          : ""
      }
      <p style=\"margin-bottom:24px;\">You can view your ticket(s) in your dashboard. Please present this email or your QR code at the event entrance for scanning.</p>
      <p style=\"color:hsl(240,3.8%,46.1%);font-size:0.95rem;\">Enjoy the event!</p>
    `,
  });
}

// 2b. Purchase Failure Email
export function purchaseFailureEmail({
  name,
  eventTitle,
  supportEmail,
}: {
  name: string;
  eventTitle: string;
  supportEmail?: string;
}) {
  return QrGateEmailTemplate({
    title: "Ticket Purchase Failed",
    body: `
      <p style=\"margin-bottom:24px;\">Hi <strong>${name}</strong>,</p>
      <p style=\"margin-bottom:24px;\">Unfortunately, your payment for <strong>${eventTitle}</strong> was not successful.</p>
      <p style=\"margin-bottom:24px;\">Please try again from your dashboard. If you continue to experience issues, contact our support team${
        supportEmail
          ? ` at <a href=\"mailto:${supportEmail}\">${supportEmail}</a>`
          : ""
      }.</p>
      <p style=\"color:hsl(240,3.8%,46.1%);font-size:0.95rem;\">We’re here to help!</p>
    `,
  });
}

// 3. Ticket Scan Notification Email
export function ticketScanNotificationEmail({
  name,
  eventTitle,
  scanTime,
  eventWindowStart,
  eventWindowEnd,
  eventLocation,
}: {
  name: string;
  eventTitle: string;
  scanTime: string;
  eventWindowStart: string;
  eventWindowEnd: string;
  eventLocation: string;
}) {
  return QrGateEmailTemplate({
    title: "Your Ticket Was Scanned",
    body: `
      <p style=\"margin-bottom:24px;\">Hi <strong>${name}</strong>,</p>
      <p style=\"margin-bottom:24px;\">Your ticket for <strong>${eventTitle}</strong> was scanned on <strong>${scanTime}</strong>.</p>
      <ul style=\"margin-bottom:24px;padding-left:20px;\">
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Location:</strong> ${eventLocation}</li>
        <li><strong>Entry Window:</strong> ${eventWindowStart} – ${eventWindowEnd}</li>
      </ul>
      <p style=\"margin-bottom:24px;\">If this was not you, please contact event staff or support immediately.</p>
      <p style=\"color:hsl(240,3.8%,46.1%);font-size:0.95rem;\">Thank you for using QRGATE.</p>
    `,
  });
}
