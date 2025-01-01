import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameResultModal from '../components/GameResultModal';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const resultTypes = [
  { id: 'simple', points: 1, label: 'Batida Simples' },
  { id: 'double', points: 2, label: 'Batida Carroça' },
  { id: 'la', points: 3, label: 'Batida Lá e Lô' },
  { id: 'cruzada', points: 4, label: 'Batida Cruzada' },
  { id: 'draw', points: 0, label: 'Empate' },
];

// Função para formatar o número do jogo com dois dígitos
const formatGameNumber = (number) => {
  return String(number).padStart(2, '0');
};

function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [animatedScore1, setAnimatedScore1] = useState(0);
  const [animatedScore2, setAnimatedScore2] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleMatchSubmit = (result) => {
    console.log('Recebendo resultado:', result);
    
    const games = JSON.parse(localStorage.getItem('games') || '[]');
    const gameIndex = games.findIndex(g => g.id === id);
    
    if (gameIndex !== -1) {
      const updatedGame = { ...games[gameIndex] };
      const matchNumber = (updatedGame.matches?.length || 0) + 1;
      
      // Adicionar o resultado da partida
      const newMatch = {
        number: matchNumber,
        team1Score: result.team1Score,
        team2Score: result.team2Score,
        result: {
          type: result.type,
          winningTeam: result.winningTeam,
          points: result.points,
          hasExtraPoint: result.hasExtraPoint
        }
      };
      
      console.log('Nova partida:', newMatch);
      
      updatedGame.matches = [...(updatedGame.matches || []), newMatch];
      
      // Calcular placar total
      const totalScore1 = updatedGame.matches.reduce((sum, m) => sum + m.team1Score, 0);
      const totalScore2 = updatedGame.matches.reduce((sum, m) => sum + m.team2Score, 0);
      
      console.log('Placar total:', { totalScore1, totalScore2 });
      
      // Verificar se o jogo terminou
      if (totalScore1 >= 6 || totalScore2 >= 6) {
        updatedGame.completed = true;
        updatedGame.winner = totalScore1 > totalScore2 ? 1 : 2;
        
        // Verificar se é uma Buchuda (quando uma dupla ganha com 6 ou mais pontos e a outra fica com 0)
        const allTeam1Scores = updatedGame.matches.map(m => m.team1Score);
        const allTeam2Scores = updatedGame.matches.map(m => m.team2Score);
        const team1HasPoints = allTeam2Scores.some(score => score > 0);
        const team2HasPoints = allTeam1Scores.some(score => score > 0);

        if (totalScore1 >= 6 && totalScore2 === 0) {
          updatedGame.highlight = 'buchuda';
          updatedGame.highlightTeam = 1;
        } else if (totalScore2 >= 6 && totalScore1 === 0) {
          updatedGame.highlight = 'buchuda';
          updatedGame.highlightTeam = 2;
        } else {
          // Verificar se é uma Buchuda de Ré (virada após 5x0)
          const matchHistory = updatedGame.matches;
          const hadFiveZeroTeam1 = matchHistory.some((_, index) => {
            const scoreUntilNow1 = matchHistory.slice(0, index + 1).reduce((sum, m) => sum + m.team1Score, 0);
            const scoreUntilNow2 = matchHistory.slice(0, index + 1).reduce((sum, m) => sum + m.team2Score, 0);
            return scoreUntilNow1 === 5 && scoreUntilNow2 === 0;
          });
          
          const hadFiveZeroTeam2 = matchHistory.some((_, index) => {
            const scoreUntilNow1 = matchHistory.slice(0, index + 1).reduce((sum, m) => sum + m.team1Score, 0);
            const scoreUntilNow2 = matchHistory.slice(0, index + 1).reduce((sum, m) => sum + m.team2Score, 0);
            return scoreUntilNow1 === 0 && scoreUntilNow2 === 5;
          });
          
          if (hadFiveZeroTeam1 && totalScore2 > totalScore1) {
            updatedGame.highlight = 'buchudaRe';
            updatedGame.highlightTeam = 2;
          } else if (hadFiveZeroTeam2 && totalScore1 > totalScore2) {
            updatedGame.highlight = 'buchudaRe';
            updatedGame.highlightTeam = 1;
          }
        }
        
        // Atualizar estatísticas dos jogadores
        const players = JSON.parse(localStorage.getItem('players') || '[]');
        const team1Players = [updatedGame.team1Player1, updatedGame.team1Player2];
        const team2Players = [updatedGame.team2Player1, updatedGame.team2Player2];
        
        const updatedPlayers = players.map(player => {
          const isTeam1 = team1Players.includes(player.id);
          const isTeam2 = team2Players.includes(player.id);
          
          if (!isTeam1 && !isTeam2) return player;
          
          const playerStats = { ...player.stats } || {};
          
          // Inicializar estatísticas se não existirem
          if (!playerStats.buchudas) playerStats.buchudas = 0;
          if (!playerStats.buchudasRecebidas) playerStats.buchudasRecebidas = 0;
          if (!playerStats.buchudasRe) playerStats.buchudasRe = 0;
          if (!playerStats.buchudasReRecebidas) playerStats.buchudasReRecebidas = 0;
          if (!playerStats.wins) playerStats.wins = 0;
          if (!playerStats.losses) playerStats.losses = 0;
          
          // Atualizar estatísticas baseado no resultado
          if (updatedGame.highlight === 'buchuda') {
            if ((isTeam1 && updatedGame.highlightTeam === 1) || (isTeam2 && updatedGame.highlightTeam === 2)) {
              playerStats.buchudas++;
            } else {
              playerStats.buchudasRecebidas++;
            }
          } else if (updatedGame.highlight === 'buchudaRe') {
            if ((isTeam1 && updatedGame.highlightTeam === 1) || (isTeam2 && updatedGame.highlightTeam === 2)) {
              playerStats.buchudasRe++;
            } else {
              playerStats.buchudasReRecebidas++;
            }
          }
          
          // Atualizar vitórias e derrotas
          if ((isTeam1 && updatedGame.winner === 1) || (isTeam2 && updatedGame.winner === 2)) {
            playerStats.wins++;
          } else {
            playerStats.losses++;
          }
          
          return { ...player, stats: playerStats };
        });
        
        localStorage.setItem('players', JSON.stringify(updatedPlayers));
      }
      
      games[gameIndex] = updatedGame;
      localStorage.setItem('games', JSON.stringify(games));
      setGame(updatedGame);
      setIsResultModalOpen(false);
      
      // Se o jogo terminou, navegar de volta após um pequeno delay
      if (updatedGame.completed) {
        setTimeout(() => {
          navigate(`/competitions/${updatedGame.competitionId}`);
        }, 1500);
      }
    }
  };

  const handleStartGame = () => {
    if (!game) return;

    try {
      const games = JSON.parse(localStorage.getItem('games')) || [];
      const gameIndex = games.findIndex(g => g.id === game.id);
      
      if (gameIndex !== -1) {
        const updatedGame = {
          ...game,
          started: true,
          matches: []
        };
        
        games[gameIndex] = updatedGame;
        localStorage.setItem('games', JSON.stringify(games));
        setGame(updatedGame);
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  // Função para obter o nome do jogador
  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Jogador';
  };

  // Calcular os nomes das equipes
  const team1Name = game?.team1?.map(playerId => getPlayerName(playerId))?.join(' & ') || 'Time 1';
  const team2Name = game?.team2?.map(playerId => getPlayerName(playerId))?.join(' & ') || 'Time 2';

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedGames = JSON.parse(localStorage.getItem('games') || '[]');
        const savedPlayers = JSON.parse(localStorage.getItem('players') || '[]');
        
        // Normalizar o ID do jogo atual para string para comparação
        const currentGame = savedGames.find(g => g.id.toString() === id.toString());
        
        if (!currentGame) {
          console.error('Jogo não encontrado');
          navigate('/competitions');
          return;
        }

        // Encontrar todos os jogos da mesma competição para determinar o número do jogo
        const competitionGames = savedGames
          .filter(g => g.competitionId === currentGame.competitionId)
          .map(game => ({
            ...game,
            id: game.id.toString() // Garantir que o ID seja string
          }))
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        const gameIndex = competitionGames.findIndex(g => g.id === currentGame.id);
        currentGame.gameNumber = gameIndex + 1;

        // Carregar os jogadores
        setPlayers(savedPlayers);
        setGame(currentGame);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  useEffect(() => {
    if (!game) return;

    const currentScore1 = game.matches?.reduce((sum, match) => sum + (match?.team1Score || 0), 0) || 0;
    const currentScore2 = game.matches?.reduce((sum, match) => sum + (match?.team2Score || 0), 0) || 0;

    // Animar os pontos com verificações de segurança
    setIsAnimating(true);
    let frame = 0;
    const totalFrames = 20;
    const startScore1 = animatedScore1;
    const startScore2 = animatedScore2;
    
    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 2);
      
      setAnimatedScore1(Math.round(startScore1 + (currentScore1 - startScore1) * easeProgress));
      setAnimatedScore2(Math.round(startScore2 + (currentScore2 - startScore2) * easeProgress));

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  }, [game?.matches, animatedScore1, animatedScore2]);

  const handleResultSubmit = (result) => {
    console.log('=== Início do handleResultSubmit ===');
    console.log('Resultado recebido:', result);

    if (!game || !currentMatch) return;

    const games = JSON.parse(localStorage.getItem('games')) || [];
    const gameIndex = games.findIndex(g => g.id === game.id);
    
    if (gameIndex === -1) return;

    // Encontrar o tipo de resultado para saber a pontuação
    const resultType = resultTypes.find(type => type.id === result.type);
    console.log('Tipo de resultado encontrado:', resultType);
    const basePoints = resultType?.points || 0;
    console.log('Pontos base:', basePoints);

    // Verificar se a partida anterior foi empate
    const matches = game.matches || [];
    console.log('Partidas existentes:', matches);
    
    const lastMatch = matches.length > 0 ? matches[matches.length - 1] : null;
    console.log('Última partida:', lastMatch);
    
    const wasLastMatchDraw = lastMatch?.result?.type === 'draw';
    console.log('Última partida foi empate?', wasLastMatchDraw);
    
    // Calcular pontuação total
    let finalPoints = basePoints;
    let hasExtraPoint = false;

    // Se não for empate e a última partida foi empate, adiciona ponto extra
    if (result.type !== 'draw' && wasLastMatchDraw) {
        finalPoints += 1;
        hasExtraPoint = true;
        console.log('Adicionando ponto extra! Pontuação final:', finalPoints);
    }
    
    console.log('Resumo da pontuação:', {
        basePoints,
        wasLastMatchDraw,
        hasExtraPoint,
        finalPoints,
        resultType: result.type
    });

    // Atualizar a partida atual com o resultado
    const updatedMatch = {
      ...currentMatch,
      completed: true,
      result: {
        type: result.type,
        winningTeam: result.winningTeam,
        points: finalPoints,
        hasExtraPoint
      }
    };

    console.log('Match atualizado:', updatedMatch);

    // Atualizar pontuação da partida atual
    if (result.type === 'draw') {
      updatedMatch.team1Score = basePoints;
      updatedMatch.team2Score = basePoints;
      console.log('Pontuação em caso de empate:', { team1: basePoints, team2: basePoints });
    } else {
      if (result.winningTeam === 1) {
        updatedMatch.team1Score = finalPoints;
        updatedMatch.team2Score = 0;
        console.log('Time 1 venceu com', finalPoints, 'pontos');
      } else if (result.winningTeam === 2) {
        updatedMatch.team1Score = 0;
        updatedMatch.team2Score = finalPoints;
        console.log('Time 2 venceu com', finalPoints, 'pontos');
      }
    }

    console.log('=== Fim da atualização de pontuação ===');

    // Calcular pontuação total após esta partida
    const totalScore1 = game.matches.reduce(
      (sum, match) => match.id === currentMatch.id ? sum : sum + (match?.team1Score || 0),
      0
    ) + updatedMatch.team1Score;

    const totalScore2 = game.matches.reduce(
      (sum, match) => match.id === currentMatch.id ? sum : sum + (match?.team2Score || 0),
      0
    ) + updatedMatch.team2Score;

    // Atualizar o jogo
    const updatedGame = {
      ...game,
      matches: game.matches.map(match =>
        match.id === currentMatch.id ? updatedMatch : match
      )
    };

    // Verificar se alguma equipe atingiu 6 pontos
    if (totalScore1 >= 6 || totalScore2 >= 6) {
      // Encerrar o jogo
      updatedGame.completed = true;
      updatedGame.winner = totalScore1 >= 6 ? 1 : 2;
      updatedGame.finalScore = {
        team1: totalScore1,
        team2: totalScore2
      };
    } else {
      // Criar nova partida
      const newMatchId = `match_${game.id}_${game.matches.length + 1}`;
      const newMatch = {
        id: newMatchId,
        number: game.matches.length + 1,
        result: null,
        team1Score: 0,
        team2Score: 0,
        completed: false
      };
      updatedGame.matches.push(newMatch);
    }

    // Atualizar no localStorage
    games[gameIndex] = updatedGame;
    localStorage.setItem('games', JSON.stringify(games));

    // Disparar evento customizado para atualizar a lista de jogos
    window.dispatchEvent(new Event('gamesUpdated'));

    // Atualizar estado
    setGame(updatedGame);
    setCurrentMatch(updatedGame.completed ? null : updatedGame.matches[updatedGame.matches.length - 1]);
    setIsResultModalOpen(false);

    // Se o jogo foi concluído, voltar para a página da competição
    if (updatedGame.completed) {
      setTimeout(() => {
        navigate(`/competitions/${game.competitionId}`);
      }, 1500); // Pequeno delay para mostrar o resultado final
    }
  };

  const handleDeleteGame = () => {
    try {
      const games = JSON.parse(localStorage.getItem('games') || '[]');
      const updatedGames = games.filter(g => g.id.toString() !== id.toString());
      localStorage.setItem('games', JSON.stringify(updatedGames));
      
      // Disparar evento de atualização
      window.dispatchEvent(new Event('gamesUpdated'));
      
      // Navegar de volta para a página da competição
      navigate(`/competitions/${game.competitionId}`);
    } catch (error) {
      console.error('Erro ao excluir jogo:', error);
      alert('Erro ao excluir jogo. Por favor, tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Jogo não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Voltar
      </button>

      <div className="bg-white shadow rounded-lg p-6">
        {/* Placar Principal */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-between w-full">
            <div className="text-center flex-1">
              <h3 className="text-lg font-semibold mb-2">{team1Name}</h3>
              <div className="text-4xl font-bold text-blue-600">{animatedScore1}</div>
            </div>
            <div className="text-2xl font-bold text-gray-400 px-4">VS</div>
            <div className="text-center flex-1">
              <h3 className="text-lg font-semibold mb-2">{team2Name}</h3>
              <div className="text-4xl font-bold text-blue-600">{animatedScore2}</div>
            </div>
          </div>

          {/* Destaques do Jogo */}
          {game?.completed && game?.highlight && (
            <div className={`mt-4 p-4 rounded-lg text-center w-full ${
              game.highlight === 'buchuda' 
                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                : 'bg-purple-100 text-purple-800 border-2 border-purple-300'
            }`}>
              <div className="text-2xl mb-2">
                {game.highlight === 'buchuda' ? '🏆 Buchuda!' : '🔄 Buchuda de Ré!'}
              </div>
              <p className="text-lg">
                {game.highlight === 'buchuda'
                  ? `${game.highlightTeam === 1 ? team1Name : team2Name} venceu sem deixar o adversário pontuar!`
                  : `${game.highlightTeam === 1 ? team1Name : team2Name} conseguiu uma virada histórica após estar perdendo de 5x0!`}
              </p>
            </div>
          )}
        </div>

        {/* Status do Jogo */}
        <div className="mt-6 w-full">
          {game?.completed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Jogo Encerrado!
              </h3>
              <p className="text-green-700">
                Vencedor: {game.winner === 1 ? team1Name : team2Name}
              </p>
              <p className="text-green-700">
                Placar Final: {animatedScore1} x {animatedScore2}
              </p>
            </div>
          ) : !game?.started ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Jogo não iniciado
                  </h3>
                  <p className="text-yellow-700">
                    Clique no botão ao lado para iniciar o jogo
                  </p>
                </div>
                <button
                  onClick={handleStartGame}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Iniciar Jogo
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700">
                Jogo em andamento - Partida {formatGameNumber(game?.matches?.length || 0)} de no máximo 6
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Partida Atual */}
      {game?.started && !game?.completed && (
        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg my-6">
          <div className="flex justify-between items-center">
            <div className="font-medium">Partida Atual: {formatGameNumber((game.matches?.length || 0) + 1)}</div>
            <button
              onClick={() => setIsResultModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Resultado
            </button>
          </div>
        </div>
      )}

      {/* Partidas Anteriores */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Partidas Anteriores</h3>
        {game?.started && game?.matches && game?.matches.length > 0 ? (
          game.matches.map((match) => (
            <div
              key={`match-${game.id}-${match.number}`}
              className="bg-gray-100 p-4 rounded-lg mb-3"
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">
                  Partida {formatGameNumber(match.number)}
                </div>
                <div className="font-semibold">
                  <span className={match.team1Score > match.team2Score ? 'text-green-600' : ''}>
                    {match.team1Score}
                  </span>
                  {' - '}
                  <span className={match.team2Score > match.team1Score ? 'text-green-600' : ''}>
                    {match.team2Score}
                  </span>
                </div>
              </div>
              {match.result && (
                <div className="mt-2 space-y-1">
                  {match.result.type === 'draw' ? (
                    <div className="text-yellow-600 font-medium">
                      Empate - Próxima partida terá ponto extra!
                    </div>
                  ) : (
                    <>
                      <div className="text-gray-700">
                        <span className="font-medium">
                          {match.result.winningTeam === 1 ? team1Name : team2Name}
                        </span>
                        {' venceu com '}
                        <span className="font-medium text-blue-600">
                          {resultTypes.find(t => t.id === match.result.type)?.label}
                        </span>
                      </div>
                      {match.result.hasExtraPoint && (
                        <div className="text-green-600 text-sm font-medium">
                          +1 ponto extra por empate anterior
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">Nenhuma partida jogada ainda.</p>
        )}
      </div>

      {game && (
        <GameResultModal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          onSubmit={handleMatchSubmit}
          game={game}
        />
      )}
    </div>
  );
}

export default GameDetails;
