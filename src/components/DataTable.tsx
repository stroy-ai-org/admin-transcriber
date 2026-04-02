"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  columns, data, page, pageSize, total, onPageChange, onRowClick, loading,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-[#141419] border border-[rgba(255,255,255,0.08)] rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)]">
              {columns.map((col) => (
                <th key={col.key} className="text-left text-[11px] text-[#909098] uppercase tracking-wider px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} className="text-center text-[13px] text-[#909098] py-12">Загрузка...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center text-[13px] text-[#909098] py-12">Нет данных</td></tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(77,201,212,0.05)] transition-colors ${i % 2 === 0 ? "bg-[rgba(255,255,255,0.02)]" : ""} ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="text-[13px] text-[#d0d0d8] px-4 py-3">
                      {col.render ? col.render(row) : (row[col.key] as React.ReactNode) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(255,255,255,0.08)]">
          <div className="text-[11px] text-[#808088]">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} из {total}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="w-7 h-7 flex items-center justify-center rounded text-[#909098] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-[#909098] px-2">{page}/{totalPages}</span>
            <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="w-7 h-7 flex items-center justify-center rounded text-[#909098] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
