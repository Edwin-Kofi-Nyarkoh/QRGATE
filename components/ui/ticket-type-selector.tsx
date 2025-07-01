"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus } from "lucide-react";

interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
  soldCount: number;
}

interface TicketTypeSelectorProps {
  ticketTypes: TicketType[];
  onSelect: (typeId: string, quantity: number) => void;
  initialTypeId?: string;
}

export function TicketTypeSelector({
  ticketTypes,
  onSelect,
  initialTypeId,
}: TicketTypeSelectorProps) {
  const [selectedTypeId, setSelectedTypeId] = useState(
    initialTypeId || ticketTypes[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(1);

  const selectedType = ticketTypes.find((t) => t.id === selectedTypeId);
  const available = selectedType
    ? selectedType.quantity - selectedType.soldCount
    : 0;

  const handleTypeChange = (id: string) => {
    setSelectedTypeId(id);
    setQuantity(1);
    onSelect(id, 1);
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(
      1,
      Math.min(quantity + delta, Math.min(10, available))
    );
    setQuantity(newQty);
    onSelect(selectedTypeId, newQty);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Select Ticket Type</h3>
      <Select value={selectedTypeId} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select ticket type" />
        </SelectTrigger>
        <SelectContent>
          {ticketTypes.map((type) => {
            const isSoldOut = type.quantity - type.soldCount <= 0;
            return (
              <SelectItem
                key={type.id}
                value={type.id}
                disabled={isSoldOut}
                className="py-2 px-3 flex items-center justify-between"
              >
                <span>{type.name}</span>
                <span className="ml-2 text-primary font-semibold text-sm">
                  Ghc{type.price.toFixed(2)}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {selectedType && (
        <div className="flex items-center gap-4">
          <span className="font-medium">Quantity:</span>
          <div className="flex items-center border rounded-md">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="rounded-r-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center px-4">{quantity}</div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= Math.min(10, available)}
              className="rounded-l-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="ml-4 text-muted-foreground text-sm">
            {available} left
          </span>
        </div>
      )}
    </div>
  );
}
