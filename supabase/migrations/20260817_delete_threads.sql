create policy "Users can delete their own threads"
  on public.forum_threads for delete
  using (auth.uid() = user_id);
