import { supabase } from '../config/supabase';

// Players
export const getPlayers = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('name');
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in getPlayers:', err);
    throw err;
  }
};

export const createPlayer = async (playerData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('players')
      .insert([{ ...playerData, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in createPlayer:', err);
    throw err;
  }
};

// Competitions
export const getCompetitions = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in getCompetitions:', err);
    throw err;
  }
};

export const createCompetition = async (competitionData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const newCompetition = {
      name: competitionData.name,
      description: competitionData.description,
      start_date: competitionData.start_date,
      user_id: user.id,
      status: 'pending'
    };
    
    console.log('Creating competition with data:', newCompetition);
    
    const { data, error } = await supabase
      .from('competitions')
      .insert([newCompetition])
      .select()
      .single();
    
    if (error) throw error;
    console.log('Created competition:', data);
    return data;
  } catch (err) {
    console.error('Error in createCompetition:', err);
    throw err;
  }
};

export const updateCompetition = async (competitionId, competitionData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('competitions')
      .update(competitionData)
      .eq('id', competitionId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in updateCompetition:', err);
    throw err;
  }
};

export const deleteCompetition = async (competitionId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('competitions')
      .delete()
      .eq('id', competitionId)
      .eq('user_id', user.id);
    
    if (error) throw error;
  } catch (err) {
    console.error('Error in deleteCompetition:', err);
    throw err;
  }
};

export const getCompetitionById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    console.log('Fetched competition by ID:', data);
    return data;
  } catch (error) {
    console.error('Error fetching competition:', error);
    return null;
  }
};

export const getGamesByCompetitionId = async (competitionId) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        team1_player1:team1_player1_id(id, name),
        team1_player2:team1_player2_id(id, name),
        team2_player1:team2_player1_id(id, name),
        team2_player2:team2_player2_id(id, name)
      `)
      .eq('competition_id', competitionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
};

export const getPlayersByCompetitionId = async (competitionId) => {
  try {
    const { data: existingPlayers, error: existingError } = await supabase
      .from('competition_players')
      .select('player_id')
      .eq('competition_id', competitionId);

    if (existingError) throw existingError;

    const playerIds = existingPlayers.map(p => p.player_id);
    
    if (playerIds.length === 0) return [];

    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .in('id', playerIds);

    if (playersError) throw playersError;

    return players;
  } catch (error) {
    console.error('Error getting players by competition:', error);
    throw error;
  }
};

export const getExistingPlayersInCompetition = async (competitionId) => {
  try {
    const { data, error } = await supabase
      .from('competition_players')
      .select('player_id')
      .eq('competition_id', competitionId);

    if (error) throw error;
    return data.map(p => p.player_id);
  } catch (error) {
    console.error('Error getting existing players:', error);
    throw error;
  }
};

export const addPlayerToCompetition = async (competitionId, playerId) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { error } = await supabase
      .from('competition_players')
      .insert([
        {
          competition_id: competitionId,
          player_id: playerId,
          user_id: userData.user.id
        }
      ])
      .select();

    if (error) {
      // Ignora erro de duplicação
      if (error.code === '23505') return;
      throw error;
    }
  } catch (error) {
    console.error('Error adding player to competition:', error);
    throw error;
  }
};

export const updateCompetitionStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('competitions')
      .update({ status })
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating competition status:', error);
    return null;
  }
};

export const createGame = async (gameData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const newGame = {
      ...gameData,
      user_id: user.id
    };
    
    console.log('Creating game with data:', newGame);
    
    const { data, error } = await supabase
      .from('games')
      .insert([newGame])
      .select()
      .single();

    if (error) throw error;
    console.log('Created game:', data);
    return data;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

export const updateGame = async (id, gameData) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .update(gameData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating game:', error);
    return null;
  }
};

export const removePlayerFromCompetition = async (competitionId, playerId) => {
  try {
    const { error } = await supabase
      .from('competition_players')
      .delete()
      .eq('competition_id', competitionId)
      .eq('player_id', playerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing player from competition:', error);
    return false;
  }
};

export const startCompetition = async (competitionId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('competitions')
      .update({ 
        status: 'in_progress',
        start_date: new Date().toISOString()
      })
      .eq('id', competitionId)
      .eq('user_id', user.id) // Garantir que apenas o dono pode iniciar
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error starting competition:', error);
    throw error;
  }
};

export const finishCompetition = async (competitionId) => {
  try {
    // Buscar todos os jogos da competição com dados dos jogadores
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select(`
        *,
        team1_player1:team1_player1_id(id, name),
        team1_player2:team1_player2_id(id, name),
        team2_player1:team2_player1_id(id, name),
        team2_player2:team2_player2_id(id, name)
      `)
      .eq('competition_id', competitionId);
    
    if (gamesError) throw gamesError;

    // Verificar se todos os jogos estão finalizados
    const hasUnfinishedGames = games.some(game => game.status !== 'finished');
    if (hasUnfinishedGames) {
      throw new Error('Existem jogos não finalizados');
    }

    // Verificar se existe pelo menos um jogo
    if (games.length === 0) {
      throw new Error('Não existem jogos na competição');
    }

    // Calcular pontuação por jogador e manter referência do jogador
    const playerScores = {};
    const playerRefs = {};
    
    games.forEach(game => {
      // Registrar referências dos jogadores
      if (game.team1_player1) playerRefs[game.team1_player1.id] = game.team1_player1;
      if (game.team1_player2) playerRefs[game.team1_player2.id] = game.team1_player2;
      if (game.team2_player1) playerRefs[game.team2_player1.id] = game.team2_player1;
      if (game.team2_player2) playerRefs[game.team2_player2.id] = game.team2_player2;

      // Adicionar pontos para o time vencedor
      if (game.winner_team === 1) {
        if (game.team1_player1) {
          playerScores[game.team1_player1.id] = (playerScores[game.team1_player1.id] || 0) + 1;
        }
        if (game.team1_player2) {
          playerScores[game.team1_player2.id] = (playerScores[game.team1_player2.id] || 0) + 1;
        }
      } else if (game.winner_team === 2) {
        if (game.team2_player1) {
          playerScores[game.team2_player1.id] = (playerScores[game.team2_player1.id] || 0) + 1;
        }
        if (game.team2_player2) {
          playerScores[game.team2_player2.id] = (playerScores[game.team2_player2.id] || 0) + 1;
        }
      }
    });

    // Encontrar jogador com mais vitórias
    const bestPlayerId = Object.entries(playerScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    // Calcular pontuação por dupla
    const teamScores = {};
    const teamRefs = {};
    
    games.forEach(game => {
      if (game.team1_player2 && game.team2_player2) { // Apenas jogos de duplas
        const team1 = [game.team1_player1, game.team1_player2].sort((a, b) => a.id.localeCompare(b.id));
        const team2 = [game.team2_player1, game.team2_player2].sort((a, b) => a.id.localeCompare(b.id));
        
        const team1Key = team1.map(p => p.id).join('-');
        const team2Key = team2.map(p => p.id).join('-');
        
        // Guardar referência das duplas
        teamRefs[team1Key] = team1;
        teamRefs[team2Key] = team2;
        
        if (game.winner_team === 1) {
          teamScores[team1Key] = (teamScores[team1Key] || 0) + 1;
        } else if (game.winner_team === 2) {
          teamScores[team2Key] = (teamScores[team2Key] || 0) + 1;
        }
      }
    });

    // Encontrar dupla com mais vitórias
    const bestTeamKey = Object.entries(teamScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    // Atualizar competição com os vencedores
    const { data: updatedCompetition, error: updateError } = await supabase
      .from('competitions')
      .update({
        status: 'finished',
        best_player_id: bestPlayerId || null,
        best_team_player1_id: bestTeamKey ? teamRefs[bestTeamKey][0].id : null,
        best_team_player2_id: bestTeamKey ? teamRefs[bestTeamKey][1].id : null,
        player_scores: playerScores,
        team_scores: teamScores,
        finished_at: new Date().toISOString()
      })
      .eq('id', competitionId)
      .select(`
        *,
        best_player:best_player_id(id, name),
        best_team_player1:best_team_player1_id(id, name),
        best_team_player2:best_team_player2_id(id, name)
      `)
      .single();

    if (updateError) throw updateError;
    
    // Formatar os dados para o modal
    return {
      ...updatedCompetition,
      champions: {
        best_player: updatedCompetition.best_player,
        best_team: bestTeamKey ? [
          updatedCompetition.best_team_player1,
          updatedCompetition.best_team_player2
        ] : null,
        player_scores: playerScores,
        team_scores: teamScores
      }
    };
  } catch (err) {
    console.error('Error finishing competition:', err);
    throw err;
  }
};

// Games
export const getGames = async (competitionId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        team1_player1:team1_player1_id(id, name),
        team1_player2:team1_player2_id(id, name),
        team2_player1:team2_player1_id(id, name),
        team2_player2:team2_player2_id(id, name)
      `)
      .eq('user_id', user.id)
      .eq('competition_id', competitionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in getGames:', err);
    throw err;
  }
};

export async function updateGameStatus(gameId, status, winnerTeam, team1Score, team2Score, matches) {
  try {
    const { data, error } = await supabase
      .from('games')
      .update({
        status,
        winner_team: winnerTeam,
        team1_score: team1Score,
        team2_score: team2Score,
        matches
      })
      .eq('id', gameId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar status do jogo:', error);
    throw error;
  }
}

export const getGameById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting game:', error);
    return null;
  }
};

export const getPlayerById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting player:', error);
    return null;
  }
};
