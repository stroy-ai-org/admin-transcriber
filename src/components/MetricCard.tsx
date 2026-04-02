"use client";

import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <motion.div
      className="bg-[#141419] border border-[rgba(255,255,255,0.08)] rounded-md p-5"
      whileHover={{ y: -4, borderColor: "rgba(77,201,212,0.3)", boxShadow: "0 0 20px rgba(77,201,212,0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-[11px] text-[#909098] uppercase tracking-wider mb-2">{label}</div>
      <div className="text-[36px] font-bold text-[#e8e8ec] leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-[#808088] mt-1">{sub}</div>}
    </motion.div>
  );
}
