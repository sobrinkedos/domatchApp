-- Drop as tabelas se existirem
drop table if exists public.games cascade;
drop table if exists public.competitions cascade;
drop table if exists public.players cascade;

-- Criar a tabela players
create table public.players (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    name text not null,
    phone text,
    active boolean default true not null
);

-- Criar a tabela competitions
create table public.competitions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    name text not null,
    description text,
    status text check (status in ('active', 'finished', 'cancelled', null)),
    start_date timestamp with time zone default now()
);

-- Criar a tabela games
create table public.games (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    competition_id uuid references public.competitions not null,
    team1_player1_id uuid references public.players not null,
    team1_player2_id uuid references public.players,
    team2_player1_id uuid references public.players not null,
    team2_player2_id uuid references public.players,
    status text check (status in ('pending', 'in_progress', 'finished', 'cancelled')) default 'pending' not null,
    winner_team integer check (winner_team in (1, 2)),
    team1_score integer default 0 not null check (team1_score >= 0),
    team2_score integer default 0 not null check (team2_score >= 0)
);

-- Criar índices
create index players_user_id_idx on public.players(user_id);
create index competitions_user_id_idx on public.competitions(user_id);
create index games_user_id_idx on public.games(user_id);
create index games_competition_id_idx on public.games(competition_id);

-- Habilitar RLS
alter table public.players enable row level security;
alter table public.competitions enable row level security;
alter table public.games enable row level security;

-- Criar políticas para players
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

-- Criar políticas para competitions
create policy "Users can view their own competitions"
    on public.competitions for select
    using (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can insert their own competitions"
    on public.competitions for insert
    with check (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can update their own competitions"
    on public.competitions for update
    using (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can delete their own competitions"
    on public.competitions for delete
    using (auth.jwt() ->> 'sub' = user_id::text);

-- Criar políticas para games
create policy "Users can view their own games"
    on public.games for select
    using (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can insert their own games"
    on public.games for insert
    with check (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can update their own games"
    on public.games for update
    using (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can delete their own games"
    on public.games for delete
    using (auth.jwt() ->> 'sub' = user_id::text);
