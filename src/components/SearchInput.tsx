import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Поиск..." }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808088]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#181820] border border-[rgba(255,255,255,0.08)] rounded pl-9 pr-3 py-2 text-[13px] text-[#e8e8ec] placeholder:text-[#808088] focus:border-[#4dc9d4] focus:outline-none transition-colors"
      />
    </div>
  );
}
