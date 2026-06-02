"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function cancel() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-kr text-sm text-ink/50 underline-offset-4 transition hover:text-accent hover:underline"
      >
        구독 해지
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={cancel}
        disabled={loading}
        className="rounded-xl border border-accent/40 px-3 py-1.5 font-kr text-sm font-medium text-accent transition hover:bg-accent-soft/50 disabled:opacity-60"
      >
        {loading ? "처리 중…" : "해지 확정"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-kr text-sm text-ink/50 transition hover:text-ink"
      >
        취소
      </button>
    </div>
  );
}
