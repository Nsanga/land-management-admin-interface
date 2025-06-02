import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    avatar: null
  })

  const fetchUser = async () => {
    try {
      const res = await API.get(`/api/users/${user.userInfo._id}`);
      setUserData({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        email: res.data.email,
        phoneNumber: res.data.phoneNumber,
        password: '',
        avatar: res.data.avatar || null, // 🆕
      });
    } catch (err) {
      console.log("error", err)
      toast.error('Échec du chargement des utilisateurs');
    }
  };

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 right-0 left-0 transition-all duration-300 
      ${isScrolled
        ? 'bg-white/10 backdrop-blur-lg shadow-md text-white'
        : 'bg-gradient-to-r from-blue-600/90 to-purple-700/90 text-white'}`}>

      <div className="pr-4 sm:pr-6 lg:pr-8 pl-0">
        <div className="flex justify-end items-center h-16">
          {/* Menu desktop - aligné à droite */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full
              bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
              <div className="w-7 h-7 rounded-full overflow-hidden border">
                {userData.avatar && !(userData.avatar instanceof File) ? (
                  <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-yellow-200" />
                )}
              </div>

              <span className="font-medium">{user?.username || 'Utilisateur'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 
                px-5 py-2 rounded-full hover:shadow-lg hover:from-red-600 hover:to-pink-700
                transition-all transform hover:scale-105"
            >
              <span>Déconnexion</span>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Élément décoratif */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-300 via-blue-400 to-purple-600"></div>
    </nav>
  );
}