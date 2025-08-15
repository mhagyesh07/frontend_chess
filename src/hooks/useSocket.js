import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, not connecting to socket');
      setConnectionError('No authentication token found');
      return;
    }

    console.log('Attempting socket connection with token:', token.substring(0, 20) + '...');

    // Connect to socket with authentication
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';
    console.log('Socket URL:', socketUrl);
    
    const newSocket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected successfully with ID:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, try to reconnect manually
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          newSocket.connect();
        }, 1000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message || 'Connection failed');
      setIsConnected(false);
    });

    newSocket.on('connectionError', (error) => {
      console.error('Authentication error:', error);
      setConnectionError(error);
      setIsConnected(false);
    });

    // Add reconnection handling
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      setConnectionError('Reconnection failed: ' + error.message);
    });

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.close();
    };
  }, []);

  return { socket, isConnected, connectionError };
};

export default useSocket;