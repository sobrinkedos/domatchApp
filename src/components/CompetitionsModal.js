import React, { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { TrophyIcon, PlusIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getCompetitions, createCompetition, updateCompetitionStatus } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

function CompetitionsModal({ isOpen, onClose }) {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCompetitionName, setNewCompetitionName] = useState('');
  const [isAddingCompetition, setIsAddingCompetition] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        setLoading(true);
        const loadedCompetitions = await getCompetitions();
        setCompetitions(loadedCompetitions);
      } catch (err) {
        console.error('Erro ao carregar competições:', err);
        setError('Erro ao carregar os dados das competições');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadCompetitions();
    }
  }, [isOpen]);

  const handleAddCompetition = async (e) => {
    e.preventDefault();
    if (!newCompetitionName.trim()) return;

    try {
      setIsAddingCompetition(true);
      const newCompetition = await createCompetition({
        name: newCompetitionName.trim(),
        status: 'active',
        user_id: user.id
      });

      setCompetitions([newCompetition, ...competitions]);
      setNewCompetitionName('');
    } catch (err) {
      console.error('Erro ao adicionar competição:', err);
      setError('Erro ao adicionar competição');
    } finally {
      setIsAddingCompetition(false);
    }
  };

  const handleUpdateStatus = async (competitionId, newStatus) => {
    try {
      const updatedCompetition = await updateCompetitionStatus(competitionId, newStatus);
      setCompetitions(competitions.map(comp => 
        comp.id === competitionId ? updatedCompetition : comp
      ));
    } catch (err) {
      console.error('Erro ao atualizar status da competição:', err);
      setError('Erro ao atualizar status da competição');
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
                  <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
                  Gerenciar Competições
                </Dialog.Title>

                {error && (
                  <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAddCompetition} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="competitionName" className="block text-sm font-medium text-gray-700">
                        Nome da Competição
                      </label>
                      <input
                        type="text"
                        id="competitionName"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                        value={newCompetitionName}
                        onChange={(e) => setNewCompetitionName(e.target.value)}
                        placeholder="Digite o nome da competição"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAddingCompetition || !newCompetitionName.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isAddingCompetition ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <PlusIcon className="h-4 w-4 mr-2" />
                      )}
                      Adicionar Competição
                    </button>
                  </div>
                </form>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900">Lista de Competições</h4>
                  {loading ? (
                    <div className="mt-4 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {competitions.map((competition) => (
                        <div
                          key={competition.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center space-x-2">
                            {competition.status === 'completed' ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <ClockIcon className="h-5 w-5 text-yellow-500" />
                            )}
                            <div className="font-medium text-gray-900">{competition.name}</div>
                          </div>
                          <div>
                            {competition.status === 'active' ? (
                              <button
                                onClick={() => handleUpdateStatus(competition.id, 'completed')}
                                className="text-sm text-yellow-600 hover:text-yellow-800"
                              >
                                Finalizar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(competition.id, 'active')}
                                className="text-sm text-green-600 hover:text-green-800"
                              >
                                Reativar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {competitions.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          Nenhuma competição cadastrada
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
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

export default CompetitionsModal;
