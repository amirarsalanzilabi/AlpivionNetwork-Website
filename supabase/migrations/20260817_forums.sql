create table public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 150),
  body text not null check (char_length(body) between 1 and 5000),
  reply_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.forum_threads enable row level security;

create policy "Threads are viewable by everyone"
  on public.forum_threads for select
  using (true);

-- Enforces both the 5-per-day cap and the 5-minute cooldown server-side,
-- so it can't be bypassed by manipulating the client.
create policy "Signed-in users can create threads within limits"
  on public.forum_threads for insert
  with check (
    auth.uid() = user_id
    and (
      select count(*) from public.forum_threads t
      where t.user_id = auth.uid() and t.created_at > now() - interval '24 hours'
    ) < 5
    and not exists (
      select 1 from public.forum_threads t
      where t.user_id = auth.uid() and t.created_at > now() - interval '5 minutes'
    )
  );

create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

alter table public.forum_replies enable row level security;

create policy "Replies are viewable by everyone"
  on public.forum_replies for select
  using (true);

create policy "Signed-in users can reply"
  on public.forum_replies for insert
  with check (auth.uid() = user_id);

create function public.handle_new_reply()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.forum_threads
  set reply_count = reply_count + 1
  where id = new.thread_id;
  return new;
end;
$$;

create trigger on_forum_reply_created
  after insert on public.forum_replies
  for each row execute procedure public.handle_new_reply();
