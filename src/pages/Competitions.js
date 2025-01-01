import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CompetitionModal from '../components/CompetitionModal';
import { PencilIcon, TrashIcon, PlayIcon, CheckIcon, ClockIcon, CalendarIcon, UsersIcon, RectangleStackIcon } from '@heroicons/react/24/outline';

function Competitions() {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState(() => {
    const savedCompetitions = localStorage.getItem('competitions');
    return savedCompetitions ? JSON.parse(savedCompetitions) : [];
  });
  const [players, setPlayers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  useEffect(() => {
    const savedPlayers = localStorage.getItem('players');
    setPlayers(savedPlayers ? JSON.parse(savedPlayers) : []);
  }, []);

  const handleAddCompetition = (competitionData) => {
    const newCompetition = {
      ...competitionData,
      id: Date.now(),
      status: null,
      createdAt: Date.now()
    };

    const updatedCompetitions = [...competitions, newCompetition];
    setCompetitions(updatedCompetitions);
    localStorage.setItem('competitions', JSON.stringify(updatedCompetitions));
  };

  const handleEditCompetition = (competitionData) => {
    const updatedCompetitions = competitions.map(c => 
      c.id === selectedCompetition.id ? { ...c, ...competitionData } : c
    );
    setCompetitions(updatedCompetitions);
    localStorage.setItem('competitions', JSON.stringify(updatedCompetitions));
  };

  const handleDeleteCompetition = (competitionId) => {
    if (window.confirm('Tem certeza que deseja excluir esta competição?')) {
      setCompetitions(competitions.filter(c => c.id !== competitionId));
    }
  };

  const handleStatusChange = (competitionId, newStatus) => {
    setCompetitions(competitions.map(c => 
      c.id === competitionId ? { ...c, status: newStatus } : c
    ));
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

  const getPlayerNames = (playerIds) => {
    return playerIds
      .map(id => players.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const openEditModal = (competition) => {
    setSelectedCompetition(competition);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCompetition(null);
    setIsModalOpen(false);
  };

  const handleCompetitionClick = (competitionId) => {
    navigate(`/competitions/${competitionId}`);
  };

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
            <Link
              key={competition.id}
              to={`/competitions/${competition.id}`}
              className="block hover:bg-gray-50"
            >
              <li className="px-6 py-4">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 cursor-pointer">
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
                            <span>{formatDate(competition.date)}</span>
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
                        <UsersIcon className="h-4 w-4 mr-1" />
                        <span>
                          {competition.players?.length || 0} jogadores
                        </span>
                      </div>
                      <div className="flex items-center">
                        <RectangleStackIcon className="h-4 w-4 mr-1" />
                        <span>
                          {(competition.games?.length || 0)} jogos
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {competition.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(competition.id, 'in_progress')}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                        title="Iniciar Competição"
                      >
                        <PlayIcon className="h-5 w-5" />
                      </button>
                    )}
                    {competition.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(competition.id, 'finished')}
                        className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50"
                        title="Finalizar Competição"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(competition)}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-50"
                      title="Editar Competição"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompetition(competition.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                      title="Excluir Competição"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            </Link>
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
