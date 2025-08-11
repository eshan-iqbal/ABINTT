export interface User {
  username: string;
  name: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Default credentials
const DEFAULT_USERNAME = 'owais';
const DEFAULT_PASSWORD = '9090';

export const authenticateUser = (credentials: LoginCredentials): User | null => {
  if (credentials.username === DEFAULT_USERNAME && credentials.password === DEFAULT_PASSWORD) {
    return {
      username: credentials.username,
      name: 'Owais'
    };
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check both localStorage and cookies
  const localStorageAuth = localStorage.getItem('isAuthenticated') === 'true';
  const cookieAuth = document.cookie.includes('isAuthenticated=true');
  
  return localStorageAuth && cookieAuth;
};

export const login = (credentials: LoginCredentials): boolean => {
  const user = authenticateUser(credentials);
  if (user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set cookie for middleware authentication
      document.cookie = `isAuthenticated=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    }
    return true;
  }
  return false;
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    
    // Remove cookie for middleware authentication
    document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
