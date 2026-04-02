"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { SearchInput } from "@/components/SearchInput";
import { Badge } from "@/components/Badge";
import { supabase } from "@/lib/supabase";
import { formatDate, relativeTime } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("users")
      .select("*, subscriptions(plan_id, is_active, plans(name, display_name)), usage(transcription_count)", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`username.ilike.%${search}%,first_name.ilike.%${search}%`);
    }

    const { data: users, count } = await query;
    setData(users ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const columns = [
    { key: "first_name", label: "Имя" },
    { key: "username", label: "Username", render: (row: Record<string, unknown>) => row.username ? `@${row.username}` : "—" },
    {
      key: "plan",
      label: "Тариф",
      render: (row: Record<string, unknown>) => {
        const subs = row.subscriptions as Array<{ is_active: boolean; plans: { display_name: string; name: string } }> | undefined;
        const active = subs?.find((s) => s.is_active);
        if (!active) return <Badge variant="dim">Free</Badge>;
        const name = active.plans?.name;
        const variant = name === "pro" ? "purple" : name === "standard" ? "cyan" : "dim";
        return <Badge variant={variant}>{active.plans?.display_name}</Badge>;
      },
    },
    {
      key: "created_at",
      label: "Регистрация",
      render: (row: Record<string, unknown>) => formatDate(row.created_at as string),
    },
    {
      key: "last_seen",
      label: "Активность",
      render: (row: Record<string, unknown>) => relativeTime(row.last_seen as string),
    },
  ];

  return (
    <div>
      <h1 className="text-[36px] font-bold text-[#e8e8ec] tracking-[-0.72px] mb-8">
        Пользователи
      </h1>

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Поиск по имени или username..."
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/users/detail?id=${row.id}`)}
        loading={loading}
      />
    </div>
  );
}
