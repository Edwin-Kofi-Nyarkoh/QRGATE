import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  eventId?: string;
  eventTitle?: string;
  eventImage?: string;
  eventDate?: string;
  eventLocation?: string;
  ticketType?: string;
  ticketTypeId?: string;
  price?: number;
  quantity?: number;
  maxQuantity?: number;
  location?: string;
  title: string;
  image: string;
  startDate: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemById: (id: string) => CartItem | undefined;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (item) =>
            item.eventId === newItem.eventId &&
            item.ticketTypeId === newItem.ticketTypeId
        );

        if (existingItemIndex > -1) {
          // Update existing item quantity
          const existingItem = items[existingItemIndex];
          const newQuantity = Math.min(
            (existingItem?.quantity ?? 0) + (newItem?.quantity ?? 0),
            existingItem?.maxQuantity ?? 10
          );

          set({
            items: items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        } else {
          // Add new item
          set({
            items: [...items, newItem],
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                quantity: Math.min(quantity, item?.maxQuantity ?? 10),
              };
            }
            return item;
          }),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce(
          (total, item) => total + (item?.quantity ?? 0),
          0
        );
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item?.price ?? 0) * (item?.quantity ?? 0),
          0
        );
      },

      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
