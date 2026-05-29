"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

interface Props {
  label?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export function StartSessionButton({
  label = "세션 시작하기",
  variant = "primary",
  className,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      if (res.status === 401) {
        // Not logged in — send to signup with the session destination preserved.
        router.push("/signup");
        return;
      }
      if (!res.ok) throw new Error("session create failed");
      const { sessionId } = (await res.json()) as { sessionId: string };
      router.push(`/session/${sessionId}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "rounded-full px-6 py-3 transition disabled:cursor-wait disabled:opacity-60",
        variant === "primary"
          ? "bg-accent text-on-dark hover:bg-ink"
          : "border border-ink/20 bg-paper-2 hover:bg-accent-soft",
        className,
      )}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          잠깐만요…
        </span>
      ) : (
        label
      )}
    </button>
  );
}
