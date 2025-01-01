import React from 'react';
import { TrophyIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ChampionsModal({ isOpen, onClose, champions }) {
  if (!isOpen) return null;

  const { topPlayers, topTeam } = champions;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center mb-8">
              <TrophyIcon className="mx-auto h-12 w-12 text-yellow-400" />
              <h3 className="mt-4 text-2xl font-semibold leading-6 text-gray-900">
                Campeões da Competição
              </h3>
            </div>

            {/* Jogadores Campeões */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Jogadores Campeões</h4>
              <div className="space-y-4">
                {topPlayers.map((player, index) => (
                  <div
                    key={player.name}
                    className="flex items-center justify-between bg-yellow-50 rounded-lg p-4"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-yellow-600 mr-4">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{player.name}</p>
                        <p className="text-sm text-gray-500">
                          {player.wins} vitórias · {player.points} pontos
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <TrophyIcon className="h-8 w-8 text-yellow-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dupla Campeã */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Dupla Campeã</h4>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {topTeam.players.join(' & ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {topTeam.wins} vitórias · {topTeam.points} pontos
                    </p>
                  </div>
                  <TrophyIcon className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
