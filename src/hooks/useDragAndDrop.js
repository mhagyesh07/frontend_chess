import { useState } from 'react';

const useDragAndDrop = () => {
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [sourceSquare, setSourceSquare] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (piece, position) => {
    setDraggedPiece(piece);
    setSourceSquare(position);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
    setSourceSquare(null);
    setIsDragging(false);
  };

  return {
    draggedPiece,
    sourceSquare,
    isDragging,
    handleDragStart,
    handleDragEnd,
  };
};

export default useDragAndDrop;