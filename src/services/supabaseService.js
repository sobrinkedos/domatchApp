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
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching competitions:', error);
      throw new Error('Erro ao buscar competições');
    }

    return data;
  } catch (error) {
    console.error('Error in getCompetitions:', error);
    throw error;
  }
};

export const createCompetition = async (competitionData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const newCompetition = {
      ...competitionData,
      user_id: user.id,
      status: 'in_progress',
      created_at: new Date().toISOString()
    };
    
    console.log('Creating competition with data:', newCompetition);

    const { data, error } = await supabase
      .from('competitions')
      .insert([newCompetition])
      .select()
      .single();

    if (error) {
      console.error('Error creating competition:', error);
      throw new Error('Erro ao criar competição');
    }

    return data;
  } catch (error) {
    console.error('Error in createCompetition:', error);
    throw error;
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
        matches,
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
    // Primeiro, vamos buscar os jogos com os dados dos jogadores
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
    
    if (gamesError) {
      console.error('Erro ao buscar jogos:', gamesError);
      throw new Error('Não foi possível carregar os jogos da competição.');
    }

    // Verificações básicas
    if (games.length === 0) {
      throw new Error('Não existem jogos na competição');
    }

    const hasUnfinishedGames = games.some(game => game.status !== 'finished');
    if (hasUnfinishedGames) {
      throw new Error('Existem jogos não finalizados');
    }

    // Atualizar status da competição
    const { error: updateError } = await supabase
      .from('competitions')
      .update({
        status: 'finished'
      })
      .eq('id', competitionId);

    if (updateError) {
      console.error('Erro ao atualizar competição:', updateError);
      throw new Error('Não foi possível atualizar a competição. Por favor, tente novamente.');
    }

    // Calcular pontuações
    const playerScores = {};
    const teamScores = {};
    const playerRefs = {};
    
    // Processar jogos
    games.forEach(game => {
      // Guardar referências dos jogadores
      const players = {
        team1_player1: game.team1_player1,
        team1_player2: game.team1_player2,
        team2_player1: game.team2_player1,
        team2_player2: game.team2_player2
      };

      Object.values(players).forEach(player => {
        if (player?.id && player?.name) {
          playerRefs[player.id] = player;
        }
      });

      // Pontuação individual
      if (game.winner_team === 1) {
        if (game.team1_player1?.id) {
          playerScores[game.team1_player1.id] = (playerScores[game.team1_player1.id] || 0) + 1;
        }
        if (game.team1_player2?.id) {
          playerScores[game.team1_player2.id] = (playerScores[game.team1_player2.id] || 0) + 1;
        }
      } else if (game.winner_team === 2) {
        if (game.team2_player1?.id) {
          playerScores[game.team2_player1.id] = (playerScores[game.team2_player1.id] || 0) + 1;
        }
        if (game.team2_player2?.id) {
          playerScores[game.team2_player2.id] = (playerScores[game.team2_player2.id] || 0) + 1;
        }
      }

      // Pontuação de duplas
      if (game.winner_team === 1 || game.winner_team === 2) {
        const winningTeam = game.winner_team === 1 
          ? [game.team1_player1, game.team1_player2]
          : [game.team2_player1, game.team2_player2];

        // Verifica se ambos os jogadores da dupla existem
        if (winningTeam[0]?.id && winningTeam[1]?.id) {
          const teamKey = [winningTeam[0].id, winningTeam[1].id].sort().join('-');
          teamScores[teamKey] = (teamScores[teamKey] || 0) + 1;
        }
      }
    });

    // Encontrar vencedores
    const bestPlayerId = Object.entries(playerScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    // Encontrar melhor dupla
    const bestTeamEntry = Object.entries(teamScores)
      .sort(([,a], [,b]) => b - a)[0];

    const bestTeamKey = bestTeamEntry?.[0];
    const bestTeamScore = bestTeamEntry?.[1];

    const bestTeamPlayerIds = bestTeamKey ? bestTeamKey.split('-') : [];
    const bestTeamPlayers = bestTeamPlayerIds.map(id => playerRefs[id]).filter(Boolean);

    // Buscar a competição atualizada
    const { data: competition, error: fetchError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar competição atualizada:', fetchError);
      throw new Error('Não foi possível carregar os dados atualizados da competição.');
    }

    // Formatar resposta
    return {
      ...competition,
      champions: {
        best_player: bestPlayerId ? playerRefs[bestPlayerId] : null,
        best_team: bestTeamPlayers.length === 2 ? bestTeamPlayers : null,
        player_scores: playerScores,
        team_scores: teamScores
      }
    };
  } catch (err) {
    console.error('Error finishing competition:', err);
    // Tentar reverter o status se algo der errado
    try {
      await supabase
        .from('competitions')
        .update({ status: 'in_progress' })
        .eq('id', competitionId);
    } catch (revertError) {
      console.error('Erro ao reverter status:', revertError);
    }
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

export const getGameById = async (id) => {
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
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting game:', error);
    return null;
  }
};

/**
 * ATENÇÃO: NÃO MODIFICAR ESTA FUNÇÃO SEM AUTORIZAÇÃO!
 * Esta função é responsável por finalizar um jogo e calcular vitórias especiais (buchuda e buchuda de ré).
 * Última atualização: 04/01/2025
 * Autor: Codeium
 * 
 * @param {string} gameId - ID do jogo
 * @param {number} winnerTeam - Time vencedor (1 ou 2)
 * @param {number} team1Score - Pontuação do time 1
 * @param {number} team2Score - Pontuação do time 2
 * @param {Array} matches - Array com o histórico de partidas
 * @returns {Promise<Object>} Dados do jogo atualizado
 */
export const finishGame = async (gameId, winnerTeam, team1Score, team2Score, matches) => {
  try {
    // Verificar se é uma buchuda (time vencedor fez 6 pontos e o perdedor 0)
    const isBuchuda = (winnerTeam === 1 && team1Score === 6 && team2Score === 0) || 
                     (winnerTeam === 2 && team2Score === 6 && team1Score === 0);

    // Verificar se é uma buchuda de ré
    let isBuchudaDeRe = false;
    
    if (matches && matches.length > 0) {
      // Calcular pontuações acumuladas ao longo do jogo
      let team1Accumulated = 0;
      let team2Accumulated = 0;
      let hadFiveToZero = false;
      let losingTeam = null;
      
      for (const match of matches) {
        // Atualizar pontuações
        if (match.winningTeam === 1) {
          team1Accumulated += match.points;
        } else if (match.winningTeam === 2) {
          team2Accumulated += match.points;
        }
        
        // Verificar se em algum momento houve 5x0
        if (team1Accumulated === 0 && team2Accumulated === 5) {
          hadFiveToZero = true;
          losingTeam = 1;
        } else if (team2Accumulated === 0 && team1Accumulated === 5) {
          hadFiveToZero = true;
          losingTeam = 2;
        }
      }

      // É buchuda de ré se o time que estava perdendo de 5x0 ganhou o jogo
      if (hadFiveToZero && losingTeam === winnerTeam) {
        isBuchudaDeRe = true;
      }
    }

    const { data, error } = await supabase
      .from('games')
      .update({
        status: 'finished',
        winner_team: winnerTeam,
        team1_score: team1Score,
        team2_score: team2Score,
        is_buchuda: isBuchuda,
        is_buchuda_de_re: isBuchudaDeRe,
        matches,
        finished_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select(`
        *,
        matches,
        team1_player1:team1_player1_id(id, name),
        team1_player2:team1_player2_id(id, name),
        team2_player1:team2_player1_id(id, name),
        team2_player2:team2_player2_id(id, name)
      `)
      .single();

    if (error) {
      console.error('Error finishing game:', error);
      throw new Error('Erro ao finalizar jogo');
    }

    return data;
  } catch (error) {
    console.error('Error in finishGame:', error);
    throw error;
  }
};

export const getSpecialVictoriesStats = async (competitionId) => {
  try {
    const { data: specialVictories, error } = await supabase
      .from('games')
      .select(`
        *,
        team1_player1:team1_player1_id(id, name),
        team1_player2:team1_player2_id(id, name),
        team2_player1:team2_player1_id(id, name),
        team2_player2:team2_player2_id(id, name)
      `)
      .eq('competition_id', competitionId)
      .eq('status', 'finished')
      .or('team1_score.eq.6,team2_score.eq.6');

    if (error) {
      console.error('Error fetching special victories:', error);
      throw new Error('Erro ao buscar vitórias especiais');
    }

    // Processar vitórias especiais
    const buchudas = specialVictories.filter(game => 
      (game.team1_score === 6 && game.team2_score === 0) || 
      (game.team2_score === 6 && game.team1_score === 0)
    );

    const buchudasDeRe = specialVictories.filter(game => {
      const winnerScore = Math.max(game.team1_score, game.team2_score);
      const loserScore = Math.min(game.team1_score, game.team2_score);
      return winnerScore === 6 && loserScore === 5;
    });

    return {
      buchudas: buchudas.map(game => ({
        ...game,
        is_buchuda: true,
        is_buchuda_de_re: false
      })),
      buchudasDeRe: buchudasDeRe.map(game => ({
        ...game,
        is_buchuda: false,
        is_buchuda_de_re: true
      }))
    };
  } catch (error) {
    console.error('Error in getSpecialVictoriesStats:', error);
    throw error;
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
