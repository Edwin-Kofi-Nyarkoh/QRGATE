import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage?: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  ticketTypeId?: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  title: string;
  image: string;
  startDate: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(
          (i) =>
            i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        const { items } = get();
        set({
          items: items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
