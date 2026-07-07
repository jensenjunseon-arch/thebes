"use client";

// Lyrikko onboarding — the one gate between "logged in" and "can save words".
// Collects the legal minimum: nickname, birth date (만 14세 gate), and the two
// required consents. Under-14 input is blocked HERE, client-side, so the birth
// date of a refused signup never even leaves the browser; the server and the
// DB CHECK re-enforce the same rule for anyone bypassing the UI.

import { useMemo, useState } from "react";
import { isAtLeast14 } from "@/lib/lyrikko/leitner";

export function OnboardingModal({
  onDone,
  onClose,
}: {
  /** Called after the profile is created — caller retries its pending save. */
  onDone: () => void;
  onClose: () => void;
}) {
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const tooYoung = useMemo(
    () => birthDate.length === 10 && !isAtLeast14(birthDate),
    [birthDate],
  );
  const ready =
    nickname.trim().length > 0 &&
    birthDate.length === 10 &&
    !tooYoung &&
    agreeTerms &&
    agreePrivacy;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/lyrikko/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), birthDate, agreeTerms, agreePrivacy }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "failed");
      }
      onDone();
    } catch (err) {
      setError(
        err instanceof Error && err.message === "under_14"
          ? "만 14세부터 이용할 수 있어요."
          : "잠깐 문제가 생겼어요. 다시 시도해 주세요.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-sm rounded-3xl bg-paper p-6 shadow-2xl">
        <h2 className="font-kr text-lg font-semibold text-ink">단어장 만들기</h2>
        <p className="mt-1 font-kr text-sm text-ink/55">
          내 단어장을 만들려면 아래 정보가 필요해요.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block">
            <span className="font-kr text-xs text-ink/60">닉네임</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="단어장에 표시될 이름"
              className="mt-1 w-full rounded-xl border border-ink/12 bg-paper px-3.5 py-2.5 font-kr text-sm text-ink outline-none focus:border-accent/50"
            />
          </label>

          <label className="block">
            <span className="font-kr text-xs text-ink/60">생년월일</span>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/12 bg-paper px-3.5 py-2.5 font-kr text-sm text-ink outline-none focus:border-accent/50"
            />
            {tooYoung ? (
              <p className="mt-1.5 font-kr text-xs text-ink/60">
                Lyrikko는 <strong>만 14세부터</strong> 가입할 수 있어요. 조금만 기다려 주세요!
              </p>
            ) : (
              <p className="mt-1.5 font-kr text-[11px] text-ink/40">
                만 14세 이상인지 확인하는 데만 사용해요.
              </p>
            )}
          </label>

          <div className="space-y-2 rounded-2xl bg-paper-2 p-3.5">
            <label className="flex items-start gap-2.5">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 accent-[#0B57D0]"
              />
              <span className="font-kr text-xs leading-relaxed text-ink/75">
                (필수) 서비스 이용약관에 동의합니다.
              </span>
            </label>
            <label className="flex items-start gap-2.5">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="mt-0.5 accent-[#0B57D0]"
              />
              <span className="font-kr text-xs leading-relaxed text-ink/75">
                (필수) 개인정보 수집·이용에 동의합니다 — 항목: 이메일·닉네임·생년월일·저장한
                단어 / 목적: 단어장 서비스 제공 / 보유: 탈퇴 시 파기.
              </span>
            </label>
          </div>

          {error && <p className="font-kr text-xs text-ink/70">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink/12 py-2.5 font-kr text-sm text-ink/70 transition hover:bg-paper-2"
            >
              다음에
            </button>
            <button
              type="submit"
              disabled={!ready || busy}
              className="flex-1 rounded-xl bg-accent py-2.5 font-kr text-sm font-medium text-on-dark transition hover:bg-accent/90 disabled:opacity-40"
            >
              {busy ? "만드는 중…" : "시작하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
