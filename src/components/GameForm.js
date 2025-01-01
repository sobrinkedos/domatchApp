import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GameForm({ players, onSubmit, onCancel, competitionId }) {
  const [formData, setFormData] = useState({
    team1: ['', ''],
    team2: ['', '']
  });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verificar se todos os jogadores foram selecionados
    if (formData.team1.includes('') || formData.team2.includes('')) {
      alert('Por favor, selecione todos os jogadores');
      return;
    }

    // Converter IDs de string para número se necessário
    const team1 = formData.team1.map(id => parseInt(id));
    const team2 = formData.team2.map(id => parseInt(id));

    const newGame = {
      id: Date.now(),
      competitionId,
      team1,
      team2,
      matches: [],
      completed: false,
      started: false,
      winner: null,
      createdAt: new Date().toISOString()
    };

    onSubmit(newGame);
  };

  const handlePlayerSelect = (team, position, playerId) => {
    const newTeam = [...formData[`team${team}`]];
    newTeam[position] = playerId;
    setFormData({ ...formData, [`team${team}`]: newTeam });
  };

  const handleRandomTeams = () => {
    if (!players || players.length < 4) {
      alert('É necessário ter pelo menos 4 jogadores para sortear os times');
      return;
    }

    // Filtrar jogadores que não estão em nenhum time
    const availablePlayers = [...players];
    
    // Embaralhar array de jogadores
    for (let i = availablePlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePlayers[i], availablePlayers[j]] = [availablePlayers[j], availablePlayers[i]];
    }

    // Selecionar 4 jogadores aleatórios
    const selectedPlayers = availablePlayers.slice(0, 4);

    // Verificar se todos os jogadores têm ID
    if (selectedPlayers.some(player => !player || !player.id)) {
      alert('Erro ao sortear times: alguns jogadores não têm ID válido');
      return;
    }

    setFormData({
      team1: [selectedPlayers[0].id, selectedPlayers[1].id],
      team2: [selectedPlayers[2].id, selectedPlayers[3].id]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRandomTeams}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sortear Times
        </button>
      </div>

      {/* Time 1 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Time 1</h3>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((position) => (
            <div key={`team1-${position}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jogador {position + 1}
              </label>
              <select
                value={formData.team1[position]}
                onChange={(e) => handlePlayerSelect(1, position, e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Selecione um jogador</option>
                {players
                  .filter(player => 
                    !formData.team1.includes(player.id) || formData.team1[position] === player.id
                  )
                  .filter(player => 
                    !formData.team2.includes(player.id)
                  )
                  .map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))
                }
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Time 2 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Time 2</h3>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((position) => (
            <div key={`team2-${position}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jogador {position + 1}
              </label>
              <select
                value={formData.team2[position]}
                onChange={(e) => handlePlayerSelect(2, position, e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Selecione um jogador</option>
                {players
                  .filter(player => 
                    !formData.team2.includes(player.id) || formData.team2[position] === player.id
                  )
                  .filter(player => 
                    !formData.team1.includes(player.id)
                  )
                  .map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))
                }
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Preview das Duplas Selecionadas */}
      {(formData.team1.some(id => id !== '') || formData.team2.some(id => id !== '')) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Duplas Selecionadas:</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time 1:</span>
              <span className="text-sm font-medium">
                {formData.team1
                  .map(id => players.find(p => p.id === id)?.name || '')
                  .filter(Boolean)
                  .join(' & ') || 'Nenhum jogador selecionado'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time 2:</span>
              <span className="text-sm font-medium">
                {formData.team2
                  .map(id => players.find(p => p.id === id)?.name || '')
                  .filter(Boolean)
                  .join(' & ') || 'Nenhum jogador selecionado'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Criar Jogo
        </button>
      </div>
    </form>
  );
}

export default GameForm;
