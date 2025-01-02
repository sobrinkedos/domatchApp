import React, { useState, useEffect } from 'react';
import { getPlayers, createPlayer } from '../services/supabaseService';
import PlayerModal from '../components/PlayerModal';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function Players() {
  const [players, setPlayers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const loadedPlayers = await getPlayers();
      setPlayers(loadedPlayers);
    } catch (err) {
      console.error('Erro ao carregar jogadores:', err);
      setError('Erro ao carregar os dados dos jogadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleAddPlayer = async (playerData) => {
    try {
      const newPlayer = await createPlayer(playerData);
      setPlayers([...players, newPlayer]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao adicionar jogador:', err);
      setError('Erro ao adicionar jogador');
    }
  };

  const handleEditPlayer = (playerData) => {
    setPlayers(players.map(p => 
      p.id === selectedPlayer.id ? { ...p, ...playerData } : p
    ));
  };

  const handleDeletePlayer = (playerId) => {
    // Verifica se existem jogos salvos
    const savedGames = localStorage.getItem('games');
    const games = savedGames ? JSON.parse(savedGames) : [];
    
    // Verifica se o jogador participou de algum jogo
    const hasGames = games.some(game => 
      (game.team1 && game.team1.includes(playerId)) || 
      (game.team2 && game.team2.includes(playerId))
    );

    if (hasGames) {
      if (window.confirm('Este jogador já participou de jogos. Deseja inativá-lo em vez de excluí-lo?')) {
        setPlayers(players.map(p => 
          p.id === playerId ? { ...p, active: false } : p
        ));
      }
    } else {
      if (window.confirm('Tem certeza que deseja excluir este jogador?')) {
        setPlayers(players.filter(p => p.id !== playerId));
      }
    }
  };

  const openEditModal = (player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPlayer(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jogadores</h1>
        <button
          onClick={() => {
            setSelectedPlayer(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Adicionar Jogador
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-white rounded-lg shadow-md p-4 flex justify-between items-start"
          >
            <div>
              <h2 className="text-xl font-semibold">{player.name}</h2>
              {player.phone && (
                <p className="text-gray-600">{player.phone}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedPlayer(player);
                  setIsModalOpen(true);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDeletePlayer(player.id)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <PlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={selectedPlayer}
        onSubmit={selectedPlayer ? handleEditPlayer : handleAddPlayer}
      />
    </div>
  );
}

export default Players;
