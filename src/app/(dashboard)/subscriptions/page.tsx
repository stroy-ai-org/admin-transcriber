"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/Badge";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 20;

const planFilter = [
  { value: "", label: "Все" },
  { value: "free", label: "Free" },
  { value: "standard", label: "Standard" },
  { value: "pro", label: "Pro" },
];

const activeFilter = [
  { value: "", label: "Все" },
  { value: "true", label: "Активные" },
  { value: "false", label: "Истёкшие" },
];

export default function SubscriptionsPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [planName, setPlanName] = useState("");
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("subscriptions")
      .select("*, users(first_name, username), plans(name, display_name)", { count: "exact" })
      .order("starts_at", { ascending: false })
      .range(from, to);

    if (active) query = query.eq("is_active", active === "true");
    if (planName) query = query.eq("plans.name", planName);

    const { data: subs, count } = await query;
    setData(subs ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, planName, active]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [planName, active]);

  const columns = [
    {
      key: "user", label: "Пользователь",
      render: (row: Record<string, unknown>) => {
        const u = row.users as { first_name: string; username: string } | null;
        return u?.first_name || (u?.username ? `@${u.username}` : "—");
      },
    },
    {
      key: "plan", label: "Тариф",
      render: (row: Record<string, unknown>) => {
        const p = row.plans as { name: string; display_name: string } | null;
        const variant = p?.name === "pro" ? "purple" : p?.name === "standard" ? "cyan" : "dim";
        return <Badge variant={variant}>{p?.display_name ?? "—"}</Badge>;
      },
    },
    {
      key: "starts_at", label: "Начало",
      render: (row: Record<string, unknown>) => formatDate(row.starts_at as string),
    },
    {
      key: "expires_at", label: "Окончание",
      render: (row: Record<string, unknown>) => formatDate(row.expires_at as string),
    },
    {
      key: "is_active", label: "Статус",
      render: (row: Record<string, unknown>) =>
        row.is_active ? <Badge variant="success">active</Badge> : <Badge variant="dim">expired</Badge>,
    },
  ];

  return (
    <div>
      <h1 className="text-[36px] font-bold text-[#e8e8ec] tracking-[-0.72px] mb-8">Подписки</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        {planFilter.map((f) => (
          <button key={f.value} onClick={() => setPlanName(f.value)}
            className={`text-[11px] px-3 py-1.5 rounded border transition-colors ${
              planName === f.value
                ? "border-[#4dc9d4] text-[#4dc9d4] bg-[rgba(77,201,212,0.15)]"
                : "border-[rgba(255,255,255,0.08)] text-[#909098] hover:text-[#d0d0d8]"
            }`}>{f.label}</button>
        ))}
        <div className="w-px bg-[rgba(255,255,255,0.08)]" />
        {activeFilter.map((f) => (
          <button key={f.value} onClick={() => setActive(f.value)}
            className={`text-[11px] px-3 py-1.5 rounded border transition-colors ${
              active === f.value
                ? "border-[#4dc9d4] text-[#4dc9d4] bg-[rgba(77,201,212,0.15)]"
                : "border-[rgba(255,255,255,0.08)] text-[#909098] hover:text-[#d0d0d8]"
            }`}>{f.label}</button>
        ))}
      </div>

      <DataTable columns={columns} data={data} page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} loading={loading} />
    </div>
  );
}
