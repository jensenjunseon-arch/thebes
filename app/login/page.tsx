"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { SSOButton } from "@/components/auth/SSOButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const oauthError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 맞지 않습니다."
          : authError.message,
      );
      setLoading(false);
      return;
    }

    // next is an internal redirect — safe to cast past typed routes.
    router.push(next as "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {oauthError && (
        <div className="rounded-xl border border-accent/40 bg-accent-soft/40 px-4 py-3 text-sm text-ink/80">
          로그인에 실패했어요. <span className="text-ink/60">{oauthError}</span>
        </div>
      )}
      <AuthInput
        label="이메일"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <AuthInput
        label="비밀번호"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        error={error || undefined}
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-xl bg-ink py-2.5 text-sm text-on-dark transition hover:bg-accent disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? "로그인 중…" : "로그인"}
      </button>

      <div className="relative my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/40">또는</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      <div className="space-y-2.5">
        <SSOButton provider="kakao" label="카카오로 로그인" next={next} />
        <SSOButton provider="google" label="Google로 로그인" next={next} />
      </div>
    </form>
  );
}

function SignupLink() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const href = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";
  return (
    <Link href={href as "/signup"} className="text-accent hover:underline">
      회원가입
    </Link>
  );
}

export default function LoginPage() {
  return (
    <AuthCard
      title="로그인"
      subtitle="Thebes AI 계정으로 로그인하세요."
      footer={
        <>
          계정이 없으신가요?{" "}
          <Suspense fallback={<Link href="/signup">회원가입</Link>}>
            <SignupLink />
          </Suspense>
        </>
      }
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-ink/5" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
