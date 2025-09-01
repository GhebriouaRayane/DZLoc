-- ====== TABLES ======

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  user_type text check (user_type in ('tenant','owner')) not null,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now()
);

create table if not exists public.properties (
  id bigserial primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  price integer not null,
  type text check (type in ('appartement','studio','maison')) not null,
  status text check (status in ('available','rented')) default 'available',
  surface integer,
  rooms integer,
  bedrooms integer,
  bathrooms integer,
  address text,
  city text,
  whatsapp text,
  description text,
  amenities text[] default '{}'::text[],
  images text[] default '{}'::text[],
  views integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  property_id bigint references public.properties(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, property_id)
);

create table if not exists public.visits (
  id bigserial primary key,
  property_id bigint references public.properties(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  time text not null,
  message text,
  status text check (status in ('pending','approved','declined')) default 'pending',
  owner_response text,
  created_at timestamp with time zone default now()
);

create table if not exists public.conversations (
  id bigserial primary key,
  property_id bigint references public.properties(id) on delete cascade not null,
  user1_id uuid references public.profiles(id) on delete cascade not null,
  user2_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.messages (
  id bigserial primary key,
  conversation_id bigint references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.reviews (
  id bigserial primary key,
  property_id bigint references public.properties(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stars int check (stars between 1 and 5) not null,
  comment text,
  created_at timestamp with time zone default now()
);

-- ====== RLS (enable) ======
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.favorites enable row level security;
alter table public.visits enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- ====== POLICIES ======

-- profiles
create policy "read profiles" on public.profiles
for select using (true);

create policy "update own profile" on public.profiles
for update using (auth.uid() = id);

-- properties
create policy "read properties" on public.properties
for select using (true);

create policy "owner manage properties" on public.properties
for all using (auth.uid() = owner_id);

-- favorites
create policy "user manage favorites" on public.favorites
for all using (auth.uid() = user_id);

-- visits
create policy "tenant create visit" on public.visits
for insert with check (auth.uid() = user_id);

create policy "tenant read own visits" on public.visits
for select using (auth.uid() = user_id);

create policy "owner read visits for properties" on public.visits
for select using (exists (
  select 1 from public.properties p where p.id = visits.property_id and p.owner_id = auth.uid()
));

create policy "owner update visits status" on public.visits
for update using (exists (
  select 1 from public.properties p where p.id = visits.property_id and p.owner_id = auth.uid()
));

-- conversations & messages
create policy "participants manage conversations" on public.conversations
for all using (auth.uid() = user1_id or auth.uid() = user2_id)
with check (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "participants manage messages" on public.messages
for all using (exists (
  select 1 from public.conversations c
  where c.id = messages.conversation_id and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
));

-- reviews
create policy "read reviews" on public.reviews for select using (true);
create policy "user create review" on public.reviews for insert with check (auth.uid() = user_id);

