"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";


const routes = [
  { label: "Home", path: "/" },
  { label: "Events", path: "/events" },
  { label: "Trending Events", path: "/event/trending" },
  { label: "My Tickets (Purchased)", path: "/my-tickets" },
  { label: "Orders", path: "/orders" },
  { label: "FAQ's", path: "/admin",},
];

const reStrictedRoutes = [
    {label:"Scan QRcode", path: "/verify" },
    {label:"upload event", path: "/eventUpload"}
]

export default function SideBar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const sideBarRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };
  const handleClick = (path:string) => {
    if (!session) {
      alert("Please log in");
      return;
    }
    router.push(path);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      const clickedOutsideSidebar =
        sideBarRef.current && !sideBarRef.current.contains(target);
      const clickedOutsideToggle =
        toggleBtnRef.current && !toggleBtnRef.current.contains(target);

      if (isOpen && clickedOutsideSidebar && clickedOutsideToggle) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div className="fixed md:top-16 top-16 left-4 z-40" ref={toggleBtnRef}>
        <Button size="icon" onClick={toggleSidebar}>
          {isOpen ? <X size={70} /> : <Menu size={70} />}
        </Button>
      </div>

      <aside
        ref={sideBarRef}
        className={clsx(
          "fixed top-0 pt-32 left-0 h-full z-30 w-64 bg-white dark:bg-gray-900 shadow-lg p-4 transform transition-transform duration-300 ease-in-out",
          {
            "-translate-x-full": !isOpen,
            "translate-x-0": isOpen,
          }
        )}
      >
        <h2 className="text-lg font-semibold mb-2">Explore Events</h2>
        {routes.map((route)=>(
            <Button
            key={route.path}
            variant="ghost"
            className="w-full justify-start text-left capitalize"
            onClick={()=> handleClick(route.path)}
            >
                {route.label}
            </Button>
        ))}

        <h2 className="text-lg. font-semibold mt-4 mb-2">ORGANISER&apos;S ONLY</h2>
    {reStrictedRoutes.map((reStrictedRoute)=>(
        <Button
        key={reStrictedRoute.path}
        variant="ghost"
        className="w-full justify-start text-left capitalize"
        onClick={()=> handleClick(reStrictedRoute.path)}>
            {reStrictedRoute.label}
        </Button>
    ))}
      </aside>
    </>
  );
}
