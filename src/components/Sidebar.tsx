"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, CalendarClock, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Пользователи", icon: Users },
  { href: "/payments", label: "Платежи", icon: CreditCard },
  { href: "/subscriptions", label: "Подписки", icon: CalendarClock },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded bg-[#161620] border border-[rgba(255,255,255,0.06)]"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-4 h-4 text-[#909098]" /> : <Menu className="w-4 h-4 text-[#909098]" />}
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-[#161620] border-r border-[rgba(255,255,255,0.06)] z-40 flex flex-col transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 h-[52px] flex items-center border-b border-[rgba(255,255,255,0.06)]">
          <span className="text-[13px] font-bold text-[#e8e8ec] tracking-[0.02em]">TRANSCRIBATOR</span>
          <span className="text-[10px] text-[#909098] ml-2">admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-[11px] transition-colors ${
                  isActive
                    ? "text-[#4dc9d4] bg-[rgba(77,201,212,0.15)]"
                    : "text-[#909098] hover:text-[#d0d0d8] hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.06)]">
          <div className="text-[10px] text-[#808088] truncate mb-2">{email}</div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 text-[10px] text-[#909098] hover:text-[#ff6b6b] transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Выйти
          </button>
        </div>
      </aside>
    </>
  );
}
