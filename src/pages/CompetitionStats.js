import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserGroupIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CompetitionStats() {
  const { id } = useParams();
  const [competitions, setCompetitions] = React.useState([]);
  const [players, setPlayers] = React.useState([]);
  const [games, setGames] = React.useState([]);

  // Carregar dados do localStorage
  React.useEffect(() => {
    const loadedCompetitions = JSON.parse(localStorage.getItem('competitions') || '[]');
    const loadedPlayers = JSON.parse(localStorage.getItem('players') || '[]');
    const loadedGames = JSON.parse(localStorage.getItem('games') || '[]');
    
    setCompetitions(loadedCompetitions);
    setPlayers(loadedPlayers);
    setGames(loadedGames);
  }, []);

  const competition = competitions.find(c => c.id === parseInt(id));

  // Calcular estatísticas
  const calculateStats = () => {
    const competitionGames = games.filter(g => g.competitionId === parseInt(id));
    
    // Estatísticas de jogadores
    const playerStats = {};
    const teamStats = {};
    
    // Inicializar estatísticas dos jogadores
    players.forEach(player => {
      if (player && player.id) {
        playerStats[player.id] = {
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

    return {
      playerStats: playerStatsArray,
      teamStats: teamStatsArray
    };
  };

  const stats = calculateStats();

  if (!competition) {
    return <div>Competição não encontrada</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <Link
          to={`/competitions/${id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Voltar para a Competição
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{competition.name}</h1>
        <p className="text-gray-600">Estatísticas Detalhadas</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ranking de Jogadores */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <UserGroupIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Ranking de Jogadores</h2>
          </div>
          <div className="space-y-4">
            {stats.playerStats.map((player, index) => (
              <div key={player.name} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900 mr-2">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{player.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-green-600 font-medium">{player.wins}V</span>
                    <span className="text-sm text-red-600 font-medium">{player.losses}D</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="block text-gray-400">Jogos</span>
                    <span className="font-medium">{player.gamesPlayed}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Pontos</span>
                    <span className="font-medium">{player.points}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Média</span>
                    <span className="font-medium">{(player.points / player.gamesPlayed).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking de Duplas */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <UserGroupIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Ranking de Duplas</h2>
          </div>
          <div className="space-y-4">
            {stats.teamStats.map((team, index) => (
              <div key={team.players.join('-')} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900 mr-2">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {team.players.join(' & ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-green-600 font-medium">{team.wins}V</span>
                    <span className="text-sm text-red-600 font-medium">{team.losses}D</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="block text-gray-400">Jogos</span>
                    <span className="font-medium">{team.gamesPlayed}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Pontos</span>
                    <span className="font-medium">{team.points}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Média</span>
                    <span className="font-medium">{(team.points / team.gamesPlayed).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
