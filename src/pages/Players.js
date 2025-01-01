import React, { useState, useEffect } from 'react';
import PlayerModal from '../components/PlayerModal';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function Players() {
  const [players, setPlayers] = useState(() => {
    const savedPlayers = localStorage.getItem('players');
    const parsedPlayers = savedPlayers ? JSON.parse(savedPlayers) : [];
    // Adiciona o campo active para jogadores existentes se não existir
    return parsedPlayers.map(player => ({
      ...player,
      active: player.active === undefined ? true : player.active
    }));
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    localStorage.setItem('players', JSON.stringify(players));
  }, [players]);

  const handleAddPlayer = (playerData) => {
    const newPlayer = {
      id: Date.now(),
      ...playerData,
      active: true
    };
    setPlayers([...players, newPlayer]);
  };

  const handleEditPlayer = (playerData) => {
    setPlayers(players.map(p => 
      p.id === selectedPlayer.id ? { ...p, ...playerData, active: p.active } : p
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Jogadores</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Novo Jogador
        </button>
      </div>

      {/* Lista de Jogadores */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {players.map((player) => (
            <li key={player.id} className={`px-6 py-4 hover:bg-gray-50 ${!player.active ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">{player.name}</h3>
                    {!player.active && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <p>Apelido: {player.nickname || '-'}</p>
                    <p>Celular: {player.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => openEditModal(player)}
                    className="text-blue-600 hover:text-blue-900"
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
            </li>
          ))}
          {players.length === 0 && (
            <li className="px-6 py-4 text-center text-gray-500">
              Nenhum jogador cadastrado
            </li>
          )}
        </ul>
      </div>

      <PlayerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        player={selectedPlayer}
        onSubmit={selectedPlayer ? handleEditPlayer : handleAddPlayer}
      />
    </div>
  );
}

export default Players;
