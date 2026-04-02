"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/Badge";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 20;

const statusFilter = [
  { value: "", label: "Все" },
  { value: "success", label: "Успешные" },
  { value: "failed", label: "Неуспешные" },
  { value: "pending", label: "В ожидании" },
];

const typeFilter = [
  { value: "", label: "Все" },
  { value: "subscription", label: "Подписка" },
  { value: "addon", label: "Пакет" },
];

export default function PaymentsPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("payments")
      .select("*, users(first_name, username)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) query = query.eq("status", status);
    if (type) query = query.eq("type", type);

    const { data: payments, count } = await query;
    setData(payments ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, status, type]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [status, type]);

  const columns = [
    {
      key: "created_at", label: "Дата",
      render: (row: Record<string, unknown>) => formatDateTime(row.created_at as string),
    },
    {
      key: "user", label: "Пользователь",
      render: (row: Record<string, unknown>) => {
        const u = row.users as { first_name: string; username: string } | null;
        return u?.first_name || (u?.username ? `@${u.username}` : "—");
      },
    },
    {
      key: "amount", label: "Сумма",
      render: (row: Record<string, unknown>) => formatCurrency(Number(row.amount)),
    },
    {
      key: "type", label: "Тип",
      render: (row: Record<string, unknown>) => (
        <Badge variant={row.type === "subscription" ? "cyan" : "purple"}>{row.type as string}</Badge>
      ),
    },
    {
      key: "status", label: "Статус",
      render: (row: Record<string, unknown>) => {
        const s = row.status as string;
        const v = s === "success" ? "success" : s === "failed" ? "error" : "warning";
        return <Badge variant={v}>{s}</Badge>;
      },
    },
  ];

  return (
    <div>
      <h1 className="text-[36px] font-bold text-[#e8e8ec] tracking-[-0.72px] mb-8">Платежи</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        {statusFilter.map((f) => (
          <button key={f.value} onClick={() => setStatus(f.value)}
            className={`text-[11px] px-3 py-1.5 rounded border transition-colors ${
              status === f.value
                ? "border-[#4dc9d4] text-[#4dc9d4] bg-[rgba(77,201,212,0.15)]"
                : "border-[rgba(255,255,255,0.08)] text-[#909098] hover:text-[#d0d0d8]"
            }`}>{f.label}</button>
        ))}
        <div className="w-px bg-[rgba(255,255,255,0.08)]" />
        {typeFilter.map((f) => (
          <button key={f.value} onClick={() => setType(f.value)}
            className={`text-[11px] px-3 py-1.5 rounded border transition-colors ${
              type === f.value
                ? "border-[#4dc9d4] text-[#4dc9d4] bg-[rgba(77,201,212,0.15)]"
                : "border-[rgba(255,255,255,0.08)] text-[#909098] hover:text-[#d0d0d8]"
            }`}>{f.label}</button>
        ))}
      </div>

      <DataTable columns={columns} data={data} page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} loading={loading} />
    </div>
  );
}
