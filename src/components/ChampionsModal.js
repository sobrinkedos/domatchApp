import React, { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { getGames } from '../services/supabaseService';

function ChampionsModal({ isOpen, onClose }) {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChampions = async () => {
      try {
        setLoading(true);
        const games = await getGames();
        const completedGames = games.filter(game => game.status === 'completed');
        
        // Processar os dados para obter os campeões
        const playersStats = {};
        
        completedGames.forEach(game => {
          const winnerTeam = game.winner_team;
          if (!winnerTeam) return;

          const winners = winnerTeam === 1 
            ? [game.team1_player1, game.team1_player2].filter(Boolean)
            : [game.team2_player1, game.team2_player2].filter(Boolean);

          winners.forEach(player => {
            if (!player) return;
            if (!playersStats[player.id]) {
              playersStats[player.id] = {
                id: player.id,
                name: player.name,
                wins: 0,
                games: 0,
                winRate: 0
              };
            }
            playersStats[player.id].wins += 1;
            playersStats[player.id].games += 1;
          });

          // Adicionar jogos perdidos
          const losers = winnerTeam === 1
            ? [game.team2_player1, game.team2_player2].filter(Boolean)
            : [game.team1_player1, game.team1_player2].filter(Boolean);

          losers.forEach(player => {
            if (!player) return;
            if (!playersStats[player.id]) {
              playersStats[player.id] = {
                id: player.id,
                name: player.name,
                wins: 0,
                games: 0,
                winRate: 0
              };
            }
            playersStats[player.id].games += 1;
          });
        });

        // Calcular taxa de vitória e ordenar
        const championsArray = Object.values(playersStats)
          .map(player => ({
            ...player,
            winRate: ((player.wins / player.games) * 100).toFixed(1)
          }))
          .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)
          .slice(0, 10);

        setChampions(championsArray);
      } catch (err) {
        console.error('Erro ao carregar campeões:', err);
        setError('Erro ao carregar os dados dos campeões');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadChampions();
    }
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                >
                  <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
                  Hall da Fama
                </Dialog.Title>

                {loading ? (
                  <div className="mt-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                  </div>
                ) : error ? (
                  <div className="mt-4 text-center text-red-600">
                    {error}
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="space-y-4">
                      {champions.map((champion, index) => (
                        <div
                          key={champion.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index === 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : index === 1
                                  ? 'bg-gray-200 text-gray-800'
                                  : index === 2
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">
                              {champion.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {champion.wins} vitórias
                            </div>
                            <div className="text-xs text-gray-500">
                              {champion.winRate}% em {champion.games} jogos
                            </div>
                          </div>
                        </div>
                      ))}
                      {champions.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          Nenhum campeão ainda
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default ChampionsModal;
