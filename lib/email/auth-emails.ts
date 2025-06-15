import { QrGateEmailTemplate } from "@/lib/email/email-templates";

export function forgotPasswordEmail({ resetUrl }: { resetUrl: string }) {
  return QrGateEmailTemplate({
    title: "Reset Your QRGATE Password",
    body: `
      <p style="margin-bottom:24px;">We received a request to reset your password. Click the button below to set a new password. This link will expire in 3 minutes.</p>
      <p style="text-align:center;margin-bottom:24px;">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#22c55e;color:#fff;font-weight:600;border-radius:6px;text-decoration:none;font-size:1rem;">Reset Password</a>
      </p>
      <p style="color:#64748b;font-size:0.95rem;">If you did not request a password reset, you can safely ignore this email.</p>
    `,
  });
}

export function resendResetLinkEmail({ resetUrl }: { resetUrl: string }) {
  return QrGateEmailTemplate({
    title: "Resend Password Reset Link",
    body: `
      <p style="margin-bottom:24px;">Here is your new password reset link. Click the button below to reset your password. This link will expire in 3 minutes.</p>
      <p style="text-align:center;margin-bottom:24px;">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#22c55e;color:#fff;font-weight:600;border-radius:6px;text-decoration:none;font-size:1rem;">Reset Password</a>
      </p>
      <p style="color:#64748b;font-size:0.95rem;">If you did not request a password reset, you can safely ignore this email.</p>
    `,
  });
}

export function passwordResetSuccessEmail() {
  return QrGateEmailTemplate({
    title: "Your QRGATE Password Was Reset",
    body: `
      <p style="margin-bottom:24px;">Your password has been successfully reset. If you did not perform this action, please contact our support team immediately.</p>
      <p style="color:#64748b;font-size:0.95rem;">Thank you for using QRGATE.</p>
    `,
  });
}
