"use client";
import { useState, createContext, useContext } from "react";

interface SidebarToggleContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SidebarToggleContext = createContext<SidebarToggleContextType>({
  open: false,
  setOpen: () => {},
});

export function SidebarToggleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarToggleContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarToggleContext.Provider>
  );
}

export function useSidebarToggle() {
  return useContext(SidebarToggleContext);
}
