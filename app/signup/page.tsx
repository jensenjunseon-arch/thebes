"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { cn } from "@/lib/cn";
import { GoogleSSOButton } from "@/components/auth/SSOButton";

type Role = "student" | "parent";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
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
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, name },
        emailRedirectTo: `${location.origin}/auth/callback?next=/report`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
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
    <AuthCard
      title="회원가입"
      subtitle="AI 시대의 사고력 트레이닝을 시작합니다."
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-accent hover:underline">
            로그인
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selector */}
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-tighter2 text-ink/60">
            나는
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "student", label: "학생입니다" },
                { value: "parent", label: "학부모입니다" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={cn(
                  "rounded-xl border py-2.5 text-sm transition",
                  role === value
                    ? "border-accent bg-accent text-on-dark"
                    : "border-ink/15 bg-paper text-ink hover:border-accent/60",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <AuthInput
          label="이름"
          type="text"
          placeholder={role === "student" ? "홍길동" : "홍길동 부모"}
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

        <GoogleSSOButton label="Google로 가입하기" next="/report" />
      </form>
    </AuthCard>
  );
}
