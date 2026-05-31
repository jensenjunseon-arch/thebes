import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-4 text-ink">
      <Link
        href="/"
        className="mb-8 font-mono text-base font-medium tracking-tight text-ink/80 transition hover:text-ink"
      >
        Thebes
        <span className="ml-1 font-semibold tracking-[0.02em] text-accent">AI</span>
      </Link>

      <div className="w-full max-w-sm rounded-3xl border border-ink/10 bg-paper-2 px-8 py-9">
        <h1 className="font-kr text-2xl font-semibold tracking-tighter2">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-ink/60">{subtitle}</p>
        )}
        <div className="mt-7">{children}</div>
      </div>

      {footer && (
        <p className="mt-5 text-center text-sm text-ink/55">{footer}</p>
      )}
    </main>
  );
}
