import React, { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { 
  UserGroupIcon, 
  PlusIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  PhoneIcon,
  CheckIcon,
  Square2StackIcon,
  UserMinusIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { 
  getPlayers, 
  createPlayer, 
  addPlayerToCompetition, 
  getExistingPlayersInCompetition,
  removePlayerFromCompetition 
} from '../services/supabaseService';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function PlayersModal({ isOpen, onClose, competitionId, onPlayerAdded }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('existing');
  const [selectedToAdd, setSelectedToAdd] = useState(new Set());
  const [selectedToRemove, setSelectedToRemove] = useState(new Set());
  const [existingPlayerIds, setExistingPlayerIds] = useState(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carrega todos os jogadores
        const loadedPlayers = await getPlayers();
        setPlayers(loadedPlayers);

        // Carrega jogadores já na competição
        const existingPlayers = await getExistingPlayersInCompetition(competitionId);
        setExistingPlayerIds(new Set(existingPlayers));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados dos jogadores');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
      setSelectedToAdd(new Set());
      setSelectedToRemove(new Set());
    }
  }, [isOpen, competitionId]);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    try {
      setIsAddingPlayer(true);
      setError(null);
      const newPlayer = await createPlayer({
        name: newPlayerName.trim(),
        phone: newPlayerPhone.trim() || null
      });

      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setNewPlayerPhone('');
      setSelectedTab('existing');
    } catch (err) {
      console.error('Erro ao adicionar jogador:', err);
      setError('Erro ao adicionar jogador');
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const handleProcessChanges = async () => {
    if (selectedToAdd.size === 0 && selectedToRemove.size === 0) return;

    try {
      setProcessing(true);
      setError(null);

      // Adiciona novos jogadores
      for (const playerId of selectedToAdd) {
        await addPlayerToCompetition(competitionId, playerId);
      }

      // Remove jogadores selecionados
      for (const playerId of selectedToRemove) {
        await removePlayerFromCompetition(competitionId, playerId);
      }

      onPlayerAdded && onPlayerAdded();
      onClose();
    } catch (err) {
      console.error('Erro ao processar alterações:', err);
      setError('Erro ao processar alterações. Por favor, tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const togglePlayerSelection = (playerId) => {
    if (existingPlayerIds.has(playerId)) {
      // Toggle remoção para jogadores existentes
      const newSelected = new Set(selectedToRemove);
      if (newSelected.has(playerId)) {
        newSelected.delete(playerId);
      } else {
        newSelected.add(playerId);
      }
      setSelectedToRemove(newSelected);
    } else {
      // Toggle adição para novos jogadores
      const newSelected = new Set(selectedToAdd);
      if (newSelected.has(playerId)) {
        newSelected.delete(playerId);
      } else {
        newSelected.add(playerId);
      }
      setSelectedToAdd(newSelected);
    }
  };

  const toggleAllPlayers = () => {
    const availablePlayers = filteredPlayers.filter(p => !existingPlayerIds.has(p.id));
    if (selectedToAdd.size === availablePlayers.length) {
      setSelectedToAdd(new Set());
    } else {
      setSelectedToAdd(new Set(availablePlayers.map(p => p.id)));
    }
  };

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.phone && player.phone.includes(searchTerm))
  );

  const hasChanges = selectedToAdd.size > 0 || selectedToRemove.size > 0;

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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="div" className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-6 w-6 text-blue-500 mr-2" />
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Gerenciar Jogadores
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </Dialog.Title>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                    <span className="text-sm">{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto rounded-full p-1 hover:bg-red-100 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                )}

                <Tab.Group selectedIndex={selectedTab === 'existing' ? 0 : 1} onChange={(index) => setSelectedTab(index === 0 ? 'existing' : 'new')}>
                  <Tab.List className="flex space-x-4 border-b mt-4">
                    <Tab className={({ selected }) =>
                      classNames(
                        'px-4 py-2 text-sm font-medium focus:outline-none',
                        selected
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      )
                    }>
                      Jogadores Existentes
                    </Tab>
                    <Tab className={({ selected }) =>
                      classNames(
                        'px-4 py-2 text-sm font-medium focus:outline-none',
                        selected
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      )
                    }>
                      Novo Jogador
                    </Tab>
                  </Tab.List>

                  <Tab.Panels className="mt-4">
                    <Tab.Panel>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="relative flex-1 mr-4">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Buscar jogador por nome ou telefone..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <button
                            onClick={toggleAllPlayers}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Square2StackIcon className="h-5 w-5 mr-2 text-gray-400" />
                            {selectedToAdd.size === filteredPlayers.filter(p => !existingPlayerIds.has(p.id)).length 
                              ? 'Desmarcar Todos' 
                              : 'Selecionar Todos'}
                          </button>
                        </div>

                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                            {filteredPlayers.map((player) => {
                              const isExisting = existingPlayerIds.has(player.id);
                              const isSelected = isExisting 
                                ? selectedToRemove.has(player.id)
                                : selectedToAdd.has(player.id);
                              
                              return (
                                <button
                                  key={player.id}
                                  onClick={() => togglePlayerSelection(player.id)}
                                  className={classNames(
                                    "flex items-center justify-between p-4 rounded-lg text-left w-full transition-colors border-2",
                                    isExisting
                                      ? isSelected
                                        ? "bg-red-50 border-red-500"
                                        : "bg-green-50 border-green-500"
                                      : isSelected
                                        ? "bg-blue-50 border-blue-500"
                                        : "bg-gray-50 border-transparent hover:bg-gray-100"
                                  )}
                                >
                                  <div className="flex items-center flex-1">
                                    <div className={classNames(
                                      "w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors",
                                      isSelected
                                        ? isExisting
                                          ? "bg-red-500"
                                          : "bg-blue-500"
                                        : "border-2 border-gray-300"
                                    )}>
                                      {isSelected && (
                                        <CheckIcon className="w-4 h-4 text-white" />
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">{player.name}</h4>
                                      {player.phone && (
                                        <p className="text-xs text-gray-500 flex items-center mt-1">
                                          <PhoneIcon className="h-3 w-3 mr-1" />
                                          {player.phone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    {isExisting ? (
                                      <UserMinusIcon className={classNames(
                                        "h-5 w-5",
                                        isSelected ? "text-red-500" : "text-green-500"
                                      )} />
                                    ) : (
                                      <UserPlusIcon className={classNames(
                                        "h-5 w-5",
                                        isSelected ? "text-blue-500" : "text-gray-400"
                                      )} />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                            {filteredPlayers.length === 0 && !loading && (
                              <div className="col-span-2 text-center py-8 text-gray-500">
                                Nenhum jogador encontrado
                              </div>
                            )}
                          </div>
                        )}

                        {hasChanges && (
                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <div className="text-sm text-gray-500">
                              {selectedToAdd.size > 0 && (
                                <span className="text-blue-600 font-medium">
                                  {selectedToAdd.size} para adicionar
                                </span>
                              )}
                              {selectedToAdd.size > 0 && selectedToRemove.size > 0 && (
                                <span className="mx-2">•</span>
                              )}
                              {selectedToRemove.size > 0 && (
                                <span className="text-red-600 font-medium">
                                  {selectedToRemove.size} para remover
                                </span>
                              )}
                            </div>
                            <button
                              onClick={handleProcessChanges}
                              disabled={processing}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                              {processing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                  Processando...
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                                  Confirmar Alterações
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <form onSubmit={handleAddPlayer} className="space-y-4">
                        <div>
                          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Jogador
                          </label>
                          <input
                            type="text"
                            id="playerName"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Digite o nome do jogador"
                          />
                        </div>
                        <div>
                          <label htmlFor="playerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone (opcional)
                          </label>
                          <input
                            type="tel"
                            id="playerPhone"
                            value={newPlayerPhone}
                            onChange={(e) => setNewPlayerPhone(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Digite o telefone do jogador"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isAddingPlayer || !newPlayerName.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            {isAddingPlayer ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Adicionando...
                              </>
                            ) : (
                              <>
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Adicionar Jogador
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default PlayersModal;
