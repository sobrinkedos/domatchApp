import React, { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getPlayers, createPlayer } from '../services/supabaseService';

function PlayersModal({ isOpen, onClose }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const loadedPlayers = await getPlayers();
        setPlayers(loadedPlayers);
      } catch (err) {
        console.error('Erro ao carregar jogadores:', err);
        setError('Erro ao carregar os dados dos jogadores');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadPlayers();
    }
  }, [isOpen]);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    try {
      setIsAddingPlayer(true);
      const newPlayer = await createPlayer({
        name: newPlayerName.trim(),
        phone: newPlayerPhone.trim() || null
      });

      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setNewPlayerPhone('');
    } catch (err) {
      console.error('Erro ao adicionar jogador:', err);
      setError('Erro ao adicionar jogador');
    } finally {
      setIsAddingPlayer(false);
    }
  };

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
                  <UserGroupIcon className="h-6 w-6 text-blue-500 mr-2" />
                  Gerenciar Jogadores
                </Dialog.Title>

                {error && (
                  <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAddPlayer} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">
                        Nome do Jogador
                      </label>
                      <input
                        type="text"
                        id="playerName"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="Digite o nome do jogador"
                      />
                    </div>
                    <div>
                      <label htmlFor="playerPhone" className="block text-sm font-medium text-gray-700">
                        Telefone (opcional)
                      </label>
                      <input
                        type="tel"
                        id="playerPhone"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newPlayerPhone}
                        onChange={(e) => setNewPlayerPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAddingPlayer || !newPlayerName.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isAddingPlayer ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <PlusIcon className="h-4 w-4 mr-2" />
                      )}
                      Adicionar Jogador
                    </button>
                  </div>
                </form>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900">Lista de Jogadores</h4>
                  {loading ? (
                    <div className="mt-4 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{player.name}</div>
                            {player.phone && (
                              <div className="text-sm text-gray-500">{player.phone}</div>
                            )}
                          </div>
                        </div>
                      ))}
                      {players.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          Nenhum jogador cadastrado
                        </div>
                      )}
                    </div>
                  )}
                </div>

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

export default PlayersModal;
