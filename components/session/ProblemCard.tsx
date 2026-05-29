interface Props {
  englishStatement: string;
  koreanSupport?: string;
  topic: string;
  difficulty: string;
}

// The problem panel sits next to the chat. English is primary; Korean is a
// small support line and can be hidden once the student's diagnosed level
// passes a threshold (logic for that lives in the diagnostic module).
export function ProblemCard({
  englishStatement,
  koreanSupport,
  topic,
  difficulty,
}: Props) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-paper p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-tighter2 text-ink/50">
          Problem · {topic}
        </span>
        <span className="rounded-full bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-tighter2 text-accent">
          {difficulty}
        </span>
      </div>

      <p className="mt-4 text-lg leading-relaxed">{englishStatement}</p>

      {koreanSupport && (
        <p className="mt-3 border-t border-ink/10 pt-3 text-sm text-ink/55">
          {koreanSupport}
        </p>
      )}
    </div>
  );
}
