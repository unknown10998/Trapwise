-- Apply after 20260718_trapwise_platform.sql.
-- Browser clients may read their own private records but may not write score,
-- mastery, streak, achievement, or pattern fields. A future server-side RPC
-- must validate source answers and perform all authoritative updates.

drop policy if exists "profiles own" on public.profiles;
drop policy if exists "sessions own" on public.progress_sessions;
drop policy if exists "skills own" on public.skill_progress;
drop policy if exists "mistakes own" on public.mistake_patterns;
drop policy if exists "activity own" on public.daily_activity;

create policy "profiles own read" on public.profiles for select using (id = auth.uid());
create policy "sessions own read" on public.progress_sessions for select using (user_id = auth.uid());
create policy "skills own read" on public.skill_progress for select using (user_id = auth.uid());
create policy "mistakes own read" on public.mistake_patterns for select using (user_id = auth.uid());
create policy "activity own read" on public.daily_activity for select using (user_id = auth.uid());

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.progress_sessions from anon, authenticated;
revoke all on table public.skill_progress from anon, authenticated;
revoke all on table public.mistake_patterns from anon, authenticated;
revoke all on table public.user_achievements from anon, authenticated;
revoke all on table public.daily_activity from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.progress_sessions to authenticated;
grant select on table public.skill_progress to authenticated;
grant select on table public.mistake_patterns to authenticated;
grant select on table public.user_achievements to authenticated;
grant select on table public.daily_activity to authenticated;
