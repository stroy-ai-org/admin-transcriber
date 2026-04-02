"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type AuthState = "loading" | "authenticated" | "denied" | "unauthenticated";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: admin } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!admin) {
        setState("denied");
        setUser(session.user);
        return;
      }

      setUser(session.user);
      setState("authenticated");
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-[#909098] text-sm">Загрузка...</div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="bg-[#141419] border border-[rgba(255,255,255,0.08)] rounded-md p-8 text-center max-w-sm">
          <div className="text-[#ff6b6b] text-sm font-semibold mb-2">Доступ запрещён</div>
          <div className="text-[#909098] text-xs mb-6">
            {user?.email} не является администратором
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-[#4dc9d4] border border-[#4dc9d4] px-4 py-2 rounded hover:bg-[rgba(77,201,212,0.15)] transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
