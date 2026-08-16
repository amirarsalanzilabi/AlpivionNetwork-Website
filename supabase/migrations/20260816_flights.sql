create table public.flights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  route text not null,
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  date date not null,
  time text not null,
  aircraft text not null,
  participant_count int not null default 0,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.flights enable row level security;

create policy "Flights are viewable by everyone"
  on public.flights for select
  using (true);

create table public.flight_registrations (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (flight_id, user_id)
);

alter table public.flight_registrations enable row level security;

create policy "Users can view their own registrations"
  on public.flight_registrations for select
  using (auth.uid() = user_id);

create policy "Users can register themselves for a flight"
  on public.flight_registrations for insert
  with check (auth.uid() = user_id);

-- Keeps flights.participant_count in sync without exposing who registered
-- for what (flight_registrations itself stays readable only by its owner).
create function public.handle_new_registration()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.flights
  set participant_count = participant_count + 1
  where id = new.flight_id;
  return new;
end;
$$;

create trigger on_flight_registration_created
  after insert on public.flight_registrations
  for each row execute procedure public.handle_new_registration();

-- Sample flights so the calendar isn't empty out of the gate. Safe to edit
-- or delete via the Table Editor.
insert into public.flights (title, route, difficulty, date, time, aircraft, is_completed) values
  ('Transatlantic Crossing', 'KJFK → EGLL', 'Advanced', current_date + 6, '19:00 UTC', 'Boeing 777-300ER', false),
  ('Coastal Hopper', 'KLAX → KSFO', 'Beginner', current_date + 13, '01:00 UTC', 'Cessna 172', false),
  ('Alpine Approach', 'LSZH → LOWI', 'Intermediate', current_date + 20, '17:30 UTC', 'Airbus A320neo', false),
  ('Desert Sunrise', 'OMDB → OERK', 'Intermediate', current_date - 10, '05:00 UTC', 'Boeing 787-9', true);
