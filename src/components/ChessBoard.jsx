import React from 'react';
import Square from './Square';

const ChessBoard = ({ board, playerRole, onMove }) => {
  const handleMove = (source, target) => {
    if (onMove) {
      onMove(source, target);
    }
  };

  return (
    <div 
      data-testid="chess-board"
      className={`chessboard bg-white rounded-lg shadow-md transition-all ${playerRole === 'b' ? 'flipped rotate-180' : ''}`}
    >
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => (
          <Square
            key={`${rowIndex}-${colIndex}`}
            piece={square}
            isLight={(rowIndex + colIndex) % 2 === 0}
            position={{ row: rowIndex, col: colIndex }}
            onMove={handleMove}
            playerRole={playerRole}
          />
        ))
      )}
    </div>
  );
};

export default ChessBoard;