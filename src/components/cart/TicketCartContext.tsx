// app/context/TicketCartContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface TicketCartItem {
  eventId: number;
  eventName: string;
  price: number;
  quantity: number;
}

interface TicketCartContextType {
  cart: TicketCartItem[];
  addToCart: (item: TicketCartItem) => void;
  updateQuantity: (eventId: number, quantity: number) => void;
  removeFromCart: (eventId: number) => void;
  clearCart: () => void;
}

const TicketCartContext = createContext<TicketCartContextType | null>(null);

export function TicketCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<TicketCartItem[]>([]);

  const addToCart = (item: TicketCartItem) => {
    setCart(prev => {
      const exists = prev.find(t => t.eventId === item.eventId);
      if (exists) {
        return prev.map(t =>
          t.eventId === item.eventId
            ? { ...t, quantity: t.quantity + item.quantity }
            : t
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (eventId: number, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev =>
      prev.map(t =>
        t.eventId === eventId ? { ...t, quantity } : t
      )
    );
  };

  const removeFromCart = (eventId: number) => {
    setCart(prev => prev.filter(t => t.eventId !== eventId));
  };

  const clearCart = () => setCart([]);

  return (
    <TicketCartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </TicketCartContext.Provider>
  );
}

export function useTicketCart() {
  const context = useContext(TicketCartContext);
  if (!context) {
    throw new Error("useTicketCart must be used within a TicketCartProvider");
  }
  return context;
}
