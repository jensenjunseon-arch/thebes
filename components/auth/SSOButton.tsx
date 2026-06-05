"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type Provider = "google" | "kakao";

const BRAND: Record<
  Provider,
  { name: string; label: string; className: string; logo: React.ReactNode }
> = {
  google: {
    name: "Google",
    label: "Google로 계속하기",
    className: "border border-ink/15 bg-paper text-ink hover:bg-paper-2",
    logo: (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  kakao: {
    name: "카카오",
    label: "카카오로 계속하기",
    className: "bg-[#FEE500] text-[#191600] hover:brightness-95",
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3C6.48 3 2 6.48 2 10.8c0 2.8 1.86 5.26 4.66 6.66-.2.74-.74 2.7-.84 3.12-.13.52.19.51.4.37.16-.11 2.6-1.77 3.66-2.49.68.1 1.39.15 2.12.15 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"
          fill="#191600"
        />
      </svg>
    ),
  },
};

export function SSOButton({
  provider,
  next,
  label,
}: {
  provider: Provider;
  next?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const brand = BRAND[provider];

  async function handleClick() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;
    // skipBrowserRedirect so a provider/config error surfaces here instead of a
    // silent no-op (the usual cause of "the button does nothing").
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (oauthError || !data?.url) {
      setError(
        oauthError?.message ??
          `${brand.name} 로그인을 시작할 수 없어요. (공급자 설정을 확인해 주세요)`,
      );
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-3 rounded-xl py-2.5 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60",
          brand.className,
        )}
      >
        {brand.logo}
        {loading ? "연결 중…" : label ?? brand.label}
      </button>
      {error && <p className="mt-2 text-[12px] leading-relaxed text-accent">{error}</p>}
    </div>
  );
}

// Backward-compatible wrapper.
export function GoogleSSOButton({ label, next }: { label?: string; next?: string }) {
  return <SSOButton provider="google" label={label} next={next} />;
}
