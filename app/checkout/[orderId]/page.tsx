import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { orderId: string };
}) {
  return {
    title: "Checkout | QRGate",
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: { orderId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/auth/signin?callbackUrl=/checkout/${params.orderId}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      event: true,
      user: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Check if order belongs to the current user
  if (order.userId !== session.user.id) {
    redirect("/");
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Complete Your Purchase
        </h1>
        <CheckoutForm order={order} />
      </div>
    </div>
  );
}
