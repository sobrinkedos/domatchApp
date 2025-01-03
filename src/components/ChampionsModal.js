import React from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline';

function ChampionsModal({ isOpen, onClose, competition }) {
  if (!competition) return null;

  const { best_player, best_team_player1, best_team_player2, player_scores, team_scores } = competition;

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
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center justify-center mb-4"
                >
                  <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
                  Vencedores da Competição
                </Dialog.Title>

                <div className="mt-4 space-y-6">
                  {/* Melhor Jogador Individual */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 flex items-center">
                      <TrophyIcon className="h-5 w-5 mr-2" />
                      Melhor Jogador Individual
                    </h4>
                    <div className="mt-2">
                      {best_player ? (
                        <>
                          <p className="text-lg font-semibold text-yellow-900">
                            {best_player.name}
                          </p>
                          <p className="text-sm text-yellow-700">
                            {player_scores?.[best_player.id]} vitórias
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-semibold text-yellow-900">
                          Não disponível
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Melhor Dupla */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      Melhor Dupla
                    </h4>
                    <div className="mt-2">
                      {best_team_player1 && best_team_player2 ? (
                        <>
                          <p className="text-lg font-semibold text-blue-900">
                            {best_team_player1.name} / {best_team_player2.name}
                          </p>
                          {team_scores && (
                            <p className="text-sm text-blue-700">
                              {team_scores[[best_team_player1.id, best_team_player2.id].sort().join('-')]} vitórias
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-lg font-semibold text-blue-900">
                          Não disponível
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Estatísticas Gerais */}
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Estatísticas Gerais
                    </h4>
                    <div className="text-sm text-gray-600">
                      <p>Total de jogadores pontuados: {player_scores ? Object.keys(player_scores).length : 0}</p>
                      <p>Total de duplas pontuadas: {team_scores ? Object.keys(team_scores).length : 0}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
