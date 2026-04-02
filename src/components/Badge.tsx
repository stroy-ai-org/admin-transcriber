const variants = {
  success: "bg-[rgba(0,187,127,0.15)] text-[#00bb7f] border-[rgba(0,187,127,0.3)]",
  error: "bg-[rgba(255,107,107,0.15)] text-[#ff6b6b] border-[rgba(255,107,107,0.3)]",
  warning: "bg-[rgba(252,187,0,0.15)] text-[#fcbb00] border-[rgba(252,187,0,0.3)]",
  cyan: "bg-[rgba(77,201,212,0.15)] text-[#4dc9d4] border-[rgba(77,201,212,0.3)]",
  purple: "bg-[rgba(218,119,242,0.15)] text-[#da77f2] border-[rgba(218,119,242,0.3)]",
  dim: "bg-[rgba(255,255,255,0.05)] text-[#909098] border-[rgba(255,255,255,0.08)]",
} as const;

type Variant = keyof typeof variants;

export function Badge({ children, variant = "dim" }: { children: React.ReactNode; variant?: Variant }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-[3px] text-[10px] font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
}
