// General HTML email template for QRGATE
export function QrGateEmailTemplate({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  // Use a public CDN fallback for logo if NEXT_PUBLIC_APP_URL is not set
  const logoUrl = `${
    process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "https://qrgate.app"
  }/logo.png`;
  return `
    <div style="background:hsl(0,0%,100%);padding:32px 0;font-family:Inter,Arial,Helvetica,sans-serif;min-height:100vh;">
      <div style="max-width:480px;margin:0 auto;background:hsl(0,0%,100%);border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.04);overflow:hidden;">
        <div style="padding:32px 32px 16px 32px;text-align:center;">
          <img src='${logoUrl}' alt="QRGATE Logo" style="width:64px;height:64px;border-radius:50%;margin-bottom:16px;object-fit:cover;background:#f1f5f9;display:inline-block;" onerror="this.onerror=null;this.src='https://qrgate.app/logo.png'" />
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
