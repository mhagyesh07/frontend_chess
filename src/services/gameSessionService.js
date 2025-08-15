const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class GameSessionService {
  /**
   * Get authentication headers with JWT token
   * @returns {Object} Headers object with authorization
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Get current game session status and available actions
   * @returns {Promise<Object>} Session status and available actions
   */
  async getSessionStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game-session/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get session status');
      }

      return data.data;
    } catch (error) {
      throw new Error(error.message || 'Network error getting session status');
    }
  }

  /**
   * Create a new game session
   * @returns {Promise<Object>} Created session data
   */
  async createGameSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game-session/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create game session');
      }

      return data.data;
    } catch (error) {
      throw new Error(error.message || 'Network error creating game session');
    }
  }

  /**
   * Join an existing game session
   * @returns {Promise<Object>} Joined session data
   */
  async joinGameSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game-session/join`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join game session');
      }

      return data.data;
    } catch (error) {
      throw new Error(error.message || 'Network error joining game session');
    }
  }
}

const gameSessionService = new GameSessionService();
export default gameSessionService;