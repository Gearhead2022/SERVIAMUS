"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/app/(admin)/config/menu.config";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function SidebarMenu() {
  const { user } = useAuth();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const toggleHandler = () => setIsOpen(prev => !prev);
    window.addEventListener("toggleSidebar", toggleHandler);

    return () => window.removeEventListener("toggleSidebar", toggleHandler);
  }, []);


  if (!mounted) {
    return (
      <aside className="relative bg-[#203636] h-screen w-60" />
    );
  }

  const allowedMenu = user
    ? MENU_ITEMS.filter(item =>
        item.roles.some(role => user.roles.includes(role))
      )
    : [];

  return (
    <aside
      className={clsx(
        "relative bg-[#203636] h-screen flex flex-col border-r border-white/[0.06] transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "w-60" : "w-[68px]"
      )}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative px-4 py-5 border-b border-white/[0.06] flex items-center justify-between gap-2 min-h-[72px]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(251,146,60,0.35)] shrink-0" /> */}
          <img src="images/serviamus.jpeg" className="rounded-2xl" alt="" width={50} height={50} />
          <div className={clsx(
            "overflow-hidden transition-all duration-300",
            isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
          )}>
            <p className="text-white text-sm font-bold">SCLMS</p>
            <p className="text-white/20 text-[9px]">v2.4.0</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={clsx(
            "w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/70",
            !isOpen && "rotate-180"
          )}
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {allowedMenu.map(item => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={clsx(
                "flex items-center gap-3 rounded-xl text-sm transition-all",
                isOpen ? "px-3 py-2.5" : "justify-center py-2.5",
                isActive
                  ? "text-white bg-orange-500/20"
                  : "text-white/40 hover:text-white hover:bg-white/10"
              )}
            >
              {item.icon}
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}