"use client";

import { PaystackButton } from "react-paystack";

interface PaystackButtonProps {
  email: string;
  amount: number; 
  onSuccess: (response: { reference: string }) => void;
}

export default function PaystackPayButton({ email, amount, onSuccess }: PaystackButtonProps) {
  const config = {
    reference: new Date().getTime().toString(),
    email,
    amount: amount * 100, 
    currency: "GHS", 
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  };

  return (
    <PaystackButton
      {...config}
      text="Pay Now"
      onSuccess={onSuccess}
      onClose={() => alert("Payment cancelled")}
      className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
    />
  );
}
