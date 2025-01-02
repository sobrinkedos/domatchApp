-- Drop a tabela players se ela existir
drop table if exists public.players cascade;

-- Criar a tabela players do zero
create table public.players (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    name text not null,
    phone text,
    active boolean default true not null
);

-- Criar índice
create index players_user_id_idx on public.players(user_id);

-- Habilitar RLS
alter table public.players enable row level security;

-- Criar políticas
create policy "Users can view their own players"
    on public.players for select
    using (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can insert their own players"
    on public.players for insert
    with check (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can update their own players"
    on public.players for update
    using (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can delete their own players"
    on public.players for delete
    using (auth.jwt() ->> 'sub' = user_id::text);
