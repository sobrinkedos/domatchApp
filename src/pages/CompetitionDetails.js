import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameModal from '../components/GameModal';
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
  PlayIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { 
  getCompetitionById, 
  getGamesByCompetitionId, 
  getPlayersByCompetitionId, 
  startCompetition,
  createGame,
  finishCompetition 
} from '../services/supabaseService';

function CompetitionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showGameModal, setShowGameModal] = useState(false);
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
      console.log('Dados da competição:', competitionData); // Log para debug
      if (competitionData.status === 'finished') {
        const finishedData = await finishCompetition(id);
        setCompetition(finishedData);
      } else {
        setCompetition(competitionData);
      }

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

  const handleCreateGame = async (gameData) => {
    try {
      setProcessing(true);
      await createGame(gameData);
      await loadCompetitionData();
    } catch (error) {
      console.error('Error creating game:', error);
      // TODO: Adicionar toast de erro
    } finally {
      setProcessing(false);
    }
  };

  const handleFinishCompetition = async () => {
    try {
      setProcessing(true);
      setError(null);
      setSuccessMessage(null);

      // Verificar se há jogos
      if (games.length === 0) {
        setError('Não é possível encerrar uma competição sem jogos');
        return;
      }

      // Verificar se todos os jogos estão finalizados
      const hasUnfinishedGames = games.some(game => game.status !== 'finished');
      if (hasUnfinishedGames) {
        setError('Existem jogos não finalizados. Finalize todos os jogos antes de encerrar a competição.');
        return;
      }

      const finishedData = await finishCompetition(id);
      console.log('Dados após finalizar:', finishedData); // Log para debug
      setCompetition(finishedData);
      setSuccessMessage('Competição encerrada com sucesso!');
    } catch (error) {
      console.error('Error finishing competition:', error);
      setError(error.message || 'Erro ao encerrar competição');
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
          {competition.status === 'in_progress' && (
            <button
              onClick={handleFinishCompetition}
              disabled={processing}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                processing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <FlagIcon className="h-5 w-5 mr-2" />
              {processing ? 'Processando...' : 'Encerrar Competição'}
            </button>
          )}
          <button
            onClick={() => navigate('/competitions')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 text-gray-500" />
            Voltar
          </button>
        </div>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

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

      {/* Seção de Vencedores */}
      {competition?.status === 'finished' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <TrophyIcon className="h-8 w-8 text-yellow-500 mr-2" />
            Vencedores da Competição
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Melhor Jogador Individual */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-800 flex items-center mb-3">
                <TrophyIcon className="h-5 w-5 mr-2" />
                Melhor Jogador Individual
              </h3>
              <div className="mt-2">
                {competition.champions?.best_player ? (
                  <>
                    <p className="text-xl font-semibold text-yellow-900">
                      {competition.champions.best_player.name}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {competition.champions.player_scores?.[competition.champions.best_player.id] || 0} vitórias
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 italic">
                    Nenhum jogador pontuado
                  </p>
                )}
              </div>
            </div>

            {/* Melhor Dupla */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 flex items-center mb-3">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Melhor Dupla
              </h3>
              <div className="mt-2">
                {competition.champions?.best_team ? (
                  <>
                    <p className="text-xl font-semibold text-blue-900">
                      {competition.champions.best_team[0].name} / {competition.champions.best_team[1].name}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {competition.champions.team_scores?.[competition.champions.best_team.map(p => p.id).sort().join('-')] || 0} vitórias
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 italic">
                    Nenhuma dupla pontuada
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Estatísticas Gerais */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Estatísticas Gerais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <p>Total de jogadores pontuados: {Object.keys(competition.champions?.player_scores || {}).length}</p>
              <p>Total de duplas pontuadas: {Object.keys(competition.champions?.team_scores || {}).length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Jogos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Jogos em Andamento
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {games.length === 0 ? 'Nenhum jogo criado ainda' : `${games.length} jogos criados`}
              </p>
            </div>
            {competition.status === 'in_progress' && (
              <button
                onClick={() => setShowGameModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RectangleStackIcon className="h-5 w-5 mr-2" />
                Novo Jogo
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200">
          {games.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {games.map((game) => (
                <li key={game.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className={`h-5 w-5 ${
                          game.status === 'pending' ? 'text-yellow-500' :
                          game.status === 'in_progress' ? 'text-blue-500' :
                          'text-green-500'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {game.team1_player1?.name} {game.team1_player2 && `/ ${game.team1_player2.name}`}
                          <span className="mx-2 text-gray-500">vs</span>
                          {game.team2_player1?.name} {game.team2_player2 && `/ ${game.team2_player2.name}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          Status: {getStatusText(game.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/games/${game.id}`)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Gerenciar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <RectangleStackIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum jogo</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando um novo jogo para a competição.
              </p>
              {competition.status === 'in_progress' && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowGameModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RectangleStackIcon className="h-5 w-5 mr-2" />
                    Novo Jogo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Jogadores */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Jogadores
            </h3>
            {competition.status !== 'finished' && (
              <button
                onClick={() => setShowPlayersModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <UsersIcon className="h-5 w-5 mr-2 text-gray-500" />
                Gerenciar Jogadores
              </button>
            )}
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
        players={players}
        competitionId={id}
        onSubmit={handleCreateGame}
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
