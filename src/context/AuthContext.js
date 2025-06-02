import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const data = res.data;
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data);
      return { success: true };
    } catch (error) {
      // Retourner le message d'erreur de l'API ou un message par défaut
      const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de la connexion";
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
