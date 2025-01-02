-- Criar a tabela competition_players para relação muitos-para-muitos
create table public.competition_players (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    competition_id uuid references public.competitions not null,
    player_id uuid references public.players not null,
    user_id uuid references auth.users not null,
    unique(competition_id, player_id)
);

-- Criar índices
create index competition_players_competition_id_idx on public.competition_players(competition_id);
create index competition_players_player_id_idx on public.competition_players(player_id);
create index competition_players_user_id_idx on public.competition_players(user_id);

-- Habilitar RLS
alter table public.competition_players enable row level security;

-- Criar políticas para competition_players
create policy "Users can view their own competition players"
    on public.competition_players for select
    using (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can insert their own competition players"
    on public.competition_players for insert
    with check (auth.jwt() ->> 'sub' = user_id::text);

create policy "Users can delete their own competition players"
    on public.competition_players for delete
    using (auth.jwt() ->> 'sub' = user_id::text);
