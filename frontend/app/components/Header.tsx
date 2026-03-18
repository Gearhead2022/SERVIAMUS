"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Menu, Bell, Search, ChevronDown, LogOut, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MENU_ITEMS } from "@/app/pages/admin/config/menu.config";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive page title from current route
  const currentPage = MENU_ITEMS.find(item => item.path === pathname);
  const pageTitle = currentPage?.label ?? "Dashboard";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const initials = user?.name
  //   ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
  //   : "U";

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateString = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <header className="h-14 bg-[#122426] backdrop-blur-md border-b border-white/[0.06] flex items-center px-5 gap-4 sticky top-0 z-30">

      {/* Left: Sidebar toggle + page title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("toggleSidebar"))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/90 hover:text-white/80 hover:bg-white/[0.16] transition-all"
        >
          <Menu size={16} />
        </button>

        {/* Divider */}
        <span className="w-px h-4 bg-white/[0.08]" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5">
          <span className="text-white/40 text-xs font-mono">ADMIN</span>
          <span className="text-white/15 text-xs">/</span>
          <span className="text-white/80 text-sm font-semibold tracking-tight">{pageTitle}</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/25 hover:border-white/[0.12] hover:text-white/40 transition-all cursor-pointer w-52 group">
        <Search size={13} />
        <span className="text-xs flex-1">Quick search...</span>
        <kbd className="text-[10px] font-mono bg-white/[0.06] px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>

      {/* Right: Date/time + notifications + user */}
      <div className="flex items-center gap-2">

        {/* Date/time */}
        <div className="hidden lg:flex flex-col items-end mr-1">
          <span className="text-white/60 text-[11px] font-mono leading-tight">{timeString}</span>
          <span className="text-white/20 text-[10px] font-mono leading-tight">{dateString}</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
        >
          <Bell size={15} />
          {/* Badge */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.7)]" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400/25 to-orange-600/10 border border-orange-400/20 flex items-center justify-center">
              {/* <span className="text-orange-300 text-[10px] font-bold">{initials}</span> */}
            </div>
            {/* <span className="text-white/70 text-xs font-medium hidden sm:block">
              {user?.name?.split(" ")[0] ?? "User"}
            </span> */}
            <ChevronDown size={12} className="text-white/25" />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50">
              {/* User info */}
              <div className="px-3.5 py-3 border-b border-white/[0.06]">
                {/* <p className="text-white/80 text-xs font-semibold">{user?.name ?? "User"}</p> */}
                <p className="text-white/25 text-[10px] font-mono uppercase tracking-wider mt-0.5">
                  {user?.roles?.[0] ?? "staff"}
                </p>
              </div>

              {/* Actions */}
              <div className="p-1.5 flex flex-col gap-0.5">
                <button
                  type="button"
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.05] text-xs font-medium transition-all text-left"
                >
                  <Settings size={13} />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => logout?.()}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.08] text-xs font-medium transition-all text-left"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}