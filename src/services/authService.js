const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class AuthService {
  async register(username, password) {
    try {
      console.log('Attempting registration with:', { username, API_BASE_URL });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Registration response status:', response.status);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Registration response data:', data);

      // Handle the nested response structure from the controller
      const token = data.data?.token || data.token;
      const user = data.data?.user || data.user;

      if (token) {
        localStorage.setItem('token', token);
        console.log('Token stored successfully');
      } else {
        console.warn('No token received in response');
      }

      return { ...data, token, user };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Network error during registration');
    }
  }

  async login(username, password) {
    try {
      console.log('Attempting login with:', { username, API_BASE_URL });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login response data:', data);

      // Handle the nested response structure from the controller
      const token = data.data?.token || data.token;
      const user = data.data?.user || data.user;

      if (token) {
        localStorage.setItem('token', token);
        console.log('Token stored successfully');
      } else {
        console.warn('No token received in response');
      }

      return { ...data, token, user };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Network error during login');
    }
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken() {
    const token = localStorage.getItem('token');
    console.log('Retrieved token from localStorage:', token);
    return token;
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic token validation - check if it's expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        username: payload.username,
      };
    } catch (error) {
      return null;
    }
  }
}

const authService = new AuthService();
export default authService;