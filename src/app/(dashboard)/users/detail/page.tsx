"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

function UserDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [bonusAmount, setBonusAmount] = useState("10");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const [userRes, paymentsRes, plansRes] = await Promise.all([
        supabase
          .from("users")
          .select("*, subscriptions(*, plans(*)), usage(transcription_count), addon_packages(remaining)")
          .eq("id", id)
          .single(),
        supabase
          .from("payments")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("plans").select("*").eq("is_active", true),
      ]);

      setUser(userRes.data);
      setPayments(paymentsRes.data ?? []);
      setPlans(plansRes.data ?? []);
      setLoading(false);
    }

    load();
  }, [id]);

  async function changePlan(planId: number) {
    if (!user) return;
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 86400000);

    // Deactivate old subscriptions
    await supabase
      .from("subscriptions")
      .update({ is_active: false })
      .eq("user_id", user.id as number)
      .eq("is_active", true);

    // Create new subscription
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_id: planId,
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
      is_active: true,
    });

    // Create usage record
    const { data: newSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id as number)
      .eq("is_active", true)
      .single();

    if (newSub) {
      await supabase.from("usage").insert({
        user_id: user.id,
        subscription_id: newSub.id,
        transcription_count: 0,
      });
    }

    setChangePlanOpen(false);
    window.location.reload();
  }

  async function addBonus() {
    if (!user) return;
    await supabase.from("addon_packages").insert({
      user_id: user.id,
      total: parseInt(bonusAmount),
      remaining: parseInt(bonusAmount),
    });
    setBonusOpen(false);
    window.location.reload();
  }

  if (!id) {
    return <div className="text-[#ff6b6b] text-sm">Не указан ID пользователя</div>;
  }

  if (loading) {
    return <div className="text-[#909098] text-sm">Загрузка...</div>;
  }

  if (!user) {
    return <div className="text-[#ff6b6b] text-sm">Пользователь не найден</div>;
  }

  const subs = user.subscriptions as Array<Record<string, unknown>> | undefined;
  const activeSub = subs?.find((s) => s.is_active);
  const plan = activeSub?.plans as Record<string, unknown> | undefined;
  const usageArr = user.usage as Array<{ transcription_count: number }> | undefined;
  const usageCount = usageArr?.[0]?.transcription_count ?? 0;
  const addons = user.addon_packages as Array<{ remaining: number }> | undefined;
  const addonsRemaining = addons?.reduce((sum, a) => sum + a.remaining, 0) ?? 0;

  const statusBadge = (status: string) => {
    if (status === "success") return <Badge variant="success">success</Badge>;
    if (status === "failed") return <Badge variant="error">failed</Badge>;
    return <Badge variant="warning">pending</Badge>;
  };

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[11px] text-[#909098] hover:text-[#4dc9d4] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Назад
      </button>

      <h1 className="text-[36px] font-bold text-[#e8e8ec] tracking-[-0.72px] mb-8">
        {(user.first_name as string) || "Без имени"}
      </h1>

      {/* User info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#141419] border border-[rgba(255,255,255,0.08)] rounded-md p-5 space-y-3">
          <div className="text-[11px] text-[#909098] uppercase tracking-wider mb-3">Информация</div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#909098]">Username</span>
            <span className="text-[#d0d0d8]">{(user.username as string) ? `@${user.username}` : "—"}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#909098]">Max ID</span>
            <span className="text-[#d0d0d8] font-mono">{user.max_user_id as number}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#909098]">Регистрация</span>
            <span className="text-[#d0d0d8]">{formatDate(user.created_at as string)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#909098]">Последняя активность</span>
            <span className="text-[#d0d0d8]">{formatDateTime(user.last_seen as string)}</span>
          </div>
        </div>

        <div className="bg-[#141419] border border-[rgba(255,255,255,0.08)] rounded-md p-5 space-y-3">
          <div className="text-[11px] text-[#909098] uppercase tracking-wider mb-3">Подписка</div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#909098]">Тариф</span>
            <span className="text-[#d0d0d8]">{(plan?.display_name as string) ?? "Free"}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#909098]">Использовано</span>
            <span className="text-[#d0d0d8]">{usageCount} / {(plan?.transcriptions_limit as number) ?? 3}</span>
          </div>
          {activeSub && (
            <div className="flex justify-between text-[13px]">
              <span className="text-[#909098]">Истекает</span>
              <span className="text-[#d0d0d8]">{formatDate(activeSub.expires_at as string)}</span>
            </div>
          )}
          <div className="flex justify-between text-[13px]">
            <span className="text-[#909098]">Доп. пакеты</span>
            <span className="text-[#d0d0d8]">{addonsRemaining} транскрипций</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setChangePlanOpen(true)}
          className="text-[11px] font-bold text-[#4dc9d4] border border-[#4dc9d4] px-4 py-2 rounded hover:bg-[rgba(77,201,212,0.15)] transition-colors"
        >
          Сменить тариф
        </button>
        <button
          onClick={() => setBonusOpen(true)}
          className="text-[11px] font-bold text-[#00bb7f] border border-[#00bb7f] px-4 py-2 rounded hover:bg-[rgba(0,187,127,0.15)] transition-colors"
        >
          Начислить бонус
        </button>
      </div>

      {/* Payments */}
      <div className="text-[11px] text-[#909098] uppercase tracking-wider mb-3">
        История платежей
      </div>
      <div className="bg-[#141419] border border-[rgba(255,255,255,0.08)] rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)]">
              <th className="text-left text-[11px] text-[#909098] uppercase px-4 py-3 font-medium">Дата</th>
              <th className="text-left text-[11px] text-[#909098] uppercase px-4 py-3 font-medium">Сумма</th>
              <th className="text-left text-[11px] text-[#909098] uppercase px-4 py-3 font-medium">Тип</th>
              <th className="text-left text-[11px] text-[#909098] uppercase px-4 py-3 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-[13px] text-[#909098] py-8">Нет платежей</td>
              </tr>
            ) : (
              payments.map((p, i) => (
                <tr key={i} className={`border-b border-[rgba(255,255,255,0.04)] ${i % 2 === 0 ? "bg-[rgba(255,255,255,0.02)]" : ""}`}>
                  <td className="text-[13px] text-[#d0d0d8] px-4 py-3">{formatDateTime(p.created_at as string)}</td>
                  <td className="text-[13px] text-[#d0d0d8] px-4 py-3">{formatCurrency(Number(p.amount))}</td>
                  <td className="text-[13px] text-[#d0d0d8] px-4 py-3">{p.type as string}</td>
                  <td className="px-4 py-3">{statusBadge(p.status as string)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Change Plan Modal */}
      <Modal open={changePlanOpen} onClose={() => setChangePlanOpen(false)} title="Сменить тариф">
        <div className="space-y-2">
          {plans.map((p) => (
            <button
              key={p.id as number}
              onClick={() => changePlan(p.id as number)}
              className="w-full flex items-center justify-between bg-[#181820] border border-[rgba(255,255,255,0.08)] rounded px-4 py-3 hover:border-[#4dc9d4] transition-colors"
            >
              <span className="text-[13px] text-[#e8e8ec]">{p.display_name as string}</span>
              <span className="text-[11px] text-[#909098]">
                {Number(p.price) === 0 ? "Бесплатно" : formatCurrency(Number(p.price))}
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Bonus Modal */}
      <Modal open={bonusOpen} onClose={() => setBonusOpen(false)} title="Начислить бонусные транскрипции">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] text-[#909098] uppercase tracking-wider mb-1.5">
              Количество
            </label>
            <input
              type="number"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(e.target.value)}
              min="1"
              className="w-full bg-[#181820] border border-[rgba(255,255,255,0.08)] rounded px-3 py-2.5 text-[13px] text-[#e8e8ec] focus:border-[#4dc9d4] focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={addBonus}
            className="w-full text-[11px] font-bold text-[#00bb7f] border border-[#00bb7f] py-2.5 rounded hover:bg-[rgba(0,187,127,0.15)] transition-colors"
          >
            Начислить {bonusAmount} транскрипций
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <Suspense fallback={<div className="text-[#909098] text-sm">Загрузка...</div>}>
      <UserDetailContent />
    </Suspense>
  );
}
