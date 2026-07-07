"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { SSOButton } from "@/components/auth/SSOButton";
import { EIGENLYRIC } from "@/lib/brand";

function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is off for this project, signUp() already
    // returns an active session — go straight to `next` instead of showing
    // a "check your email" screen the user can never act on.
    if (data.session) {
      router.push(next as "/");
      router.refresh();
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <AuthCard title="이메일을 확인해주세요">
        <p className="text-sm text-ink/70">
          <strong>{email}</strong> 로 확인 링크를 보냈습니다. 메일함을 확인하고
          링크를 클릭하면 가입이 완료됩니다.
        </p>
        <p className="mt-3 text-sm text-ink/50">
          메일이 오지 않으면 스팸함을 확인해 주세요.
        </p>
      </AuthCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        label="이름"
        type="text"
        placeholder="홍길동"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
      />
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
        label="비밀번호 (8자 이상)"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
        error={error || undefined}
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-xl bg-ink py-2.5 text-sm text-on-dark transition hover:bg-accent disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? "가입 중…" : "가입하기"}
      </button>

      <div className="relative my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="font-mono text-[11px] uppercase tracking-tighter2 text-ink/40">또는</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      <div className="space-y-2.5">
        {/* Kakao hidden until the provider is actually configured in Supabase
            (Kakao Developers app + keys) — a dead button is worse than none. */}
        <SSOButton provider="google" label="Google로 가입하기" next={next} />
      </div>
    </form>
  );
}

function SignupLoginLink() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const href = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  return (
    <Link href={href as "/login"} className="text-accent hover:underline">
      로그인
    </Link>
  );
}

export default function SignupPage() {
  return (
    <AuthCard
      brand={EIGENLYRIC}
      title="회원가입"
      subtitle="차트 속 가사로 영어와 한국어를 배웁니다."
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Suspense fallback={<Link href="/login">로그인</Link>}>
            <SignupLoginLink />
          </Suspense>
        </>
      }
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-ink/5" />}>
        <SignupFormWithNext />
      </Suspense>
    </AuthCard>
  );
}

function SignupFormWithNext() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  return <SignupForm next={next} />;
}
