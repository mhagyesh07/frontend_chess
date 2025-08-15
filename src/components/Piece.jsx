import React from 'react';

const Piece = ({ piece, position, isDraggable }) => {
  const getPieceUnicode = (piece) => {
    const unicodePieces = {
      p: "♙",
      r: "♖",
      n: "♘",
      b: "♗",
      q: "♕",
      k: "♔",
      P: "♟",
      R: "♜",
      N: "♞",
      B: "♝",
      Q: "♛",
      K: "♚",
    };
    return unicodePieces[piece.type] || "";
  };

  const handleDragStart = (e) => {
    if (isDraggable) {
      e.dataTransfer.setData('text/plain', JSON.stringify(position));
    }
  };

  const handleDragEnd = (e) => {
    // Clean up after drag
  };

  return (
    <div
      className={`piece ${piece.color === 'w' ? 'white' : 'black'} ${isDraggable ? 'draggable' : ''}`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {getPieceUnicode(piece)}
    </div>
  );
};

export default Piece;