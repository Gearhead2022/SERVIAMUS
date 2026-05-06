"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Menu, Bell, Search, ChevronDown, LogOut, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MENU_ITEMS } from "@/app/(admin)/config/menu.config";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // const [time, setTime] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPage = MENU_ITEMS.find((item) => item.path === pathname);
  const pageTitle = currentPage?.label ?? pathname.replace("/", "").toUpperCase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="h-14 flex items-center px-6 gap-4 sticky top-0 z-30 font-['DM_Sans']"
      style={{
        background: "linear-gradient(90deg, #172338 0%, #0a1c38 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(15,34,68,0.35)",
      }}
    >
      {/* ── Left: Toggle + Breadcrumb ── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("toggleSidebar"))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <Menu size={16} />
        </button>

        <span className="w-px h-4 bg-white/10" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5">
          <span className="text-white/30 text-[10px] font-semibold tracking-widest uppercase">
            Admin
          </span>
          <span className="text-white/15 text-xs">/</span>
          <span className="text-white text-sm font-semibold tracking-tight">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* ── Center: Search ── */}
      {/* <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.08] transition-all cursor-pointer w-56 group">
        <Search size={13} className="text-white/25 group-hover:text-white/50 transition-colors" />
        <span className="text-white/25 text-xs flex-1 group-hover:text-white/40 transition-colors">
          Quick search…
        </span>
        <kbd className="text-[10px] font-mono text-white/20 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded-md">
          ⌘K
        </kbd>
      </div> */}

      {/* ── Right ── */}
      <div className="flex items-center gap-1.5">
        <span className="hidden lg:block w-px h-5 mx-1" />

        {/* Notifications */}
        <button
          type="button"
          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/10 transition-all"
        >
          <Bell size={15} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#c8102e] shadow-[0_0_6px_rgba(200,16,46,0.8)]" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-[100%] bg-gradient-to-br from-[#fff] to-[#e6e1e1] flex items-center justify-center flex-shrink-0">
              <span>
                <img src="../images/default.png" alt="" />
              </span>
            </div>
            <span className="text-white/60 text-xs font-medium hidden sm:block max-w-[80px] truncate">
              {mounted ? user?.name?.split(" ")[0] ?? "User" : "User"}
            </span>
            <ChevronDown
              size={12}
              className={`text-white/25 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50"
              style={{
                background: "white",
                border: "1px solid #dce3ef",
                boxShadow: "0 16px 48px rgba(15,34,68,0.18)",
                animation: "dropIn 0.15s ease",
              }}
            >
              <style>{`
                @keyframes dropIn {
                  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                  to   { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>

              {/* User card */}
              <div className="bg-[#0f2244] px-4 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-[100%] bg-gradient-to-br from-[#fff] to-[#e6e1e1] flex items-center justify-center flex-shrink-0 ring-2 ring-white/10">
                  {/* <span className="text-white text-sm font-bold">{initials}</span> */}
                  <span>
                    <img src="../images/default.png" alt="" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold font-['DM_Serif_Display'] truncate">
                    {user?.name ?? "User"}
                  </p>
                  <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mt-0.5">
                    {user?.roles?.[0] ?? "Staff"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2 space-y-0.5">
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[#1a2a45] hover:bg-[#f0f3fa] text-sm font-medium transition-all text-left"
                >
                  <Settings size={14} className="text-[#6b7da0]" />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[#c8102e] hover:bg-[#fdf0f2] text-sm font-medium transition-all text-left"
                >
                  <LogOut size={14} />
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