"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Неверный email или пароль");
      setLoading(false);
      return;
    }

    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#141419] border border-[rgba(255,255,255,0.08)] rounded-md p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-sm font-bold text-[#e8e8ec] tracking-wide uppercase">
            Транскрибатор
          </h1>
          <div className="text-xs text-[#909098] mt-1">admin panel</div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] text-[#909098] uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#181820] border border-[rgba(255,255,255,0.08)] rounded px-3 py-2.5 text-[13px] text-[#e8e8ec] focus:border-[#4dc9d4] focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#909098] uppercase tracking-wider mb-1.5">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#181820] border border-[rgba(255,255,255,0.08)] rounded px-3 py-2.5 text-[13px] text-[#e8e8ec] focus:border-[#4dc9d4] focus:outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <div className="text-[11px] text-[#ff6b6b]">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-[#4dc9d4] text-[#4dc9d4] text-[13px] font-bold py-2.5 rounded hover:bg-[rgba(77,201,212,0.15)] hover:shadow-[0_0_20px_rgba(77,201,212,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </div>
      </form>
    </div>
  );
}
