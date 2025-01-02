import { supabase } from '../config/supabase';

// Players
export const getPlayers = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) {
      console.error('Error getting players:', error);
      throw error;
    }
    console.log('Players retrieved:', data);
    return data;
  } catch (err) {
    console.error('Error in getPlayers:', err);
    throw err;
  }
};

export const createPlayer = async (playerData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user for create:', user);
    console.log('Player data to insert:', { ...playerData, user_id: user.id });
    
    const { data, error } = await supabase
      .from('players')
      .insert([{ ...playerData, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating player:', error);
      throw error;
    }
    console.log('Player created:', data);
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
    console.log('Current user:', user);
    
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting competitions:', error);
      throw error;
    }
    console.log('Competitions retrieved:', data);
    return data;
  } catch (err) {
    console.error('Error in getCompetitions:', err);
    throw err;
  }
};

export const createCompetition = async (competitionData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user for create:', user);
    console.log('Competition data to insert:', { ...competitionData, user_id: user.id });
    
    const { data, error } = await supabase
      .from('competitions')
      .insert([{ ...competitionData, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating competition:', error);
      throw error;
    }
    console.log('Competition created:', data);
    return data;
  } catch (err) {
    console.error('Error in createCompetition:', err);
    throw err;
  }
};

export const updateCompetitionStatus = async (competitionId, status) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    console.log('Competition ID and status to update:', competitionId, status);
    
    const { data, error } = await supabase
      .from('competitions')
      .update({ status })
      .eq('id', competitionId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating competition status:', error);
      throw error;
    }
    console.log('Competition status updated:', data);
    return data;
  } catch (err) {
    console.error('Error in updateCompetitionStatus:', err);
    throw err;
  }
};

// Games
export const getGames = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        competition:competitions(*),
        team1_player1:players!team1_player1_id(*),
        team1_player2:players!team1_player2_id(*),
        team2_player1:players!team2_player1_id(*),
        team2_player2:players!team2_player2_id(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting games:', error);
      throw error;
    }
    console.log('Games retrieved:', data);
    return data;
  } catch (err) {
    console.error('Error in getGames:', err);
    throw err;
  }
};

export const createGame = async (gameData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user for create:', user);
    console.log('Game data to insert:', { ...gameData, user_id: user.id });
    
    const { data, error } = await supabase
      .from('games')
      .insert([{ ...gameData, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating game:', error);
      throw error;
    }
    console.log('Game created:', data);
    return data;
  } catch (err) {
    console.error('Error in createGame:', err);
    throw err;
  }
};

export const updateGameStatus = async (gameId, status) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    console.log('Game ID and status to update:', gameId, status);
    
    const { data, error } = await supabase
      .from('games')
      .update({ status })
      .eq('id', gameId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating game status:', error);
      throw error;
    }
    console.log('Game status updated:', data);
    return data;
  } catch (err) {
    console.error('Error in updateGameStatus:', err);
    throw err;
  }
};

// Matches
export const getMatches = async (gameId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    console.log('Game ID to retrieve matches:', gameId);
    
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', user.id)
      .order('created_at');
    
    if (error) {
      console.error('Error getting matches:', error);
      throw error;
    }
    console.log('Matches retrieved:', data);
    return data;
  } catch (err) {
    console.error('Error in getMatches:', err);
    throw err;
  }
};

export const createMatch = async (matchData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user for create:', user);
    console.log('Match data to insert:', { ...matchData, user_id: user.id });
    
    const { data, error } = await supabase
      .from('matches')
      .insert([{ ...matchData, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating match:', error);
      throw error;
    }
    console.log('Match created:', data);
    return data;
  } catch (err) {
    console.error('Error in createMatch:', err);
    throw err;
  }
};
