import React from 'react';
import Piece from './Piece';

const Square = ({ piece, isLight, position, onMove, playerRole }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const sourceSquare = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (sourceSquare && onMove) {
      onMove(sourceSquare, position);
    }
  };

  return (
    <div
      data-testid={`square-${position.row}-${position.col}`}
      className={`square ${isLight ? 'light' : 'dark'}`}
      data-row={position.row}
      data-col={position.col}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {piece && (
        <Piece
          piece={piece}
          position={position}
          isDraggable={playerRole === piece.color}
        />
      )}
    </div>
  );
};

export default Square;