alter table public.forum_threads add column edited_at timestamptz;

create policy "Users can update their own threads"
  on public.forum_threads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
