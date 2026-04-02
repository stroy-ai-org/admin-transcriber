"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setEmail(session.user.email ?? "");
    });
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0c]">
        <Sidebar email={email} />
        <main className="md:ml-60 p-6 md:p-8 max-w-[1200px]">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
