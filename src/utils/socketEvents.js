// Socket.IO event constants
export const SOCKET_EVENTS = {
  // Outgoing events
  MOVE: 'move',
  NEW_GAME: 'newGame',
  
  // Incoming events
  PLAYER_ROLE: 'playerRole',
  SPECTATOR_ROLE: 'spectatorRole',
  BOARD_STATE: 'boardState',
  GAME_OVER: 'gameOver',
  NEW_GAME_STARTED: 'newGameStarted',
  MOVE_ERROR: 'moveError',
};