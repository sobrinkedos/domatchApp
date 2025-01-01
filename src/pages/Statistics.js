import React from 'react';
import { Link } from 'react-router-dom';

function Statistics() {
  const players = JSON.parse(localStorage.getItem('players')) || [];

  // Ordenar jogadores por vitórias
  const sortedPlayers = [...players].sort((a, b) => {
    const winsA = a.stats?.wins || 0;
    const winsB = b.stats?.wins || 0;
    return winsB - winsA;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Estatísticas dos Jogadores</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedPlayers.map(player => {
          const stats = player.stats || {};
          const totalGames = (stats.wins || 0) + (stats.losses || 0);
          const winRate = totalGames > 0 ? ((stats.wins || 0) / totalGames * 100).toFixed(1) : 0;

          return (
            <div key={player.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{player.name}</h3>
              
              {/* Estatísticas Gerais */}
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">
                  Jogos: <span className="font-semibold">{totalGames}</span>
                </p>
                <p className="text-gray-600">
                  Vitórias: <span className="font-semibold text-green-600">{stats.wins || 0}</span>
                </p>
                <p className="text-gray-600">
                  Derrotas: <span className="font-semibold text-red-600">{stats.losses || 0}</span>
                </p>
                <p className="text-gray-600">
                  Taxa de Vitória: <span className="font-semibold">{winRate}%</span>
                </p>
              </div>

              {/* Destaques */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Destaques</h4>
                
                {/* Buchudas */}
                <div className="space-y-2 mb-3">
                  <p className="text-gray-600">
                    Buchudas dadas: 
                    <span className="font-semibold text-green-600 ml-2">
                      {stats.buchudas || 0}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Buchudas recebidas: 
                    <span className="font-semibold text-red-600 ml-2">
                      {stats.buchudasRecebidas || 0}
                    </span>
                  </p>
                </div>

                {/* Buchudas de Ré */}
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Buchudas de Ré dadas: 
                    <span className="font-semibold text-green-600 ml-2">
                      {stats.buchudasRe || 0}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Buchudas de Ré recebidas: 
                    <span className="font-semibold text-red-600 ml-2">
                      {stats.buchudasReRecebidas || 0}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Statistics;
