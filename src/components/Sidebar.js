import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiMap,
  FiUsers,
  FiDollarSign,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiUserCheck,
  FiFile
} from 'react-icons/fi';
import { FaFileContract } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { user } = useAuth();
  const location = useLocation();

  // Menu complet
  const allMenuItems = [
    { path: '/dashboard', icon: <FiHome size={20} />, label: 'Tableau de bord' },
    { path: '/requests', icon: <FiFile size={20} />, label: 'Demandes' },
    { path: '/parcels', icon: <FiMap size={20} />, label: 'Parcelles' },
    { path: '/titles', icon: <FaFileContract size={20} />, label: 'Titres de Propriété' },
    { path: '/transactions', icon: <FiDollarSign size={20} />, label: 'Transactions' },
    { path: '/users', icon: <FiUsers size={20} />, label: 'Utilisateurs' },
    { path: '/reports', icon: <FiFileText size={20} />, label: 'Rapports' },
    { path: '/profile', icon: <FiUserCheck size={20} />, label: 'Mon profil' }
  ];

  // Filtrer les menus selon le rôle
  const getFilteredMenuItems = () => {
    if (user?.role === 'admin') {
      return allMenuItems.filter(item =>
        item.path === '/dashboard' || item.path === '/users' || item.path === '/profile'
      );
    }

    if (user?.role === 'agent_foncier') {
      return allMenuItems.filter(item =>
        item.path !== '/users'
      );
    }
    return allMenuItems;
  };

  const menuItems = getFilteredMenuItems();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`bg-gradient-to-b from-blue-700 to-purple-800 text-white h-screen fixed left-0 top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} z-10 shadow-lg`}>
      {/* Cercle décoratif en haut */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mt-8" />

      {/* En-tête */}
      <div className="p-4 flex items-center justify-between border-b border-purple-500/30 relative z-10">
        {!isCollapsed && <h2 className="text-xl font-bold text-white">Menu</h2>}
        <button
          onClick={toggleSidebar}
          className="text-purple-200 hover:text-white p-2 rounded-full hover:bg-purple-600/50 transition-colors"
        >
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <div className="flex flex-col space-y-2 mt-4 p-2 relative">
        {/* Cercle décoratif au milieu */}
        {/* <div className="absolute top-1/4 right-0 w-16 h-16 bg-yellow-300 opacity-20 rounded-full animate-pulse" /> */}

        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === item.path
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                : 'text-purple-100 hover:bg-blue-600/40'
              }`}
          >
            <span className={`flex-shrink-0 ${location.pathname === item.path ? 'text-yellow-200' : ''}`}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="ml-3 font-medium">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Cercle décoratif en bas */}
      {/* <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full" /> */}
    </div>
  );
}