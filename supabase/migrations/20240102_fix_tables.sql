-- Recriar tabelas com estrutura correta
drop table if exists public.competition_players cascade;
drop table if exists public.games cascade;
drop table if exists public.competitions cascade;
drop table if exists public.players cascade;

create table public.players (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    name text not null,
    phone text,
    active boolean default true not null
);

create table public.competitions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    name text not null,
    description text,
    status text default 'pending' check (status in ('pending', 'in_progress', 'finished')),
    start_date timestamp with time zone default now()
);

create table public.competition_players (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    competition_id uuid references public.competitions not null,
    player_id uuid references public.players not null,
    user_id uuid references auth.users not null,
    unique(competition_id, player_id)
);

-- Criar tabela de jogos
create table if not exists public.games (
    id uuid default extensions.uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    competition_id uuid references public.competitions not null,
    team1_player1_id uuid references public.players not null,
    team1_player2_id uuid references public.players,
    team2_player1_id uuid references public.players not null,
    team2_player2_id uuid references public.players,
    status text check (status in ('pending', 'in_progress', 'finished', 'cancelled')) default 'pending' not null,
    winner_team integer check (winner_team in (1, 2)),
    team1_score integer default 0 not null check (team1_score >= 0),
    team2_score integer default 0 not null check (team2_score >= 0),
    matches jsonb[] default array[]::jsonb[],
    created_at timestamptz default now() not null
);

create index if not exists players_user_id_idx on public.players(user_id);
create index if not exists competitions_user_id_idx on public.competitions(user_id);
create index if not exists competition_players_competition_id_idx on public.competition_players(competition_id);
create index if not exists competition_players_player_id_idx on public.competition_players(player_id);
create index if not exists competition_players_user_id_idx on public.competition_players(user_id);
create index if not exists games_user_id_idx on public.games(user_id);
create index if not exists games_competition_id_idx on public.games(competition_id);

alter table public.players enable row level security;
alter table public.competitions enable row level security;
alter table public.competition_players enable row level security;
alter table public.games enable row level security;

-- Políticas para a tabela players
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

-- Políticas para a tabela competitions
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

-- Políticas para a tabela competition_players
create policy "Users can view their own competition players"
    on public.competition_players for select
    using (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can insert their own competition players"
    on public.competition_players for insert
    with check (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can delete their own competition players"
    on public.competition_players for delete
    using (auth.jwt() ->> 'sub' = user_id::text);

-- Políticas para a tabela games
create policy "Users can read their own games"
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
