import { useState } from 'react';
import { loginUser } from '../utils/api';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [message, setMessage] = useState('');

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      setMessage(data.message);
      setUserRole(data.role);
      setIsLoggedIn(true);
      return { success: true, message: data.message };
    } catch (error) {
      setMessage(error.message);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole('');
  };

  return {
    isLoggedIn,
    userRole,
    message,
    login,
    logout
  };
};