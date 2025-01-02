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
    
    const { data, error } = await supabase
      .from('competitions')
      .insert([{ ...competitionData, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('games')
      .insert([gameData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating game:', error);
    return null;
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

export const updateGameStatus = async (gameId, status, winner_team = null, team1_score = null, team2_score = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const updates = { status };
    if (winner_team !== null) updates.winner_team = winner_team;
    if (team1_score !== null) updates.team1_score = team1_score;
    if (team2_score !== null) updates.team2_score = team2_score;
    
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', gameId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in updateGameStatus:', err);
    throw err;
  }
};
