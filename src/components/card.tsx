"use client";

import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";


interface CardProps {
  image: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  organiserEmail: string;
  organiserContact: string;
  startDate: string;
  endDate: string;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
}

const Card: React.FC<CardProps> = ({
  image,
  name,
  slug,
  price,
  description,
  organiserEmail,
  organiserContact,
  startDate,
  endDate,
  quantity,
  onQuantityChange,
  onAddToCart,
}) => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleNavigate = () => {
    router.push(`/events/${slug}`);
  };

  const handleAddToCart = () => {
    if (!session) {
      alert("Please sign in to add events to your cart.");
      return;
    }

    onAddToCart();
  };

  return (
    <div
      onClick={handleNavigate}
      className="cursor-pointer w-full rounded-xl dark:bg-gray-800 overflow-hidden border shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative h-[160px] w-full">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 160px"
        />
      </div>
      <div
        className="p-3 text-sm space-y-1"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-medium truncate">{name}</p>
        <p className="text-green-600 font-semibold">GHS {price.toLocaleString()}</p>
        <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
        <p className="text-xs">
          <strong>Start:</strong> {new Date(startDate).toLocaleString()}
        </p>
        <p className="text-xs">
          <strong>End:</strong> {new Date(endDate).toLocaleString()}
        </p>
        <p className="text-xs truncate">
          <strong>Email:</strong>{" "}
          <a href={`mailto:${organiserEmail}`} className="underline text-blue-500">
            {organiserEmail}
          </a>
        </p>
        <p className="text-xs truncate">
          <strong>Contact:</strong>{" "}
          <a href={`tel:${organiserContact}`} className="underline text-blue-500">
            {organiserContact}
          </a>
        </p>
        <Label className="text-xs">Qty</Label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onQuantityChange(parseInt(e.target.value))}
          className="w-14 h-7 text-xs px-1 border-gray-300"
        />
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className="w-full mt-1 bg-green-600 hover:bg-green-700 text-xs py-1"
        >
          Buy Ticket
        </Button>
      </div>
    </div>
  );
};

export default Card;
