import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameModal from '../components/GameModal';
import ChampionsModal from '../components/ChampionsModal';
import PlayersModal from '../components/PlayersModal';
import { 
  ArrowLeftIcon, 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  NoSymbolIcon,
  CalculatorIcon,
  ChartBarIcon,
  TrophyIcon,
  UserGroupIcon,
  TrashIcon,
  CalendarIcon,
  UsersIcon,
  RectangleStackIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { getCompetitionById, getGamesByCompetitionId, getPlayersByCompetitionId, startCompetition } from '../services/supabaseService';

function CompetitionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showChampionsModal, setShowChampionsModal] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCompetitionData();
  }, [id]);

  const loadCompetitionData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados da competição
      const competitionData = await getCompetitionById(id);
      if (!competitionData) {
        throw new Error('Competição não encontrada');
      }
      console.log('Competition Data:', competitionData); // Debug
      setCompetition(competitionData);

      // Carregar jogos da competição
      const gamesData = await getGamesByCompetitionId(id);
      setGames(gamesData);

      // Carregar jogadores da competição
      const playersData = await getPlayersByCompetitionId(id);
      console.log('Players Data:', playersData); // Debug
      setPlayers(playersData);

      setError(null);
    } catch (err) {
      console.error('Error loading competition data:', err);
      setError('Erro ao carregar dados da competição');
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

  const handleStartCompetition = async () => {
    try {
      setProcessing(true);
      await startCompetition(id);
      await loadCompetitionData();
    } catch (error) {
      console.error('Error starting competition:', error);
      // TODO: Adicionar toast de erro
    } finally {
      setProcessing(false);
    }
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

  if (!competition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Competição não encontrada</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/competitions')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{competition.name}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/competitions/${id}/games`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RectangleStackIcon className="h-5 w-5 mr-2" />
            Gerenciar Jogos
          </button>
          <button
            onClick={() => navigate(`/competitions/${id}/stats`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Estatísticas
          </button>
        </div>
      </div>

      {/* Informações da Competição */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Detalhes da Competição
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Informações e estatísticas
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                competition.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                competition.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {getStatusText(competition.status)}
              </span>
              {console.log('Rendering button section')}
              {console.log('Competition:', competition)}
              {console.log('Status:', competition.status)}
              {console.log('Players:', players)}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Data de Início
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(competition.start_date)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Jogadores
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {players.length} jogadores participando
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Jogos
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {games.length} jogos registrados
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {competition.status === 'pending' && (
        <div className="mt-4">
          <button
            onClick={handleStartCompetition}
            disabled={players.length < 4 || processing}
            title={players.length < 4 ? 'Mínimo de 4 jogadores necessários' : ''}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            {processing ? 'Iniciando...' : 'Iniciar Competição'}
          </button>
        </div>
      )}

      {/* Lista de Jogos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Últimos Jogos
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {games.slice(0, 5).map((game) => (
              <li key={game.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      game.status === 'pending' ? 'bg-yellow-400' :
                      game.status === 'in_progress' ? 'bg-blue-400' :
                      'bg-green-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {game.team1_name} vs {game.team2_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(game.date)}
                      </p>
                    </div>
                  </div>
                  {game.status === 'finished' && (
                    <div className="text-sm font-medium text-gray-900">
                      {game.team1_score} - {game.team2_score}
                    </div>
                  )}
                </div>
              </li>
            ))}
            {games.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                Nenhum jogo registrado
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Lista de Jogadores */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Jogadores
            </h3>
            <button
              onClick={() => setShowPlayersModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UsersIcon className="h-5 w-5 mr-2" />
              Gerenciar Jogadores
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {players.map((player) => (
              <li key={player.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <UsersIcon className="h-6 w-6 text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-500">{player.phone}</p>
                  </div>
                </div>
              </li>
            ))}
            {players.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                Nenhum jogador registrado
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Modais */}
      <GameModal
        isOpen={showGameModal}
        onClose={() => {
          setShowGameModal(false);
          setSelectedGame(null);
        }}
        game={selectedGame}
        competitionId={id}
        onSubmit={loadCompetitionData}
      />

      <ChampionsModal
        isOpen={showChampionsModal}
        onClose={() => setShowChampionsModal(false)}
        champions={competition.champions}
      />

      <PlayersModal
        isOpen={showPlayersModal}
        onClose={() => setShowPlayersModal(false)}
        competitionId={id}
        onPlayerAdded={loadCompetitionData}
      />
    </div>
  );
}

export default CompetitionDetails;
