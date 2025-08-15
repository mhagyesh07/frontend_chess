import React from 'react';

const GameStatus = ({ playerRole, gameMessage }) => {
  const getRoleDisplay = () => {
    if (playerRole === 'w') return 'You are playing as White';
    if (playerRole === 'b') return 'You are playing as Black';
    return 'You are a spectator';
  };

  return (
    <div className="text-center">
      <div className="text-white mb-4 text-xl font-bold">
        {getRoleDisplay()}
      </div>
      {gameMessage && (
        <div className="text-white mt-4 text-lg font-semibold">
          {gameMessage}
        </div>
      )}
    </div>
  );
};

export default GameStatus;