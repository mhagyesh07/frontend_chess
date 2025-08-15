import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WelcomePage from './WelcomePage';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import ChessBoard from './ChessBoard';
import GameStatus from './GameStatus';
import GameControls from './GameControls';
import MoveHistory from './MoveHistory';
import useSocket from '../hooks/useSocket';
import useChessGame from '../hooks/useChessGame';

// Game component that will be used for the chess game route
function GameApp() {
  const { socket, isConnected, connectionError } = useSocket();
  const { board, playerRole, gameMessage, isGameOver, moveHistory, gameSessionInfo, makeMove, startNewGame } = useChessGame(socket);

  if (connectionError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-600">
        <div className="text-center">
          <div className="text-white text-xl font-bold mb-4">Connection Error</div>
          <div className="text-white text-lg">{connectionError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-600">
        <div className="text-white text-xl font-bold">Connecting to server...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-600 p-4">
      <div className="flex gap-6 items-start">
        {/* Main game area */}
        <div className="flex flex-col items-center">
          <GameStatus playerRole={playerRole} gameMessage={gameMessage} />
          <ChessBoard board={board} playerRole={playerRole} onMove={makeMove} />
          <GameControls isGameOver={isGameOver} onNewGame={startNewGame} />
        </div>
        
        {/* Move history sidebar */}
        <MoveHistory 
          moves={moveHistory} 
          whitePlayer={gameSessionInfo?.whitePlayer}
          blackPlayer={gameSessionInfo?.blackPlayer}
        />
      </div>
    </div>
  );
}

// Component to handle root redirect based on auth status
function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/welcome"} replace />;
}

const AppRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-600">
        <div className="text-white text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public route for welcome/login/signup */}
        <Route path="/welcome" element={<WelcomePage />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/game" 
          element={
            <ProtectedRoute>
              <GameApp />
            </ProtectedRoute>
          } 
        />
        
        {/* Root redirect based on authentication status */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Catch all route - redirect based on auth status */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;