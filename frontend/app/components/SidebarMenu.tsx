"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/app/pages/admin/config/menu.config";
import { useAuth } from "@/app/context/AuthContext";
import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function SidebarMenu() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const toggleHandler = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggleSidebar", toggleHandler);
    return () => window.removeEventListener("toggleSidebar", toggleHandler);
  }, []);

  if (!user) return null;

  const allowedMenu = MENU_ITEMS.filter(item =>
    item.roles.some(role => user.roles.includes(role))
  );

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside
      className={clsx(
        "relative bg-[#203636] h-screen flex flex-col border-r border-white/[0.06] transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "w-60" : "w-[68px]"
      )}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />

      {/* Brand Header */}
      <div className="relative px-4 py-5 border-b border-white/[0.06] flex items-center justify-between gap-2 min-h-[72px]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(251,146,60,0.35)] shrink-0">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <div className={clsx("overflow-hidden transition-all duration-300", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
            <p className="text-white text-sm font-bold tracking-tight whitespace-nowrap">QuickPOS</p>
            <p className="text-white/20 text-[9px] font-mono tracking-[2px] uppercase whitespace-nowrap">v2.4.0</p>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("toggleSidebar"))}
          className={clsx(
            "shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all duration-300",
            !isOpen && "rotate-180"
          )}
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {isOpen && (
          <p className="text-white/20 text-[9px] font-mono tracking-[2.5px] uppercase px-2 pb-2">
            Menu
          </p>
        )}

        {allowedMenu.map(item => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              title={!isOpen ? item.label : undefined}
              className={clsx(
                "group relative flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-150 border",
                isOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center",
                isActive
                  ? "text-white bg-orange-500/[0.12] border-orange-500/20"
                  : "text-white/35 border-transparent hover:text-white/80 hover:bg-white/[0.05] hover:border-white/[0.07]"
              )}
            >
              {/* Active pip */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[1px] w-[3px] h-5 bg-orange-400 rounded-r-full shadow-[0_0_8px_rgba(251,146,60,0.7)]" />
              )}

              <span className={clsx(
                "shrink-0 flex items-center justify-center transition-colors",
                isActive
                  ? "text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.5)]"
                  : "text-white/60 group-hover:text-white/90"
              )}>
                {item.icon}
              </span>

              <span className={clsx(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                isOpen ? "opacity-100 max-w-full text-white/60 group-hover:text-white/90" : "opacity-0 max-w-0 text-white/90"
              )}>
                {item.label}
              </span>

              {/* Tooltip when collapsed */}
              {!isOpen && (
                <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-md bg-[#1a1a1f] border border-white/10 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 shadow-xl">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-2.5 border-t border-white/[0.06]">
        <div className={clsx(
          "flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] transition-all duration-150 hover:bg-white/[0.05]",
          isOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
        )}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400/20 to-orange-600/10 border border-orange-400/20 flex items-center justify-center shrink-0">
            <span className="text-orange-300 text-[11px] font-bold">{initials}</span>
          </div>

          <div className={clsx(
            "flex-1 min-w-0 overflow-hidden transition-all duration-300",
            isOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
          )}>
            <p className="text-white/80 text-[11.5px] font-semibold truncate leading-tight">
              {user?.name ?? "Cashier"}
            </p>
            <p className="text-white/20 text-[9px] font-mono uppercase tracking-wider mt-0.5">
              {user.roles?.[0] ?? "staff"}
            </p>
          </div>

          {isOpen && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)] shrink-0" />
          )}
        </div>
      </div>
    </aside>
  );
}