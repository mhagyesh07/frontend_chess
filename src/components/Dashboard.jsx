import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useSocket from '../hooks/useSocket';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected, connectionError } = useSocket();
  // Removed unused state: gameState, players
  const [gameSessionInfo, setGameSessionInfo] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'white', 'black', 'spectator', or null
  const [userStats, setUserStats] = useState(null);
  const requestGameState = useCallback(() => { // Wrapped in useCallback
    if (socket && isConnected) {
      socket.emit('requestGameState');
    } else {
      console.error('Not connected to server');
    }
  }, [socket, isConnected]); // Added dependencies for useCallback

  useEffect(() => {
    if (!socket) return;

    // Socket event listeners
    socket.on('gameSessionInfo', (info) => {
      console.log('Game session info received:', info);
      setGameSessionInfo(info);
    });

    socket.on('playerRole', (role) => {
      console.log('Player role assigned:', role);
      setUserRole(role === 'w' ? 'white' : role === 'b' ? 'black' : null);
    });

    socket.on('spectatorRole', () => {
      console.log('Assigned as spectator');
      setUserRole('spectator');
    });

    socket.on('playerJoined', (data) => {
      console.log('Player joined:', data);
      // Removed setPlayers as it's not used
      
      // Force refresh game state when a new player joins
      setTimeout(() => {
        console.log('Requesting game state after player joined');
        requestGameState();
      }, 500);
    });

    socket.on('playerReconnected', (data) => {
      console.log('Player reconnected:', data);
      // Removed setPlayers as it's not used
    });

    socket.on('playerLeft', (data) => {
      console.log('Player left:', data);
      // Removed setPlayers as it's not used
    });

    socket.on('boardState', (fen) => {
      console.log('Board state updated:', fen);
      // Removed setGameState as it's not used
    });

    socket.on('moveDetails', (data) => {
      console.log('Move details:', data);
    });

    socket.on('gameOver', (data) => {
      console.log('Game over:', data);
      // Removed setGameState as it's not used
      // Refresh user stats after game completion
      setTimeout(() => {
        requestUserStats();
      }, 1000);
    });

    socket.on('newGameStarted', () => {
      console.log('New game started');
      // Removed setGameState as it's not used
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Request user stats when connected
    if (isConnected && user) {
      requestUserStats();
    }

    return () => {
      socket.off('gameSessionInfo');
      socket.off('playerRole');
      socket.off('spectatorRole');
      socket.off('playerJoined');
      socket.off('playerReconnected');
      socket.off('playerLeft');
      socket.off('boardState');
      socket.off('moveDetails');
      socket.off('gameOver');
      socket.off('newGameStarted');
      socket.off('error');
    };
  }, [socket, isConnected, user, requestGameState]); // Added requestGameState to dependency array

  // Debug effect to log when gameSessionInfo changes
  useEffect(() => {
    if (gameSessionInfo) {
      console.log('GameSessionInfo state updated:', gameSessionInfo);
      console.log('Current user:', user?.username);
      console.log('User role:', userRole);
    }
  }, [gameSessionInfo, user, userRole]);

  // Removed unused function: sendMove
  // eslint-disable-next-line no-use-before-define
  
  const startNewGame = () => {
    if (socket && isConnected) {
      socket.emit('newGame');
    } else {
      console.error('Not connected to server');
    }
  };

  // const requestGameState = useCallback(() => { // Wrapped in useCallback
  //   if (socket && isConnected) {
  //     socket.emit('requestGameState');
  //   } else {
  //     console.error('Not connected to server');
  //   }
  // }, [socket, isConnected]); // Added dependencies for useCallback

  const requestUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('User stats received:', data);
        setUserStats(data.data.user);
      } else {
        console.error('Failed to fetch user stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Determine what actions are available based on game state and user role
  const getAvailableActions = () => {
    if (!gameSessionInfo) return [];

    const actions = [];
    const isWhitePlayer = user?.username === gameSessionInfo.whitePlayer;
    const isBlackPlayer = user?.username === gameSessionInfo.blackPlayer;
    const isPlayer = isWhitePlayer || isBlackPlayer;

    console.log('Game session info for actions:', JSON.stringify({
      status: gameSessionInfo.status,
      whitePlayer: gameSessionInfo.whitePlayer,
      blackPlayer: gameSessionInfo.blackPlayer,
      currentUser: user?.username,
      userRole: userRole,
      isWhitePlayer,
      isBlackPlayer
    }, null, 2));

    // If no players in session, anyone can start a new game
    if (gameSessionInfo.status === 'waiting' && !gameSessionInfo.whitePlayer && !gameSessionInfo.blackPlayer) {
      actions.push({
        type: 'start',
        label: 'Start New Game',
        description: 'Create a new game and become the white player',
        color: 'bg-green-600 hover:bg-green-700'
      });
    }
    // If there's a waiting game with only white player, others can join as black
    else if (gameSessionInfo.status === 'waiting' && gameSessionInfo.whitePlayer && !gameSessionInfo.blackPlayer) {
      if (!isWhitePlayer) {
        actions.push({
          type: 'join',
          label: 'Join Game as Black',
          description: `Join ${gameSessionInfo.whitePlayer}'s game as the black player`,
          color: 'bg-blue-600 hover:bg-blue-700'
        });
      } else {
        // White player is waiting for black player
        actions.push({
          type: 'waiting',
          label: 'Waiting for Opponent',
          description: 'Waiting for another player to join as black',
          color: 'bg-yellow-600 cursor-not-allowed',
          disabled: true
        });
      }
    }
    // If game is active with both players
    else if (gameSessionInfo.status === 'active' && gameSessionInfo.whitePlayer && gameSessionInfo.blackPlayer) {
      if (isPlayer) {
        // Current user is one of the players
        actions.push({
          type: 'play',
          label: 'Play Chess',
          description: `You are playing as ${isWhitePlayer ? 'White' : 'Black'}`,
          color: 'bg-blue-600 hover:bg-blue-700'
        });
      } else {
        // Current user can spectate
        actions.push({
          type: 'spectate',
          label: 'Join as Spectator',
          description: `Watch ${gameSessionInfo.whitePlayer} vs ${gameSessionInfo.blackPlayer}`,
          color: 'bg-purple-600 hover:bg-purple-700'
        });
      }
    }

    // If game is completed, anyone can start a new game
    if (gameSessionInfo.status === 'completed') {
      actions.push({
        type: 'start',
        label: 'Start New Game',
        description: 'Start a fresh game',
        color: 'bg-green-600 hover:bg-green-700'
      });
    }

    return actions;
  };

  const handleAction = (actionType) => {
    switch (actionType) {
      case 'start':
        startNewGame();
        break;
      case 'join':
        // For joining, we don't need to do anything special
        // The user is already connected and will be assigned the black role
        // Just refresh the game state to make sure we have the latest info
        requestGameState();
        break;
      case 'spectate':
        // For spectating, same as join - user is already connected
        requestGameState();
        break;
      case 'play':
        window.location.href = '/game';
        break;
      case 'waiting':
        // Do nothing for waiting state
        break;
      default:
        console.log('Unknown action:', actionType);
    }
  };

  const getStatusIcon = () => {
    if (isConnected) {
      return <span className="w-5 h-5 text-green-500 text-lg">✓</span>;
    } else if (connectionError) {
      return <span className="w-5 h-5 text-red-500 text-lg">✗</span>;
    } else {
      return <span className="w-5 h-5 text-yellow-500 text-lg animate-spin">⟳</span>;
    }
  };

  const getStatusColor = () => {
    if (isConnected) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (connectionError) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getConnectionStatus = () => {
    if (isConnected) return 'connected';
    if (connectionError) return 'error';
    return 'connecting';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with connection status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chess Game Dashboard</h1>
              {user && <p className="text-gray-600 mt-1">Welcome, {user.username}!</p>}
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="font-medium capitalize">{getConnectionStatus()}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {connectionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 text-red-500 text-lg">⚠</span>
              <span className="font-medium text-red-800">Connection Error</span>
            </div>
            <p className="text-red-700 mt-1">{connectionError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        )}

        {/* User Stats */}
        {userStats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <h3 className="font-medium text-gray-700 mb-1">Games Played</h3>
                <p className="text-2xl font-bold text-blue-600">{userStats.gameStats?.gamesPlayed || 0}</p>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-700 mb-1">Wins</h3>
                <p className="text-2xl font-bold text-green-600">{userStats.gameStats?.wins || 0}</p>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-700 mb-1">Losses</h3>
                <p className="text-2xl font-bold text-red-600">{userStats.gameStats?.losses || 0}</p>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-700 mb-1">Draws</h3>
                <p className="text-2xl font-bold text-yellow-600">{userStats.gameStats?.draws || 0}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-medium text-gray-700 mb-1">Win Rate</h3>
              <p className="text-lg font-semibold text-purple-600">{userStats.winRate || 0}%</p>
            </div>
          </div>
        )}

        {/* Game Session Info */}
        {gameSessionInfo && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Game Session</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Game ID</h3>
                <p className="text-gray-900 font-mono text-sm">{gameSessionInfo.gameId}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Status</h3>
                <p className={`capitalize font-semibold ${
                  gameSessionInfo.status === 'active' ? 'text-green-600' :
                  gameSessionInfo.status === 'waiting' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>{gameSessionInfo.status}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">White Player</h3>
                <p className={`${gameSessionInfo.whitePlayer === user?.username ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}>
                  {gameSessionInfo.whitePlayer || 'Waiting...'}
                  {gameSessionInfo.whitePlayer === user?.username && ' (You)'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Black Player</h3>
                <p className={`${gameSessionInfo.blackPlayer === user?.username ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}>
                  {gameSessionInfo.blackPlayer || 'Waiting...'}
                  {gameSessionInfo.blackPlayer === user?.username && ' (You)'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Your Role</h3>
                <p className={`capitalize font-semibold ${
                  userRole === 'white' ? 'text-white bg-gray-800 px-2 py-1 rounded text-sm' :
                  userRole === 'black' ? 'text-white bg-black px-2 py-1 rounded text-sm' :
                  userRole === 'spectator' ? 'text-purple-600' :
                  'text-gray-600'
                }`}>
                  {userRole || 'Not in game'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Spectators</h3>
                <p className="text-gray-900">{gameSessionInfo.spectatorCount || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Actions</h2>
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Connecting to server...</p>
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {getAvailableActions().map((action, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                    <button
                      onClick={() => !action.disabled && handleAction(action.type)}
                      disabled={action.disabled}
                      className={`px-4 py-2 text-white rounded-lg transition-colors ${action.color} ${
                        action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {action.label}
                    </button>
                  </div>
                </div>
              ))}
              {getAvailableActions().length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No actions available at the moment.</p>
                  <button
                    onClick={requestGameState}
                    className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Refresh Game State
                  </button>
                </div>
              )}
              
              {/* Debug section */}
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Game Status: {gameSessionInfo?.status || 'none'}</p>
                <p>White Player: {gameSessionInfo?.whitePlayer || 'none'}</p>
                <p>Black Player: {gameSessionInfo?.blackPlayer || 'none'}</p>
                <p>Current User: {user?.username || 'none'}</p>
                <p>User Role: {userRole || 'none'}</p>
                <p>Available Actions: {getAvailableActions().length}</p>
                <button
                  onClick={requestGameState}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 mr-2"
                >
                  Force Refresh
                </button>
                <button
                  onClick={() => window.location.href = '/game'}
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  Force Play
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Connection Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Info</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Status:</span> {getConnectionStatus()}</p>
            <p><span className="font-medium">Socket Connected:</span> {isConnected ? 'Yes' : 'No'}</p>
            {connectionError && (
              <p><span className="font-medium text-red-600">Error:</span> {connectionError}</p>
            )}
            <p><span className="font-medium">User:</span> {user?.username || 'Not logged in'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
