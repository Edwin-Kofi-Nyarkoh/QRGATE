// General HTML email template for QRGATE
export function QrGateEmailTemplate({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return `
    <div style="background:#f8fafc;padding:32px 0;font-family:Inter,sans-serif;min-height:100vh;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.04);overflow:hidden;">
        <div style="padding:32px 32px 16px 32px;text-align:center;">
          <img src='${
            process.env.NEXT_PUBLIC_APP_URL || ""
          }/logo.png' alt="QRGATE Logo" style="width:64px;height:64px;border-radius:50%;margin-bottom:16px;object-fit:cover;" />
          <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:8px;">${title}</h1>
        </div>
        <div style="padding:0 32px 32px 32px;font-size:1rem;color:#334155;">
          ${body}
        </div>
        <div style="background:#f1f5f9;padding:16px 32px;text-align:center;font-size:0.9rem;color:#64748b;">
          &copy; ${new Date().getFullYear()} QRGATE. All rights reserved.
        </div>
      </div>
    </div>
  `;
}
