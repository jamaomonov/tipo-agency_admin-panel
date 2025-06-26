import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authStatus = localStorage.getItem('isAuthenticated');
      const authTimestamp = localStorage.getItem('authTimestamp');
      
      if (authStatus === 'true' && authTimestamp) {
        // Проверяем, не истекла ли сессия (24 часа)
        const timestamp = parseInt(authTimestamp);
        const now = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
        
        if (now - timestamp < sessionDuration) {
          setIsAuthenticated(true);
        } else {
          // Сессия истекла
          logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // В случае ошибки сбрасываем аутентификацию
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (success: boolean) => {
    try {
      if (success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authTimestamp', Date.now().toString());
      }
      setIsAuthenticated(success);
    } catch (error) {
      console.error('Error during login:', error);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authTimestamp');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };
} 