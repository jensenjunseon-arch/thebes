-- Thebes AI · fix · 2026-06-03
-- "Database error saving new user" on Google/Kakao login.
--
-- The new-user mirror trigger inserted into `users` assuming the email-signup
-- metadata shape ({role, name}). OAuth profiles don't have `role` and put the
-- name under `name`/`full_name`, so the insert could fail — and because it runs
-- inside the auth.users insert, ANY failure rolled back the whole signup.
--
-- This hardens it: explicit search_path, metadata fallbacks, idempotent insert,
-- and an exception guard so a mirror-row problem can never block auth signup.
-- Idempotent: safe to run more than once.

create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into users (auth_id, role, email, name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'role', '')::user_role, 'student'),
    coalesce(new.email, new.raw_user_meta_data->>'email', ''),
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (auth_id) do nothing;

  return new;
exception
  when others then
    -- Never abort the auth signup because of the mirror insert.
    raise warning 'handle_new_auth_user failed for %: %', new.id, sqlerrm;
    return new;
end;
$$;
