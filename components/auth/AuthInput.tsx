import { cn } from "@/lib/cn";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, className, ...props }: Props) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-tighter2 text-ink/60">
        {label}
      </label>
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 text-sm outline-none transition",
          "placeholder:text-ink/30 focus:border-accent",
          error && "border-red-400 focus:border-red-400",
          className,
        )}
      />
      {error && (
        <p className="mt-1.5 font-mono text-[10px] text-red-500">{error}</p>
      )}
    </div>
  );
}
