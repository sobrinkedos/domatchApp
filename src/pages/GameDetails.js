import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameResultModal from '../components/GameResultModal';
import { ArrowLeftIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/outline';
import { getGameById, getPlayerById, finishGame, updateGame } from '../services/supabaseService';

const resultTypes = [
  { id: 'simple', points: 1, label: 'Batida Simples' },
  { id: 'double', points: 2, label: 'Batida Carroça' },
  { id: 'la', points: 3, label: 'Batida Lá e Lô' },
  { id: 'cruzada', points: 4, label: 'Batida Cruzada' },
  { id: 'draw', points: 1, label: 'Empate' },
];

function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar dados do jogo
        const gameData = await getGameById(id);
        if (!gameData) {
          setError('Jogo não encontrado');
          return;
        }

        // Carregar dados dos jogadores do time 1
        const team1Player1 = await getPlayerById(gameData.team1_player1_id);
        const team1Player2 = gameData.team1_player2_id ? await getPlayerById(gameData.team1_player2_id) : null;
        setTeam1Players([team1Player1, team1Player2].filter(Boolean));

        // Carregar dados dos jogadores do time 2
        const team2Player1 = await getPlayerById(gameData.team2_player1_id);
        const team2Player2 = gameData.team2_player2_id ? await getPlayerById(gameData.team2_player2_id) : null;
        setTeam2Players([team2Player1, team2Player2].filter(Boolean));

        setGame(gameData);
        setMatches(Array.isArray(gameData.matches) ? gameData.matches : []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do jogo');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  /**
   * ATENÇÃO: NÃO MODIFICAR ESTA FUNÇÃO SEM AUTORIZAÇÃO!
   * Esta função é responsável por registrar os resultados das partidas e calcular vitórias especiais.
   * Última atualização: 04/01/2025
   * Autor: Codeium
   */
  const handleMatchSubmit = async (result) => {
    try {
      // Encontrar o tipo de resultado
      const resultType = resultTypes.find(t => t.id === result.type);
      
      // Verificar se a última partida foi empate
      const lastMatch = matches[matches.length - 1];
      const wasLastMatchDraw = lastMatch?.type === 'draw';
      
      // Calcular pontos
      let points = resultType.points;
      let hasExtraPoint = false;

      // Se não for empate e a última partida foi empate, adiciona ponto extra
      if (result.type !== 'draw' && wasLastMatchDraw) {
        points += 1;
        hasExtraPoint = true;
      }
      
      // Criar novo registro de partida
      const newMatch = {
        type: result.type,
        points,
        winningTeam: result.type === 'draw' ? null : result.winningTeam,
        hasExtraPoint,
        timestamp: new Date().toISOString()
      };

      // Atualizar lista de partidas
      const newMatches = [...matches, newMatch];
      
      // Calcular pontuação total
      const newTeam1Score = newMatches.reduce((total, match) => {
        if (match.winningTeam === 1) return total + match.points;
        return total;
      }, 0);

      const newTeam2Score = newMatches.reduce((total, match) => {
        if (match.winningTeam === 2) return total + match.points;
        return total;
      }, 0);
      
      // Verificar se algum time atingiu 6 pontos
      const gameFinished = newTeam1Score >= 6 || newTeam2Score >= 6;
      const winnerTeam = gameFinished ? (newTeam1Score >= 6 ? 1 : 2) : null;
      
      let updatedGameData;
      if (gameFinished) {
        console.log('Finalizando jogo com:', { 
          gameId: game.id, 
          winnerTeam, 
          newTeam1Score, 
          newTeam2Score, 
          newMatches,
          matchesState: matches
        }); // Log para debug

        updatedGameData = await finishGame(game.id, winnerTeam, newTeam1Score, newTeam2Score, newMatches);
      } else {
        updatedGameData = await updateGame(game.id, { 
          status: 'in_progress',
          team1_score: newTeam1Score,
          team2_score: newTeam2Score,
          matches: newMatches
        });
      }

      // Recarregar os dados do jogo para obter as informações atualizadas
      if (!updatedGameData) {
        updatedGameData = await getGameById(game.id);
      }

      console.log('Dados atualizados do jogo:', updatedGameData); // Log para debug

      setGame(updatedGameData);
      setMatches(updatedGameData.matches || newMatches);
      setIsResultModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error);
      // TODO: Adicionar toast de erro
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!game) return null;

  const formatMatchType = (type) => {
    const resultType = resultTypes.find(t => t.id === type);
    return resultType ? resultType.label : type;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Detalhes do Jogo</h1>
      </div>

      {/* Status do Jogo */}
      {game.status === 'finished' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <TrophyIcon className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-lg font-medium text-green-900">
                Jogo Finalizado! Time {game.winner_team} venceu por {game.winner_team === 1 ? game.team1_score : game.team2_score} a {game.winner_team === 1 ? game.team2_score : game.team1_score}
              </h2>
            </div>
          </div>

          {/* Vitórias Especiais */}
          {(game.is_buchuda || game.is_buchuda_de_re) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <FireIcon className="h-6 w-6 text-yellow-600 mr-2" />
                <div>
                  <h2 className="text-lg font-medium text-yellow-900">
                    {game.is_buchuda && 'Buchuda!'} 
                    {game.is_buchuda_de_re && 'Buchuda de Ré!'}
                  </h2>
                  <p className="text-sm text-yellow-700 mt-1">
                    {game.is_buchuda && 'Time vencedor ganhou sem que o adversário fizesse pontos!'}
                    {game.is_buchuda_de_re && 'Time vencedor virou o jogo após estar perdendo de 5x0!'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Informações do Jogo */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Placar</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time 1 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Time 1</h3>
              <ul className="space-y-2">
                {team1Players.map((player, index) => (
                  <li key={index} className="text-gray-600">{player.name}</li>
                ))}
              </ul>
              <p className="mt-2 text-2xl font-bold text-blue-600">{game.team1_score || 0} pontos</p>
            </div>

            {/* Time 2 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Time 2</h3>
              <ul className="space-y-2">
                {team2Players.map((player, index) => (
                  <li key={index} className="text-gray-600">{player.name}</li>
                ))}
              </ul>
              <p className="mt-2 text-2xl font-bold text-blue-600">{game.team2_score || 0} pontos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partidas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Partidas</h2>
          {game.status !== 'finished' && (
            <button
              onClick={() => setIsResultModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Registrar Partida
            </button>
          )}
        </div>
        <div className="border-t border-gray-200">
          {matches.length === 0 ? (
            <div className="px-4 py-5 text-center text-gray-500">
              Nenhuma partida registrada
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {matches.map((match, index) => (
                <li key={index} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">
                        {match.winningTeam ? `Time ${match.winningTeam} venceu` : 'Empate'}
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({formatMatchType(match.type)})
                        {match.hasExtraPoint && (
                          <span className="text-green-600 ml-2">
                            +1 ponto bônus
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="font-medium text-blue-600">
                      {match.type === 'draw' ? (
                        'Sem pontos'
                      ) : (
                        <>+{match.points} {match.points === 1 ? 'ponto' : 'pontos'}</>
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal de Resultado */}
      <GameResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        onSubmit={handleMatchSubmit}
        resultTypes={resultTypes}
        game={game}
        team1Players={team1Players}
        team2Players={team2Players}
      />
    </div>
  );
}

export default GameDetails;
