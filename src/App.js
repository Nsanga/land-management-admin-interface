
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ParcelsPage from './pages/ParcelsPage';
import UsersPage from './pages/UsersPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import TitlePage from './pages/TitlePage';
import { useState } from 'react';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoutes() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <>
  <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
    {/* Contenu principal avec z-index élevé */}
    <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} flex-1 min-h-screen relative z-10`}>
      <Sidebar setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />
      <Navbar />
      <main className="p-4 mt-16">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/parcels" element={<ParcelsPage />} />
          <Route path="/titles" element={<TitlePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>

    {/* Cercles décoratifs animés avec z-index bas */}
    <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -ml-32 -mt-16 z-0" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full z-0" />
    <div className="absolute top-1/2 w-32 h-32 bg-yellow-300 opacity-20 rounded-full animate-pulse z-0" />
  </div>
</>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
