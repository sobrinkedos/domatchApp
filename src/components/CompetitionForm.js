import React, { useState, useEffect } from 'react';

function CompetitionForm({ competition, onSubmit, onCancel }) {
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    name: competition?.name || '',
    date: competition?.date || new Date().toISOString().split('T')[0],
    status: null,
    players: competition?.players || []
  });

  useEffect(() => {
    // Carregar jogadores do localStorage
    const savedPlayers = JSON.parse(localStorage.getItem('players') || '[]');
    setPlayers(savedPlayers);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newCompetition = {
      id: competition?.id || Date.now(),
      name: formData.name.trim(),
      description: '',
      date: formData.date,
      players: formData.players,
      status: null,
      createdAt: Date.now()
    };

    onSubmit(newCompetition);
  };

  const handlePlayerToggle = (playerId) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players.includes(playerId)
        ? prev.players.filter(id => id !== playerId)
        : [...prev.players, playerId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome da Competição
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Data
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jogadores Participantes
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
          {players.map((player) => (
            <label key={player.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.players.includes(player.id)}
                onChange={() => handlePlayerToggle(player.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{player.name} {player.nickname ? `(${player.nickname})` : ''}</span>
            </label>
          ))}
          {players.length === 0 && (
            <p className="text-gray-500 text-sm">Nenhum jogador cadastrado</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}

export default CompetitionForm;
