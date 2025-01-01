import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrophyIcon,
  CheckCircleIcon,
  ClockIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

function Dashboard() {
  const [competitions, setCompetitions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    topPlayers: {
      byBuchudas: [],
      byBuchudasRe: [],
      byWins: []
    },
    topTeams: {
      byBuchudas: [],
      byBuchudasRe: [],
      byWins: []
    },
    generalStats: {
      totalGames: 0,
      totalPlayers: 0,
      totalPoints: 0,
      totalMatches: 0,
      averagePointsPerGame: 0,
      averageMatchesPerGame: 0
    },
    recentGames: []
  });

  useEffect(() => {
    // Carregar dados do localStorage
    const loadedCompetitions = JSON.parse(localStorage.getItem('competitions') || '[]');
    const loadedPlayers = JSON.parse(localStorage.getItem('players') || '[]');
    const loadedGames = JSON.parse(localStorage.getItem('games') || '[]');

    setCompetitions(loadedCompetitions);
    setPlayers(loadedPlayers);
    setGames(loadedGames);

    const stats = calculateGlobalStats(loadedPlayers, loadedGames);
    setGlobalStats(stats);
  }, []);

  const calculateGlobalStats = (allPlayers = [], allGames = []) => {
    // Processa estatísticas dos jogadores
    const playersStats = {};
    
    // Inicializa estatísticas dos jogadores
    allPlayers.forEach(player => {
      if (player && player.id) {
        playersStats[player.id] = {
          id: player.id,
          name: player.name || 'Jogador sem nome',
          buchudas: 0,
          buchudasRe: 0,
          wins: 0,
          losses: 0,
          points: 0,
          gamesPlayed: 0
        };
      }
    });

    // Processa estatísticas das duplas
    const teams = {};
    let totalPoints = 0;
    let totalMatches = 0;

    allGames.forEach(game => {
      if (!game?.completed || !game.team1 || !game.team2) return;

      // Calcula pontos totais e partidas
      totalMatches += game.matches?.length || 0;
      const team1Score = game.matches?.reduce((sum, match) => sum + (match.team1Score || 0), 0) || 0;
      const team2Score = game.matches?.reduce((sum, match) => sum + (match.team2Score || 0), 0) || 0;
      totalPoints += team1Score + team2Score;

      // Atualiza estatísticas dos jogadores
      const processPlayerStats = (teamIds, isWinner, isBuchuda, isBuchudaRe) => {
        teamIds.forEach(playerId => {
          if (playersStats[playerId]) {
            playersStats[playerId].gamesPlayed++;
            if (isWinner) {
              playersStats[playerId].wins++;
              if (isBuchuda) playersStats[playerId].buchudas++;
              if (isBuchudaRe) playersStats[playerId].buchudasRe++;
            } else {
              playersStats[playerId].losses++;
            }
          }
        });
      };

      const processTeam = (teamIds, isWinner) => {
        if (!Array.isArray(teamIds)) return;
        const teamKey = [...teamIds].sort().join('-');
        const teamPlayerNames = teamIds.map(id => {
          const player = allPlayers.find(p => p?.id === id);
          return player ? player.name : 'Jogador não encontrado';
        });

        if (!teams[teamKey]) {
          teams[teamKey] = {
            players: teamPlayerNames,
            buchudas: 0,
            buchudasRe: 0,
            wins: 0
          };
        }

        if (isWinner) {
          teams[teamKey].wins++;
          if (game.highlight === 'buchuda') teams[teamKey].buchudas++;
          if (game.highlight === 'buchudaRe') teams[teamKey].buchudasRe++;
        }
      };

      const isBuchuda = game.highlight === 'buchuda';
      const isBuchudaRe = game.highlight === 'buchudaRe';
      
      processPlayerStats(game.team1, game.winner === 1, isBuchuda, isBuchudaRe);
      processPlayerStats(game.team2, game.winner === 2, isBuchuda, isBuchudaRe);
      processTeam(game.team1, game.winner === 1);
      processTeam(game.team2, game.winner === 2);
    });

    const playersArray = Object.values(playersStats);
    const teamsArray = Object.values(teams);
    const completedGames = allGames.filter(game => game?.completed);
    const recentGames = [...completedGames]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5)
      .map(game => ({
        ...game,
        team1Names: (game.team1 || []).map(id => allPlayers.find(p => p?.id === id)?.name || 'Jogador não encontrado').join(' & '),
        team2Names: (game.team2 || []).map(id => allPlayers.find(p => p?.id === id)?.name || 'Jogador não encontrado').join(' & '),
        score1: game.matches?.reduce((sum, match) => sum + (match.team1Score || 0), 0) || 0,
        score2: game.matches?.reduce((sum, match) => sum + (match.team2Score || 0), 0) || 0
      }));

    return {
      topPlayers: {
        byBuchudas: [...playersArray].sort((a, b) => b.buchudas - a.buchudas).slice(0, 3),
        byBuchudasRe: [...playersArray].sort((a, b) => b.buchudasRe - a.buchudasRe).slice(0, 3),
        byWins: [...playersArray].sort((a, b) => b.wins - a.wins).slice(0, 3)
      },
      topTeams: {
        byBuchudas: [...teamsArray].sort((a, b) => b.buchudas - a.buchudas).slice(0, 3),
        byBuchudasRe: [...teamsArray].sort((a, b) => b.buchudasRe - a.buchudasRe).slice(0, 3),
        byWins: [...teamsArray].sort((a, b) => b.wins - a.wins).slice(0, 3)
      },
      generalStats: {
        totalGames: completedGames.length,
        totalPlayers: allPlayers.length,
        totalPoints,
        totalMatches,
        averagePointsPerGame: completedGames.length ? (totalPoints / completedGames.length).toFixed(1) : 0,
        averageMatchesPerGame: completedGames.length ? (totalMatches / completedGames.length).toFixed(1) : 0
      },
      recentGames
    };
  };

  if (!globalStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral das estatísticas do Dominó Score</p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Destaques de Buchudas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
            <h3 className="text-lg font-semibold text-yellow-800"> Buchudas</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Jogadores com mais Buchudas */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Top Jogadores</h4>
                {globalStats.topPlayers.byBuchudas.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{player.name}</span>
                    </div>
                    <span className="font-semibold text-yellow-600">{player.buchudas}</span>
                  </div>
                ))}
              </div>

              {/* Duplas com mais Buchudas */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Top Duplas</h4>
                {globalStats.topTeams.byBuchudas.map((team, index) => (
                  <div key={team.players.join('-')} className="flex items-center justify-between mb-2">
                    <div className="flex items-center flex-1 mr-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-gray-700 truncate">{team.players.join(' & ')}</span>
                    </div>
                    <span className="font-semibold text-yellow-600">{team.buchudas}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Destaques de Buchudas de Ré */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800"> Buchudas de Ré</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Jogadores com mais Buchudas de Ré */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Top Jogadores</h4>
                {globalStats.topPlayers.byBuchudasRe.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        index === 0 ? 'bg-purple-100 text-purple-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-pink-100 text-pink-800'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{player.name}</span>
                    </div>
                    <span className="font-semibold text-purple-600">{player.buchudasRe}</span>
                  </div>
                ))}
              </div>

              {/* Duplas com mais Buchudas de Ré */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Top Duplas</h4>
                {globalStats.topTeams.byBuchudasRe.map((team, index) => (
                  <div key={team.players.join('-')} className="flex items-center justify-between mb-2">
                    <div className="flex items-center flex-1 mr-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        index === 0 ? 'bg-purple-100 text-purple-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-pink-100 text-pink-800'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-gray-700 truncate">{team.players.join(' & ')}</span>
                    </div>
                    <span className="font-semibold text-purple-600">{team.buchudasRe}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Competições</p>
              <p className="text-2xl font-semibold text-gray-900">{competitions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jogadores</p>
              <p className="text-2xl font-semibold text-gray-900">{players.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jogos</p>
              <p className="text-2xl font-semibold text-gray-900">{games.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jogos Finalizados</p>
              <p className="text-2xl font-semibold text-gray-900">{games.filter(game => game.completed).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800">Estatísticas Gerais</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Totais</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de Jogos</span>
                  <span className="font-semibold">{globalStats.generalStats.totalGames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de Jogadores</span>
                  <span className="font-semibold">{globalStats.generalStats.totalPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de Pontos</span>
                  <span className="font-semibold">{globalStats.generalStats.totalPoints}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Médias</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pontos por Jogo</span>
                  <span className="font-semibold">{globalStats.generalStats.averagePointsPerGame}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partidas por Jogo</span>
                  <span className="font-semibold">{globalStats.generalStats.averageMatchesPerGame}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Top Vencedores</h4>
              <div className="space-y-2">
                {globalStats.topPlayers.byWins.map((player, index) => (
                  <div key={player.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-gray-600">{player.name}</span>
                    </div>
                    <span className="font-semibold">{player.wins} vitórias</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jogos Recentes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
          <h3 className="text-lg font-semibold text-green-800">Jogos Recentes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {globalStats.recentGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {game.completed ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : game.started ? (
                      <ClockIcon className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <NoSymbolIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {game.team1Names} vs {game.team2Names}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(game.updatedAt || game.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  <span className={`${game.winner === 1 ? 'text-green-600' : ''}`}>{game.score1}</span>
                  <span className="mx-2 text-gray-400">x</span>
                  <span className={`${game.winner === 2 ? 'text-green-600' : ''}`}>{game.score2}</span>
                  {game.highlight && (
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      game.highlight === 'buchuda' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {game.highlight === 'buchuda' ? 'Buchuda' : 'Buchuda de Ré'}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {globalStats.recentGames.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Nenhum jogo finalizado ainda
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
