-- Thebes AI · fix · 2026-06-03
-- Definitive fix for "Database error saving new user" on Google/Kakao/email signup.
--
-- The legacy `users` mirror trigger (from the original parent/student model) was
-- the only custom side-effect on auth.users. NOTHING in the current product reads
-- the `users` table — every live feature (diagnostic_results, subscriptions,
-- billing_payments, feedback) keys directly on auth.users(id). So the trigger is
-- dead weight whose failure was blocking signups. Remove it entirely.
--
-- Idempotent: safe to run more than once.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_auth_user();
