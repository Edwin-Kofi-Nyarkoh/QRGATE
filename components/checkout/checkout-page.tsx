"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  Building,
  ArrowLeft,
  ArrowRight,
  Ticket,
  User,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/date-utils";
import Image from "next/image";
import Link from "next/link";

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
}

const steps: CheckoutStep[] = [
  { id: 1, title: "Chosen Tickets", description: "Review your selection" },
  { id: 2, title: "User Info", description: "Contact information" },
  { id: 3, title: "Payment Method", description: "Choose payment option" },
  { id: 4, title: "Complete", description: "Order confirmation" },
];

export function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [userInfo, setUserInfo] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = getTotalPrice();
  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);

    try {
      // Create order with ticket type information
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            ...item,
            ticketType: item.ticketType || "Standard", // Ensure ticket type is included
          })),
          userInfo,
          paymentMethod,
          total: totalPrice,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const { orders } = await orderResponse.json();

      // Initialize payment with single reference
      const paymentResponse = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orders[0].id,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error("Failed to initialize payment");
      }

      const paymentData = await paymentResponse.json();

      if (paymentData?.success) {
        window.location.href = paymentData.data.authorization_url;
      }
      // Clear cart and redirect to payment
      clearCart();
    } catch (error) {
      console.error("Checkout error:", error);
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Add some tickets to proceed with checkout
          </p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="relative h-56 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/booking.jpg")',
        }}
        role="banner"
        aria-label="Booking Tickets"
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Booking Tickets</h1>
            <div className="flex items-center gap-2 text-sm">
              <span>HOME</span>
              <span>›</span>
              <span>BOOKING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const completed = currentStep > step.id;
              const active = currentStep === step.id;
              const stepIcon = completed ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="font-semibold">{step.id}</span>
              );
              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 mb-2 ${
                      completed
                        ? "bg-background border-primary"
                        : active
                        ? "bg-primary-light border-primary text-primary"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {stepIcon}
                  </div>
                  <p
                    className={`text-sm font-semibold mb-1 ${
                      active
                        ? "text-foreground"
                        : completed
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 md:px-8">
        {/* Step 1: Chosen Tickets */}
        {currentStep === 1 && (
          <Card className="bg-card shadow-md rounded-lg">
            <CardHeader className="border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-semibold flex-1">
                  01. CHOSEN TICKETS
                </CardTitle>
                <Badge variant="secondary">{items.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-muted-foreground border-b pb-2">
                  <div>#</div>
                  <div className="sm:col-span-1 lg:col-span-2">
                    TICKETS TYPE
                  </div>
                  <div>PRICE</div>
                  <div>Qty</div>
                  <div>Total</div>
                </div>

                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-4 items-center py-2 sm:py-3 even:bg-muted rounded-lg"
                  >
                    <div className="text-sm">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="sm:col-span-1 lg:col-span-2">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded overflow-hidden">
                          <Image
                            src={
                              item.eventImage ||
                              "/placeholder.svg?height=48&width=48" ||
                              "/placeholder.svg"
                            }
                            alt={item.eventTitle ?? "Event Image"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {item.ticketType || "Standard"} Ticket
                          </p>
                          <p className="text-xs ">{item.eventTitle}</p>
                          <p className="text-xs">
                            {formatDateTime(item?.eventDate ?? "")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm">Ghc{item.price}</div>
                    <div className="text-xs sm:text-sm">{item.quantity}</div>
                    <div className="text-xs sm:text-sm font-medium">
                      Ghc{((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-2">
                  <div className="text-sm text-primary font-medium">
                    ✓ Shopping cart updated
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Final Total
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-500">
                      Ghc{totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: User Info */}
        {currentStep === 2 && (
          <Card className="bg-card shadow-md rounded-lg">
            <CardHeader className="border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  02. USER INFORMATION
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={userInfo.phone}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, phone: e.target.value })
                  }
                  placeholder="+233 234 567 890"
                  required
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Payment Method */}
        {currentStep === 3 && (
          <Card className="bg-card shadow-md rounded-lg">
            <CardHeader className="border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  03. PAYMENT METHOD
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 border rounded-lg p-4">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5" />
                          <div>
                            <p className="font-medium">Credit/Debit Card</p>
                            <p className="text-sm">
                              Pay with Visa, Mastercard, or other cards
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                            VISA
                          </div>
                          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">
                            MC
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4">
                    <RadioGroupItem value="mobile-money" id="mobile-money" />
                    <Label
                      htmlFor="mobile-money"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Mobile Money</p>
                          <p className="text-sm ">
                            Pay with MTN, Airtel, Telecel or other mobile money
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Bank Transfer</p>
                          <p className="text-sm ">Direct bank transfer</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && (
          <Card className="bg-card shadow-md rounded-lg">
            <CardHeader className="border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <CardTitle className="text-lg font-semibold">
                  04. ORDER COMPLETE
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Order Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your tickets have been purchased successfully. QR codes have
                been sent to your email and the event organizer.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/dashboard/tickets">View My Tickets</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/events">Browse More Events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={currentStep === 3 ? handleCompleteOrder : handleNext}
              disabled={
                isProcessing ||
                (currentStep === 2 &&
                  (!userInfo.name || !userInfo.email || !userInfo.phone)) ||
                (currentStep === 3 && !paymentMethod)
              }
            >
              {isProcessing ? (
                "Processing..."
              ) : currentStep === 3 ? (
                "Complete Order"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/tickets">View Tickets</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
