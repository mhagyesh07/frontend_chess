import React from 'react';

const GameControls = ({ isGameOver, onNewGame }) => {
  if (!isGameOver) return null;

  return (
    <button
      onClick={onNewGame}
      className="mt-4 px-4 py-2 bg-brown-dark text-white rounded-lg shadow-md hover:shadow-lg transition-all"
    >
      New Game
    </button>
  );
};

export default GameControls;