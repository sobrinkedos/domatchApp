import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGames, getPlayers } from '../services/supabaseService';
import { PencilIcon, TrashIcon, PlayIcon, CheckIcon } from '@heroicons/react/24/outline';

function Games() {
  const { competitionId } = useParams();
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [loadedGames, loadedPlayers] = await Promise.all([
          getGames(competitionId),
          getPlayers()
        ]);
        setGames(loadedGames);
        setPlayers(loadedPlayers);
        setError(null);
      } catch (err) {
        console.error('Error loading games:', err);
        setError('Erro ao carregar jogos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [competitionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Jogos</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Novo Jogo
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-lg shadow-md p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Time 1
                </h2>
                <div className="text-sm text-gray-600">
                  {game.team1_player1?.name}
                  {game.team1_player2 && ` e ${game.team1_player2?.name}`}
                </div>
              </div>
              <div className="text-lg font-bold">
                {game.team1_score || 0}
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Time 2
                </h2>
                <div className="text-sm text-gray-600">
                  {game.team2_player1?.name}
                  {game.team2_player2 && ` e ${game.team2_player2?.name}`}
                </div>
              </div>
              <div className="text-lg font-bold">
                {game.team2_score || 0}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="text-gray-600 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div>
                  {game.status === 'pending' && (
                    <button
                      className="flex items-center text-sm text-green-600 hover:text-green-800"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      <span>Iniciar</span>
                    </button>
                  )}
                  {game.status === 'in_progress' && (
                    <button
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      <span>Finalizar</span>
                    </button>
                  )}
                  {game.status === 'finished' && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckIcon className="h-4 w-4 mr-1" />
                      <span>Finalizado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Games;
