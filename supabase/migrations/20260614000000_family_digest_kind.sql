-- Family digest — the multicultural-family bridge. After a study session, the
-- student can generate a warm one-page digest of what they learned, written in
-- the PARENT'S home language (Vietnamese, Chinese, Japanese, Tagalog, Khmer,
-- Korean, English) with read-aloud. It is stored as one more kind of shared
-- artifact and served at /family/<slug>.
--
-- SECURITY: identical posture to the other artifacts — fully RLS-locked, written
-- only by the service-role /api/studio/share route, read only by the
-- /family/[slug] server component, rendered ONLY inside a sandboxed iframe.

alter table public.shared_artifacts
  drop constraint if exists shared_artifacts_kind_check;

alter table public.shared_artifacts
  add constraint shared_artifacts_kind_check
  check (kind in ('game', 'video', 'quiz', 'family'));
