import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import GameModal from '../components/GameModal';
import ChampionsModal from '../components/ChampionsModal';
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
  RectangleStackIcon
} from '@heroicons/react/24/outline';

// Função para gerar UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function CompetitionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showGameModal, setShowGameModal] = useState(false);
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [showChampionsModal, setShowChampionsModal] = useState(false);
  const [champions, setChampions] = useState(null);
  const [competition, setCompetition] = useState(null);

  // Carregar dados do localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedCompetitions = JSON.parse(localStorage.getItem('competitions') || '[]');
        const savedPlayers = JSON.parse(localStorage.getItem('players') || '[]');
        const savedGames = JSON.parse(localStorage.getItem('games') || '[]');
        
        const comp = savedCompetitions.find(c => c.id === parseInt(id));
        if (!comp) {
          console.log('Competição não encontrada');
          navigate('/competitions');
          return;
        }

        // Definir a competição atual
        setCompetition(comp);
        setCompetitions(savedCompetitions);

        // Filtrar apenas os jogadores que estão na competição
        const competitionPlayerIds = comp.players || [];
        const competitionPlayers = savedPlayers.filter(p => competitionPlayerIds.includes(p.id));
        const otherPlayers = savedPlayers.filter(p => !competitionPlayerIds.includes(p.id));
        
        setPlayers(competitionPlayers);
        setAvailablePlayers(otherPlayers);

        // Filtrar e processar os jogos desta competição
        const competitionGames = savedGames
          .filter(g => g.competitionId === parseInt(id))
          .map(game => {
            const totalScore1 = game.matches?.reduce((sum, match) => sum + (match?.team1Score || 0), 0) || 0;
            const totalScore2 = game.matches?.reduce((sum, match) => sum + (match?.team2Score || 0), 0) || 0;
            
            return {
              ...game,
              id: game.id || generateUUID(),
              gameNumber: game.gameNumber,
              score1: totalScore1,
              score2: totalScore2,
              winner: game.winner || (totalScore1 > totalScore2 ? 1 : totalScore2 > totalScore1 ? 2 : null)
            };
          })
          .sort((a, b) => {
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            if (!a.completed && !b.completed) {
              if (a.started !== b.started) {
                return a.started ? 1 : -1;
              }
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

        setGames(competitionGames);
        console.log('Competição carregada:', comp);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, [id, navigate]);

  // Função para formatar o número do jogo com dois dígitos
  const formatGameNumber = (number) => {
    return String(number).padStart(2, '0');
  };

  // Função para obter o nome do jogador
  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Jogador não encontrado';
  };

  // Função para formatar os nomes da dupla
  const formatTeamNames = (teamIds) => {
    if (!teamIds || !Array.isArray(teamIds)) return 'Time não definido';
    const names = teamIds.map(id => getPlayerName(id));
    return names.filter(name => name).join(' & ');
  };

  // Função para calcular estatísticas
  const calculateStats = () => {
    if (!games || !players) {
      return {
        totalGames: 0,
        completedGames: 0,
        inProgressGames: 0,
        notStartedGames: 0,
        totalPoints: 0,
        topPlayer: null,
        playerStats: [],
        teamStats: []
      };
    }

    const competitionGames = games.filter(g => g.competitionId === parseInt(id));
    const totalGames = competitionGames.length;
    const completedGames = competitionGames.filter(game => game.completed).length;
    const inProgressGames = competitionGames.filter(game => game.started && !game.completed).length;
    const notStartedGames = competitionGames.filter(game => !game.started).length;
    
    // Calcular total de pontos
    const totalPoints = competitionGames.reduce((sum, game) => {
      if (!game.score1 || !game.score2) return sum;
      return sum + (game.score1 + game.score2);
    }, 0);
    
    // Estatísticas de jogadores
    const playerStats = {};
    const teamStats = {};
    
    // Inicializar estatísticas dos jogadores
    players.forEach(player => {
      if (player && player.id) {
        playerStats[player.id] = {
          id: player.id,
          name: player.name,
          wins: 0,
          losses: 0,
          points: 0,
          gamesPlayed: 0
        };
      }
    });

    // Calcular estatísticas
    competitionGames.filter(game => game.completed && game.team1 && game.team2).forEach(game => {
      const team1Key = game.team1.sort().join('-');
      const team2Key = game.team2.sort().join('-');
      
      // Inicializar estatísticas das duplas se não existirem
      if (!teamStats[team1Key]) {
        teamStats[team1Key] = {
          players: game.team1
            .map(id => players.find(p => p && p.id === id))
            .filter(Boolean)
            .map(p => p.name),
          wins: 0,
          losses: 0,
          points: 0,
          gamesPlayed: 0
        };
      }
      if (!teamStats[team2Key]) {
        teamStats[team2Key] = {
          players: game.team2
            .map(id => players.find(p => p && p.id === id))
            .filter(Boolean)
            .map(p => p.name),
          wins: 0,
          losses: 0,
          points: 0,
          gamesPlayed: 0
        };
      }

      // Atualizar estatísticas das duplas
      if (teamStats[team1Key] && teamStats[team2Key]) {
        teamStats[team1Key].gamesPlayed++;
        teamStats[team2Key].gamesPlayed++;
        teamStats[team1Key].points += game.score1 || 0;
        teamStats[team2Key].points += game.score2 || 0;

        if (game.winner === 1) {
          teamStats[team1Key].wins++;
          teamStats[team2Key].losses++;
          game.team1.forEach(id => {
            if (playerStats[id]) {
              playerStats[id].wins++;
            }
          });
          game.team2.forEach(id => {
            if (playerStats[id]) {
              playerStats[id].losses++;
            }
          });
        } else if (game.winner === 2) {
          teamStats[team2Key].wins++;
          teamStats[team1Key].losses++;
          game.team2.forEach(id => {
            if (playerStats[id]) {
              playerStats[id].wins++;
            }
          });
          game.team1.forEach(id => {
            if (playerStats[id]) {
              playerStats[id].losses++;
            }
          });
        }
      }

      // Atualizar pontos e jogos dos jogadores
      game.team1.forEach(id => {
        if (playerStats[id]) {
          playerStats[id].points += game.score1 || 0;
          playerStats[id].gamesPlayed++;
        }
      });
      game.team2.forEach(id => {
        if (playerStats[id]) {
          playerStats[id].points += game.score2 || 0;
          playerStats[id].gamesPlayed++;
        }
      });
    });

    // Converter para arrays e ordenar
    const playerStatsArray = Object.values(playerStats)
      .filter(stats => stats && stats.gamesPlayed > 0)
      .sort((a, b) => b.wins - a.wins || b.points - a.points);

    const teamStatsArray = Object.values(teamStats)
      .filter(stats => stats && stats.gamesPlayed > 0)
      .sort((a, b) => b.wins - a.wins || b.points - a.points);

    // Encontrar o jogador com mais vitórias
    let topPlayerId = null;
    let maxWins = 0;
    Object.entries(playerStats).forEach(([id, stats]) => {
      if (stats && stats.wins > maxWins) {
        maxWins = stats.wins;
        topPlayerId = parseInt(id);
      }
    });

    const topPlayer = players.find(p => p && p.id === topPlayerId);

    return {
      totalGames,
      completedGames,
      inProgressGames,
      notStartedGames,
      totalPoints,
      topPlayer: topPlayer ? { name: topPlayer.name, wins: maxWins } : null,
      playerStats: playerStatsArray,
      teamStats: teamStatsArray
    };
  };

  const stats = calculateStats();

  const handleStartCompetition = () => {
    if (!competition.players || competition.players.length < 4) {
      alert('É necessário ter pelo menos 4 jogadores para iniciar a competição.');
      return;
    }

    const updatedCompetition = { ...competition, status: 'in_progress' };
    const updatedCompetitions = competitions.map(c => 
      c.id === parseInt(id) ? updatedCompetition : c
    );
    
    setCompetition(updatedCompetition);
    setCompetitions(updatedCompetitions);
    localStorage.setItem('competitions', JSON.stringify(updatedCompetitions));
  };

  const handleFinishCompetition = () => {
    // Verificar se há jogos não finalizados
    const hasUnfinishedGames = games
      .filter(g => g.competitionId === parseInt(id))
      .some(g => !g.completed);

    if (hasUnfinishedGames) {
      alert('Existem jogos não finalizados. Finalize todos os jogos antes de encerrar a competição.');
      return;
    }

    const updatedCompetition = { ...competition, status: 'finished' };
    const updatedCompetitions = competitions.map(c => 
      c.id === parseInt(id) ? updatedCompetition : c
    );
    
    setCompetition(updatedCompetition);
    setCompetitions(updatedCompetitions);
    localStorage.setItem('competitions', JSON.stringify(updatedCompetitions));
    setShowChampionsModal(true);
  };

  const handleCreateGame = (gameData) => {
    const gameId = generateUUID();
    const timestamp = Date.now();
    
    const newGame = {
      id: gameId,
      competitionId: parseInt(id),
      gameNumber: games.length + 1,
      createdAt: timestamp,
      team1: gameData.team1,
      team2: gameData.team2,
      matches: [
        { id: generateUUID(), team1Score: 0, team2Score: 0 },
        { id: generateUUID(), team1Score: 0, team2Score: 0 },
        { id: generateUUID(), team1Score: 0, team2Score: 0 }
      ],
      completed: false,
      started: false,
      score1: 0,
      score2: 0
    };

    // Atualizar localStorage
    const savedGames = JSON.parse(localStorage.getItem('games') || '[]');
    const updatedGames = [...savedGames, newGame];
    localStorage.setItem('games', JSON.stringify(updatedGames));

    // Atualizar estado local
    setGames(prevGames => [...prevGames, newGame]);
    setShowGameModal(false);
  };

  const handleAddPlayer = (playerId) => {
    const updatedCompetition = {
      ...competition,
      players: [...(competition.players || []), playerId]
    };

    // Atualizar localStorage
    const savedCompetitions = JSON.parse(localStorage.getItem('competitions') || '[]');
    const updatedCompetitions = savedCompetitions.map(c =>
      c.id === competition.id ? updatedCompetition : c
    );
    localStorage.setItem('competitions', JSON.stringify(updatedCompetitions));

    // Atualizar estado
    setCompetition(updatedCompetition);
    setCompetitions(updatedCompetitions);
    
    // Mover jogador da lista de disponíveis para a lista de participantes
    const playerToAdd = availablePlayers.find(p => p.id === playerId);
    if (playerToAdd) {
      setPlayers(prevPlayers => [...prevPlayers, playerToAdd]);
      setAvailablePlayers(prevAvailable => prevAvailable.filter(p => p.id !== playerId));
    }
  };

  const handleRemovePlayer = (playerId) => {
    const updatedCompetition = {
      ...competition,
      players: (competition.players || []).filter(id => id !== playerId)
    };

    // Atualizar localStorage
    const savedCompetitions = JSON.parse(localStorage.getItem('competitions') || '[]');
    const updatedCompetitions = savedCompetitions.map(c =>
      c.id === competition.id ? updatedCompetition : c
    );
    localStorage.setItem('competitions', JSON.stringify(updatedCompetitions));

    // Atualizar estado
    setCompetition(updatedCompetition);
    setCompetitions(updatedCompetitions);
    
    // Mover jogador da lista de participantes para a lista de disponíveis
    const playerToRemove = players.find(p => p.id === playerId);
    if (playerToRemove) {
      setAvailablePlayers(prevAvailable => [...prevAvailable, playerToRemove]);
      setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== playerId));
    }
  };

  const handleCreatePlayer = () => {
    if (!newPlayerName.trim() || !newPlayerPhone.trim()) return;

    const newPlayer = {
      id: generateUUID(),
      name: newPlayerName.trim(),
      phone: newPlayerPhone.trim()
    };

    // Atualizar localStorage
    const savedPlayers = JSON.parse(localStorage.getItem('players') || '[]');
    localStorage.setItem('players', JSON.stringify([...savedPlayers, newPlayer]));

    // Atualizar estado
    setAvailablePlayers([...availablePlayers, newPlayer]);
    setNewPlayerName('');
    setNewPlayerPhone('');
    setIsAddPlayerModalOpen(false);
  };

  // Função para calcular os campeões
  const calculateChampions = () => {
    const competitionGames = games.filter(g => g.competitionId === parseInt(id));
    
    // Estatísticas de jogadores
    const playerStats = {};
    const teamStats = {};
    
    // Inicializar estatísticas dos jogadores
    players.forEach(player => {
      if (player && player.id) {
        playerStats[player.id] = {
          id: player.id,
          name: player.name,
          wins: 0,
          losses: 0,
          points: 0,
          gamesPlayed: 0
        };
      }
    });

    // Calcular estatísticas
    competitionGames.filter(game => game.completed && game.team1 && game.team2).forEach(game => {
      const team1Key = game.team1.sort().join('-');
      const team2Key = game.team2.sort().join('-');
      
      // Inicializar estatísticas das duplas se não existirem
      if (!teamStats[team1Key]) {
        teamStats[team1Key] = {
          players: game.team1
            .map(id => players.find(p => p && p.id === id))
            .filter(Boolean)
            .map(p => p.name),
          wins: 0,
          losses: 0,
          points: 0,
          gamesPlayed: 0
        };
      }
      if (!teamStats[team2Key]) {
        teamStats[team2Key] = {
          players: game.team2
            .map(id => players.find(p => p && p.id === id))
            .filter(Boolean)
            .map(p => p.name),
          wins: 0,
          losses: 0,
          points: 0,
          gamesPlayed: 0
        };
      }

      // Atualizar estatísticas
      teamStats[team1Key].gamesPlayed++;
      teamStats[team2Key].gamesPlayed++;
      teamStats[team1Key].points += game.score1 || 0;
      teamStats[team2Key].points += game.score2 || 0;

      if (game.winner === 1) {
        teamStats[team1Key].wins++;
        teamStats[team2Key].losses++;
        game.team1.forEach(id => {
          if (playerStats[id]) {
            playerStats[id].wins++;
          }
        });
        game.team2.forEach(id => {
          if (playerStats[id]) {
            playerStats[id].losses++;
          }
        });
      } else if (game.winner === 2) {
        teamStats[team2Key].wins++;
        teamStats[team1Key].losses++;
        game.team2.forEach(id => {
          if (playerStats[id]) {
            playerStats[id].wins++;
          }
        });
        game.team1.forEach(id => {
          if (playerStats[id]) {
            playerStats[id].losses++;
          }
        });
      }

      // Atualizar pontos dos jogadores
      game.team1.forEach(id => {
        if (playerStats[id]) {
          playerStats[id].points += game.score1 || 0;
          playerStats[id].gamesPlayed++;
        }
      });
      game.team2.forEach(id => {
        if (playerStats[id]) {
          playerStats[id].points += game.score2 || 0;
          playerStats[id].gamesPlayed++;
        }
      });
    });

    // Ordenar jogadores por vitórias e pontos
    const sortedPlayers = Object.values(playerStats)
      .filter(stats => stats && stats.gamesPlayed > 0)
      .sort((a, b) => b.wins - a.wins || b.points - a.points);

    // Ordenar duplas por vitórias e pontos
    const sortedTeams = Object.values(teamStats)
      .filter(stats => stats && stats.gamesPlayed > 0)
      .sort((a, b) => b.wins - a.wins || b.points - a.points);

    return {
      topPlayers: sortedPlayers.slice(0, 3), // Top 3 jogadores
      topTeam: sortedTeams[0] // Dupla campeã
    };
  };

  if (!competition) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Botão Voltar */}
      <div className="mb-4">
        <Link
          to="/competitions"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Voltar
        </Link>
      </div>

      {/* Cabeçalho da Competição */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-start">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{competition?.name}</h1>
            <p className="text-gray-600">{competition?.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {new Date(competition?.date).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <UsersIcon className="h-5 w-5 mr-2" />
              {competition?.players?.length || 0} jogadores
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <RectangleStackIcon className="h-5 w-5 mr-2" />
              {games.length} jogos
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Link
              to={`/competitions/${id}/stats`}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full md:w-auto"
            >
              <ChartBarIcon className="h-5 w-5 mr-2 text-gray-500" />
              Ver Estatísticas
            </Link>
            {competition && competition.status === null && (
              <button
                onClick={handleStartCompetition}
                disabled={!competition.players || competition.players.length < 4}
                className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white w-full md:w-auto ${
                  !competition.players || competition.players.length < 4
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
                title={!competition.players || competition.players.length < 4 ? 'É necessário ter pelo menos 4 jogadores para iniciar a competição' : ''}
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                Iniciar Competição
              </button>
            )}
            {competition && competition.status === 'in_progress' && (
              <button
                onClick={handleFinishCompetition}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full md:w-auto"
              >
                <TrophyIcon className="h-5 w-5 mr-2" />
                Encerrar Competição
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Seção de Campeões (apenas para competições finalizadas) */}
      {competition.status === 'finished' && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <TrophyIcon className="h-8 w-8 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Campeões da Competição</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pódio de Jogadores */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pódio Individual</h3>
              <div className="space-y-4">
                {calculateChampions().topPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                      index === 1 ? 'bg-gray-50 border border-gray-200' :
                      'bg-orange-50 border border-orange-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {index === 0 ? '1º' : index === 1 ? '2º' : '3º'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{player.name}</p>
                        <p className="text-sm text-gray-500">
                          {player.wins} vitórias · {player.points} pontos
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <TrophyIcon className="h-6 w-6 text-yellow-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dupla Campeã */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dupla Campeã</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrophyIcon className="h-10 w-10 text-yellow-400" />
                  <div className="text-right">
                    <p className="text-sm text-yellow-600 font-medium">CAMPEÕES</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {calculateChampions().topTeam.players.join(' & ')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Vitórias</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {calculateChampions().topTeam.wins}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Jogos</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {calculateChampions().topTeam.gamesPlayed}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Pontos</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {calculateChampions().topTeam.points}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estatísticas da Dupla */}
              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Aproveitamento</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Vitórias</span>
                      <span>{Math.round((calculateChampions().topTeam.wins / calculateChampions().topTeam.gamesPlayed) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(calculateChampions().topTeam.wins / calculateChampions().topTeam.gamesPlayed) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Média de Pontos</span>
                      <span>{(calculateChampions().topTeam.points / calculateChampions().topTeam.gamesPlayed).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Jogos */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Jogos da Competição
            </h3>
            {competition?.status === 'in_progress' && (
              <button
                onClick={() => setShowGameModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Novo Jogo
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200">
          {games.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhum jogo registrado ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4">
              {games.map((game) => (
                <div key={`game_${game.id}_${game.gameNumber}`} className="bg-white shadow rounded-lg p-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Jogo #{formatGameNumber(game.gameNumber)}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        game.completed 
                          ? 'bg-green-100 text-green-800'
                          : game.started
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {game.completed 
                          ? 'Finalizado' 
                          : game.started
                            ? 'Em andamento'
                            : 'Não Iniciado'}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          {formatTeamNames(game.team1)}
                        </span>
                        <span className={`text-lg font-bold ${game.winner === 1 ? 'text-green-600' : ''}`}>
                          {game.score1}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          {formatTeamNames(game.team2)}
                        </span>
                        <span className={`text-lg font-bold ${game.winner === 2 ? 'text-green-600' : ''}`}>
                          {game.score2}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => navigate(`/games/${game.id}`)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Jogadores */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Jogadores da Competição
            </h3>
            <button
              onClick={() => setIsAddPlayerModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Adicionar Jogador
            </button>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lista de Jogadores da Competição */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Jogadores Participantes</h4>
            <div className="space-y-2">
              {players.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum jogador na competição.</p>
              ) : (
                players.map(player => (
                  <div
                    key={player.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span>{player.name}</span>
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lista de Jogadores Disponíveis */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Jogadores Disponíveis</h4>
            <div className="space-y-2">
              {availablePlayers.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum jogador disponível.</p>
              ) : (
                availablePlayers.map(player => (
                  <div
                    key={player.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span>{player.name}</span>
                    <button
                      onClick={() => handleAddPlayer(player.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Adicionar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar Jogador */}
      {isAddPlayerModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Adicionar Jogador
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">
                  Nome do Jogador
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="playerPhone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="text"
                  id="playerPhone"
                  value={newPlayerPhone}
                  onChange={(e) => setNewPlayerPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddPlayerModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePlayer}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Jogo */}
      <GameModal
        isOpen={showGameModal}
        onClose={() => setShowGameModal(false)}
        onSubmit={handleCreateGame}
        players={players}
      />

      {/* Modal de Campeões */}
      <ChampionsModal
        isOpen={showChampionsModal}
        onClose={() => setShowChampionsModal(false)}
        champions={champions}
      />
    </div>
  );
}

export default CompetitionDetails;
