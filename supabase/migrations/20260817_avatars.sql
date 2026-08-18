alter table public.profiles add column avatar_url text;

-- Public bucket restricted to real photo formats (no GIF, no video) and a
-- 5MB cap, enforced by Storage itself rather than trusting the client.
insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values ('avatars', 'avatars', true, array['image/jpeg', 'image/png', 'image/webp'], 5242880);

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can replace their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
