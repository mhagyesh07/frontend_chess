import React from 'react';

const MoveHistory = ({ moves = [], whitePlayer, blackPlayer }) => {
  // Group moves by move number (each move number has white and black moves)
  const groupedMoves = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    const whiteMove = moves[i];
    const blackMove = moves[i + 1];
    
    groupedMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: whiteMove,
      black: blackMove
    });
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getPlayerName = (player) => {
    if (player === 'white') return whitePlayer || 'White';
    if (player === 'black') return blackPlayer || 'Black';
    return player;
  };

  if (moves.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 w-80 max-h-96">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
          Move History
        </h3>
        <div className="text-gray-500 text-center py-8">
          No moves yet. Game will begin when both players are ready.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-80 max-h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
        Move History
      </h3>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {groupedMoves.map((moveGroup) => (
            <div key={moveGroup.moveNumber} className="flex items-center text-sm">
              {/* Move number */}
              <div className="w-8 text-gray-600 font-medium text-right mr-3">
                {moveGroup.moveNumber}.
              </div>
              
              {/* White move */}
              <div className="flex-1 flex items-center">
                {moveGroup.white && (
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                      {moveGroup.white.notation}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(moveGroup.white.timestamp)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Black move */}
              <div className="flex-1 flex items-center">
                {moveGroup.black && (
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-gray-800 bg-gray-800 text-white px-2 py-1 rounded">
                      {moveGroup.black.notation}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(moveGroup.black.timestamp)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer with move count */}
      <div className="border-t pt-2 mt-2">
        <div className="text-xs text-gray-500 text-center">
          Total moves: {moves.length}
          {whitePlayer && blackPlayer && (
            <span className="ml-2">
              • {getPlayerName('white')} vs {getPlayerName('black')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoveHistory;