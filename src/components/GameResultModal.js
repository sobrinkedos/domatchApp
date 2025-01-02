import React, { useState } from 'react';
import Modal from './Modal';

const resultTypes = [
  { id: 'simple', points: 1, label: 'Batida Simples', color: 'blue' },
  { id: 'double', points: 2, label: 'Batida Carroça', color: 'green' },
  { id: 'la', points: 3, label: 'Batida Lá e Lô', color: 'purple' },
  { id: 'cruzada', points: 4, label: 'Batida Cruzada', color: 'red' },
  { id: 'draw', points: 0, label: 'Empate', color: 'yellow', fullWidth: true }
];

function GameResultModal({ isOpen, onClose, onSubmit, game, team1Players, team2Players }) {
  const [selectedType, setSelectedType] = useState(null);
  const [winningTeam, setWinningTeam] = useState(null);

  if (!isOpen || !game) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedType) return;
    if (selectedType !== 'draw' && !winningTeam) return;

    const resultType = resultTypes.find(type => type.id === selectedType);
    const team1Score = selectedType === 'draw' ? 1 : (winningTeam === 1 ? resultType.points : 0);
    const team2Score = selectedType === 'draw' ? 1 : (winningTeam === 2 ? resultType.points : 0);

    // Verificar se a última partida foi empate
    const matches = game.matches || [];
    const lastMatch = matches.length > 0 ? matches[matches.length - 1] : null;
    const wasLastMatchDraw = lastMatch?.result?.type === 'draw';
    
    // Calcular pontuação total
    let points = selectedType === 'draw' ? 1 : resultType.points;
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

    onSubmit({
      type: selectedType,
      winningTeam: selectedType === 'draw' ? null : winningTeam,
      team1Score,
      team2Score,
      points,
      hasExtraPoint
    });

    // Limpar seleção
    setSelectedType(null);
    setWinningTeam(null);
  };

  // Formatar nomes dos jogadores
  const team1Names = team1Players.map(p => p.name).join(' & ');
  const team2Names = team2Players.map(p => p.name).join(' & ');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Resultado">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipos de Resultado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Resultado
          </label>
          <div className="grid grid-cols-2 gap-2">
            {resultTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setSelectedType(type.id);
                  if (type.id === 'draw') setWinningTeam(null);
                }}
                className={`
                  ${type.fullWidth ? 'col-span-2' : ''}
                  p-3 rounded-lg border-2 transition-colors
                  ${selectedType === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {type.label}
                {type.id === 'draw' && (
                  <span className="block text-sm text-gray-500 mt-1">
                    Nenhum time marca ponto. Próxima vitória vale +1 ponto extra.
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Seleção do Time Vencedor */}
        {selectedType && selectedType !== 'draw' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Vencedor
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWinningTeam(1)}
                className={`
                  p-3 rounded-lg border-2 transition-colors
                  ${winningTeam === 1
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {team1Names}
              </button>
              <button
                type="button"
                onClick={() => setWinningTeam(2)}
                className={`
                  p-3 rounded-lg border-2 transition-colors
                  ${winningTeam === 2
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {team2Names}
              </button>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!selectedType || (selectedType !== 'draw' && !winningTeam)}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-md
              ${(!selectedType || (selectedType !== 'draw' && !winningTeam))
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default GameResultModal;
