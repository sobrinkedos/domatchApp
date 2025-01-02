import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompetitionModal from '../components/CompetitionModal';
import { PencilIcon, TrashIcon, PlayIcon, CheckIcon, ClockIcon, CalendarIcon, UsersIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import { getCompetitions, createCompetition, updateCompetition, deleteCompetition, updateCompetitionStatus } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

function Competitions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const data = await getCompetitions();
      setCompetitions(data);
      setError(null);
    } catch (err) {
      console.error('Error loading competitions:', err);
      setError('Erro ao carregar competições');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetition = async (competitionData) => {
    try {
      setLoading(true);
      const newCompetition = await createCompetition(competitionData);
      setCompetitions([...competitions, newCompetition]);
      setError(null);
    } catch (err) {
      console.error('Error creating competition:', err);
      setError('Erro ao criar competição');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompetition = async (competitionData) => {
    try {
      setLoading(true);
      const updatedCompetition = await updateCompetition(selectedCompetition.id, competitionData);
      setCompetitions(competitions.map(c => 
        c.id === selectedCompetition.id ? updatedCompetition : c
      ));
      setError(null);
    } catch (err) {
      console.error('Error updating competition:', err);
      setError('Erro ao atualizar competição');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompetition = async (competitionId) => {
    if (window.confirm('Tem certeza que deseja excluir esta competição?')) {
      try {
        setLoading(true);
        await deleteCompetition(competitionId);
        setCompetitions(competitions.filter(c => c.id !== competitionId));
        setError(null);
      } catch (err) {
        console.error('Error deleting competition:', err);
        setError('Erro ao excluir competição');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (competitionId, newStatus) => {
    try {
      setLoading(true);
      await updateCompetitionStatus(competitionId, newStatus);
      setCompetitions(competitions.map(c => 
        c.id === competitionId ? { ...c, status: newStatus } : c
      ));
      setError(null);
    } catch (err) {
      console.error('Error updating competition status:', err);
      setError('Erro ao atualizar status da competição');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'finished':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'in_progress':
        return 'Em Andamento';
      case 'finished':
        return 'Finalizada';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const openEditModal = (competition) => {
    setSelectedCompetition(competition);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCompetition(null);
    setIsModalOpen(false);
  };

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Competições</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Nova Competição
        </button>
      </div>

      {/* Lista de Competições */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {competitions.map((competition) => (
            <li key={competition.id} className="px-6 py-4">
              <div className="flex items-center justify-between space-x-4">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/competitions/${competition.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          competition.status === 'pending' ? 'bg-yellow-100' :
                          competition.status === 'in_progress' ? 'bg-blue-100' :
                          'bg-green-100'
                        }`}>
                          {competition.status === 'pending' && <ClockIcon className="h-6 w-6 text-yellow-600" />}
                          {competition.status === 'in_progress' && <PlayIcon className="h-6 w-6 text-blue-600" />}
                          {competition.status === 'finished' && <CheckIcon className="h-6 w-6 text-green-600" />}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{competition.name}</h3>
                        <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(competition.start_date)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      competition.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      competition.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getStatusText(competition.status)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <RectangleStackIcon className="h-4 w-4 mr-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/competitions/${competition.id}/games`);
                        }}
                        className="hover:text-blue-600"
                      >
                        Ver Jogos
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {competition.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(competition.id, 'active')}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                      title="Iniciar Competição"
                    >
                      <PlayIcon className="h-5 w-5" />
                    </button>
                  )}
                  {competition.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(competition.id, 'finished')}
                      className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50"
                      title="Finalizar Competição"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(competition);
                    }}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-50"
                    title="Editar Competição"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCompetition(competition.id);
                    }}
                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                    title="Excluir Competição"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {competitions.length === 0 && (
            <li className="px-6 py-4 text-center text-gray-500">
              Nenhuma competição cadastrada
            </li>
          )}
        </ul>
      </div>

      <CompetitionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        competition={selectedCompetition}
        onSubmit={selectedCompetition ? handleEditCompetition : handleAddCompetition}
      />
    </div>
  );
}

export default Competitions;
