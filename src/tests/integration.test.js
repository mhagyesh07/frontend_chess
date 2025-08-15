import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { io } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client');

// Mock authService
jest.mock('../services/authService', () => ({
  isAuthenticated: jest.fn(() => true),
  getCurrentUser: jest.fn(() => ({ id: '1', username: 'testuser' })),
  getToken: jest.fn(() => 'mock-token')
}));

describe('Chess React Integration Tests', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      close: jest.fn(),
      connected: true
    };
    io.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should establish socket connection and display connecting state', async () => {
    // Mock socket as not connected initially
    mockSocket.connected = false;
    
    render(<App />);
    
    // Initially should show connecting
    expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
    
    // Simulate connection
    mockSocket.connected = true;
    const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    if (connectCallback) {
      connectCallback();
    }
    
    await waitFor(() => {
      expect(screen.queryByText('Connecting to server...')).not.toBeInTheDocument();
    });
  });

  test('should handle player role assignment', async () => {
    render(<App />);
    
    // Wait for auth to load and socket to connect
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Simulate connection and role assignment
    const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    if (connectCallback) connectCallback();
    
    const playerRoleCallback = mockSocket.on.mock.calls.find(call => call[0] === 'playerRole')[1];
    if (playerRoleCallback) playerRoleCallback('w');
    
    await waitFor(() => {
      expect(screen.getByText(/You are playing as White/)).toBeInTheDocument();
    });
  });

  test('should handle spectator role assignment', async () => {
    render(<App />);
    
    // Wait for auth to load and socket to connect
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Simulate connection and spectator role
    const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    if (connectCallback) connectCallback();
    
    const spectatorRoleCallback = mockSocket.on.mock.calls.find(call => call[0] === 'spectatorRole')[1];
    if (spectatorRoleCallback) spectatorRoleCallback();
    
    await waitFor(() => {
      expect(screen.getByText(/You are spectating/)).toBeInTheDocument();
    });
  });

  test('should handle board state updates', async () => {
    render(<App />);
    
    // Wait for auth to load and socket to connect
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Simulate connection
    const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    if (connectCallback) connectCallback();
    
    // Simulate board state update
    const boardStateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'boardState')[1];
    if (boardStateCallback) boardStateCallback('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    
    await waitFor(() => {
      // Should render chess board with pieces
      expect(screen.getByTestId('chess-board')).toBeInTheDocument();
    });
  });

  test('should handle game over scenarios', async () => {
    render(<App />);
    
    // Wait for auth to load and socket to connect
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Simulate connection
    const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    if (connectCallback) connectCallback();
    
    // Simulate game over
    const gameOverCallback = mockSocket.on.mock.calls.find(call => call[0] === 'gameOver')[1];
    if (gameOverCallback) gameOverCallback('Checkmate! White wins.');
    
    await waitFor(() => {
      expect(screen.getByText('Checkmate! White wins.')).toBeInTheDocument();
      expect(screen.getByText('New Game')).toBeInTheDocument();
    });
  });

  test('should emit new game event when button clicked', async () => {
    render(<App />);
    
    // Wait for auth to load and socket to connect
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Simulate connection and game over state
    const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    if (connectCallback) connectCallback();
    
    const gameOverCallback = mockSocket.on.mock.calls.find(call => call[0] === 'gameOver')[1];
    if (gameOverCallback) gameOverCallback('Checkmate! White wins.');
    
    await waitFor(() => {
      const newGameButton = screen.getByText('New Game');
      fireEvent.click(newGameButton);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('newGame');
    });
  });

  test('should handle new game started event', async () => {
    render(<App />);
    
    // Wait for auth to load and socket to connect
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Simulate connection
    const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    if (connectCallback) connectCallback();
    
    // Simulate new game started
    const newGameStartedCallback = mockSocket.on.mock.calls.find(call => call[0] === 'newGameStarted')[1];
    if (newGameStartedCallback) newGameStartedCallback();
    
    await waitFor(() => {
      // Game message should be cleared or reset
      expect(screen.queryByText(/Checkmate/)).not.toBeInTheDocument();
    });
  });
});
  
test('should show welcome page when not authenticated', async () => {
    // Mock as not authenticated
    const authService = require('../services/authService');
    authService.isAuthenticated.mockReturnValue(false);
    authService.getCurrentUser.mockReturnValue(null);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Chess Game')).toBeInTheDocument();
      expect(screen.getByText('Welcome! Please sign in to play.')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });