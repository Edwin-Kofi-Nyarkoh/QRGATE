import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL;

interface InitializePaymentProps {
  email: string;
  amount: number; // in pesewas (100 = 1 GHS)
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface VerifyPaymentResponse {
  id: number;
  status: string;
  reference: string;
  amount: number;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  metadata: Record<string, any>;
  customer: {
    id: number;
    email: string;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export async function initializePayment({
  email,
  amount,
  reference,
  callbackUrl,
  metadata,
}: InitializePaymentProps): Promise<InitializePaymentResponse> {
  try {
    const response = await axios.post<
      PaystackResponse<InitializePaymentResponse>
    >(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo and ensure it's an integer
        reference,
        callback_url: callbackUrl,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("PayStack initialize payment error:", error);
    throw new Error("Failed to initialize payment");
  }
}

export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResponse> {
  try {
    const response = await axios.get<PaystackResponse<VerifyPaymentResponse>>(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    //Send an email notification to the user
    // if (response.data.status && response.data.data.status === "success") {
    //   const paymentData = response.data.data;
    //   // Here you can send an email notification to the user
    //   // For example, using a mail service like nodemailer
    //   await transporter.sendMail({
    //     from: `"QRGATE" <${process.env.EMAIL_USER}>`,
    //     to: paymentData.customer.email,
    //     subject: "Payment Successful",
    //     html: purchaseConfirmationEmail({
    //       name: paymentData.customer.first_name,
    //       eventTitle: paymentData.metadata.eventTitle,
    //       eventDate: paymentData.metadata.eventDate,
    //       eventLocation: paymentData.metadata.eventLocation,
    //       ticketType: paymentData.metadata.ticketType,
    //       ticketNumber: paymentData.metadata.ticketNumber,
    //       qrCodeUrl: paymentData.metadata.qrCodeUrl,
    //     }),
    //   });
    // } else {
    //   console.error("Payment verification failed:", response.data.message);
    //   // Send an email notification for failed payment
    //   await transporter.sendMail({
    //     from: `"QRGATE" <${process.env.EMAIL_USER}>`,
    //     to: response.data.data.customer.email,
    //     subject: "Payment Failed",
    //     html: purchaseFailureEmail({
    //       name: response.data.data.customer.first_name,
    //       eventTitle: response.data.data.metadata.eventTitle,
    //       supportEmail:
    //         process.env.SUPPORT_EMAIL || "<support_email@example.com>",
    //     }),
    //   });
    // }

    return response.data.data;
  } catch (error) {
    console.error("PayStack verify payment error:", error);
    throw new Error("Failed to verify payment");
  }
}
