"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

interface Metrics {
  revenue30d: number;
  paymentsCount30d: number;
  avgCheck: number;
  totalUsers: number;
  newUsers7d: number;
  activeUsers7d: number;
  planDistribution: { free: number; standard: number; pro: number };
  expiringSoon: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
      const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
      const d3 = new Date(now.getTime() + 3 * 86400000).toISOString();

      const [paymentsRes, usersRes, newUsersRes, subsRes, expiringRes] = await Promise.all([
        supabase.from("payments").select("amount").eq("status", "success").gte("created_at", d30),
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", d7),
        supabase.from("subscriptions").select("plan_id, plans(name)").eq("is_active", true),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("is_active", true).lte("expires_at", d3).gte("expires_at", now.toISOString()),
      ]);

      const payments = paymentsRes.data ?? [];
      const revenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      const planDist = { free: 0, standard: 0, pro: 0 };
      for (const sub of subsRes.data ?? []) {
        const planData = (sub as Record<string, unknown>).plans as { name: string } | null;
        const name = planData?.name as keyof typeof planDist;
        if (name in planDist) planDist[name]++;
      }

      setMetrics({
        revenue30d: revenue,
        paymentsCount30d: payments.length,
        avgCheck: payments.length > 0 ? Math.round(revenue / payments.length) : 0,
        totalUsers: usersRes.count ?? 0,
        newUsers7d: newUsersRes.count ?? 0,
        activeUsers7d: 0,
        planDistribution: planDist,
        expiringSoon: expiringRes.count ?? 0,
      });
    }
    load();
  }, []);

  if (!metrics) {
    return (
      <div>
        <h1 className="text-[36px] font-bold text-[#e8e8ec] tracking-[-0.72px] mb-8">Dashboard</h1>
        <div className="text-[#909098] text-sm">Загрузка метрик...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[36px] font-bold text-[#e8e8ec] tracking-[-0.72px] mb-8">Dashboard</h1>

      <div className="text-[11px] text-[#909098] uppercase tracking-wider mb-3">Деньги — 30 дней</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Выручка" value={formatCurrency(metrics.revenue30d)} />
        <MetricCard label="Оплат" value={metrics.paymentsCount30d} />
        <MetricCard label="Средний чек" value={formatCurrency(metrics.avgCheck)} />
      </div>

      <div className="text-[11px] text-[#909098] uppercase tracking-wider mb-3">Пользователи</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Всего" value={metrics.totalUsers} />
        <MetricCard label="Новых за 7 дней" value={metrics.newUsers7d} />
        <MetricCard label="Активных за 7 дней" value={metrics.activeUsers7d} />
      </div>

      <div className="text-[11px] text-[#909098] uppercase tracking-wider mb-3">Подписки</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Free" value={metrics.planDistribution.free} />
        <MetricCard label="Standard" value={metrics.planDistribution.standard} />
        <MetricCard label="Pro" value={metrics.planDistribution.pro} />
        <MetricCard label="Истекает ≤3 дня" value={metrics.expiringSoon} sub={metrics.expiringSoon > 0 ? "требуют внимания" : ""} />
      </div>
    </div>
  );
}
