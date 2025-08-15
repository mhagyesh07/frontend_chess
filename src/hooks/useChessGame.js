import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

const useChessGame = (socket) => {
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState([]);
  const [playerRole, setPlayerRole] = useState(null);
  const [gameMessage, setGameMessage] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameSessionInfo, setGameSessionInfo] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Initialize board
    setBoard(chess.board());

    // Socket event listeners
    socket.on('playerRole', (role) => {
      console.log('useChessGame received playerRole:', role);
      setPlayerRole(role);
    });

    socket.on('spectatorRole', () => {
      setPlayerRole(null);
    });

    socket.on('boardState', (fen) => {
      chess.load(fen);
      setBoard(chess.board());
    });

    socket.on('move', (move) => {
      const result = chess.move(move);
      if (result) {
        setBoard(chess.board());
      }
    });

    socket.on('moveHistory', (moves) => {
      setMoveHistory(moves);
    });

    socket.on('gameSessionInfo', (info) => {
      setGameSessionInfo(info);
    });

    socket.on('gameOver', (data) => {
      setGameMessage(data.message || data);
      setIsGameOver(true);
    });

    socket.on('newGameStarted', () => {
      chess.reset();
      setBoard(chess.board());
      setGameMessage('');
      setIsGameOver(false);
      setMoveHistory([]);
    });

    return () => {
      socket.off('playerRole');
      socket.off('spectatorRole');
      socket.off('boardState');
      socket.off('move');
      socket.off('moveHistory');
      socket.off('gameSessionInfo');
      socket.off('gameOver');
      socket.off('newGameStarted');
    };
  }, [socket, chess]);

  const makeMove = (source, target) => {
    const move = {
      from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
      to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
      promotion: 'q',
    };

    socket.emit('move', move);
  };

  const startNewGame = () => {
    socket.emit('newGame');
  };

  return {
    board,
    playerRole,
    gameMessage,
    isGameOver,
    moveHistory,
    gameSessionInfo,
    makeMove,
    startNewGame,
  };
};

export default useChessGame;