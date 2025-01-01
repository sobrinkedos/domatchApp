import React, { useState } from 'react';

const resultTypes = [
  { id: 'simple', points: 1, label: 'Batida Simples', color: 'blue' },
  { id: 'double', points: 2, label: 'Batida Carroça', color: 'green' },
  { id: 'la', points: 3, label: 'Batida Lá e Lô', color: 'purple' },
  { id: 'cruzada', points: 4, label: 'Batida Cruzada', color: 'red' },
  { id: 'draw', points: 0, label: 'Empate', color: 'yellow', fullWidth: true }
];

function GameResultModal({ isOpen, onClose, onSubmit, game }) {
  const [selectedType, setSelectedType] = useState(null);
  const [winningTeam, setWinningTeam] = useState(null);

  if (!isOpen || !game) return null;

  const team1Names = (game.team1 || [])
    .map(playerId => {
      const player = JSON.parse(localStorage.getItem('players') || '[]')
        .find(p => p.id === playerId);
      return player ? player.name : '';
    })
    .join(' / ');

  const team2Names = (game.team2 || [])
    .map(playerId => {
      const player = JSON.parse(localStorage.getItem('players') || '[]')
        .find(p => p.id === playerId);
      return player ? player.name : '';
    })
    .join(' / ');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedType) return;
    if (selectedType.id !== 'draw' && !winningTeam) return;

    // Verificar se a última partida foi empate
    const matches = game.matches || [];
    const lastMatch = matches.length > 0 ? matches[matches.length - 1] : null;
    const wasLastMatchDraw = lastMatch?.result?.type === 'draw';
    
    // Calcular pontuação total
    let points = selectedType.points;
    let hasExtraPoint = false;

    // Se não for empate e a última partida foi empate, adiciona ponto extra
    if (selectedType.id !== 'draw' && wasLastMatchDraw) {
      points += 1;
      hasExtraPoint = true;
    }

    console.log('Calculando resultado:', {
      selectedType,
      winningTeam,
      wasLastMatchDraw,
      hasExtraPoint,
      points
    });

    if (typeof onSubmit === 'function') {
      const result = {
        type: selectedType.id,
        winningTeam: selectedType.id === 'draw' ? null : winningTeam,
        points,
        hasExtraPoint,
        team1Score: selectedType.id === 'draw' ? points : (winningTeam === 1 ? points : 0),
        team2Score: selectedType.id === 'draw' ? points : (winningTeam === 2 ? points : 0)
      };

      onSubmit(result);
      onClose();

      // Reset form
      setSelectedType(null);
      setWinningTeam(null);
    }
  };

  const getButtonColorClass = (type) => {
    if (!type) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    
    switch (type.color) {
      case 'blue':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'green':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'purple':
        return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'red':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'yellow':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Registrar Resultado
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Tipo de Resultado
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {resultTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setSelectedType(type);
                      if (type.id === 'draw') setWinningTeam(null);
                    }}
                    className={`${
                      type.fullWidth ? 'col-span-2' : ''
                    } p-3 rounded-md font-medium transition-colors ${
                      selectedType?.id === type.id
                        ? getButtonColorClass(type)
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedType && selectedType.id !== 'draw' && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Dupla Vencedora
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWinningTeam(1)}
                    className={`p-3 rounded-md font-medium transition-colors ${
                      winningTeam === 1
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {team1Names}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWinningTeam(2)}
                    className={`p-3 rounded-md font-medium transition-colors ${
                      winningTeam === 2
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {team2Names}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedType || (selectedType.id !== 'draw' && !winningTeam)}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  selectedType && (selectedType.id === 'draw' || winningTeam)
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GameResultModal;
