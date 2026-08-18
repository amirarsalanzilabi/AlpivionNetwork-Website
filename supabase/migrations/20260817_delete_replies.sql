create policy "Users can delete their own replies"
  on public.forum_replies for delete
  using (auth.uid() = user_id);

create function public.handle_deleted_reply()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.forum_threads
  set reply_count = greatest(reply_count - 1, 0)
  where id = old.thread_id;
  return old;
end;
$$;

create trigger on_forum_reply_deleted
  after delete on public.forum_replies
  for each row execute procedure public.handle_deleted_reply();
