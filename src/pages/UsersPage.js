import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiEdit, FiPlus, FiRefreshCw, FiUser, FiUserPlus } from 'react-icons/fi';
import API from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/modal/Modal';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    const openModal = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await API.get('/users');
            setUsers(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Échec du chargement des utilisateurs');
            toast.error('Échec du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await API.delete(`/users/${id}`);
            await fetchUsers();
            toast.success('Utilisateur supprimé avec succès');
        } catch (err) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleUpdate = (user) => {
        setCurrentItem(user);
        setIsModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        (filterRole === 'all' || user.role === filterRole) &&
        (user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800';
            case 'agent_foncier': return 'bg-blue-100 text-blue-800';
            case 'citoyen': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        // Options pour la date
        const dateOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        // Options pour l'heure
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Format 24h
        };

        const formattedDate = date.toLocaleDateString('fr-FR', dateOptions);
        const formattedTime = date.toLocaleTimeString('fr-FR', timeOptions);

        return `${formattedDate} à ${formattedTime}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-white mt-4">Chargement des utilisateurs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            Gestion des Utilisateurs
                        </h2>
                    </div>
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-red-800 font-medium">Erreur</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                            <button
                                onClick={fetchUsers}
                                className="text-red-500 hover:text-red-700"
                            >
                                <FiRefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <motion.h2
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                        className="text-2xl font-bold text-white flex items-center gap-2"
                    >
                        Gestion des Utilisateurs
                    </motion.h2>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <motion.div
                            whileFocus={{ scale: 1.02 }}
                            className="relative"
                        >
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </motion.div>

                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tous les rôles</option>
                            <option value="admin">Administrateurs</option>
                            <option value="agent_foncier">Agents Foncier</option>
                            <option value="citoyen">Citoyen</option>
                        </select>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md"
                        >
                            <FiUserPlus className="w-5 h-5" />
                            <span>Nouvel utilisateur</span>
                        </motion.button>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="overflow-x-auto bg-white rounded-xl shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Complet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière activité</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <motion.tr
                                                key={user._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                className="cursor-pointer"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            {user.avatar && !(user.avatar instanceof File) ? (
                                                                <div className="w-10 h-10 rounded-full overflow-hidden border">
                                                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <FiUser className="text-blue-600" />
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.firstName} {user.lastName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.phoneNumber || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(user.role)}`}>
                                                        {user.role === "agent_foncier" ? 'Agent Foncier' : user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(user.role)}`}>
                                                        {formatDate(user.lastActivity)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdate(user);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                                            title="Modifier"
                                                        >
                                                            <FiEdit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(user._id, e)}
                                                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                                            title="Supprimer"
                                                        >
                                                            <FiTrash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={5} className="px-6 py-8 text-center">
                                                <div className="text-gray-500">
                                                    {searchTerm ?
                                                        "Aucun utilisateur ne correspond à votre recherche" :
                                                        "Aucun utilisateur enregistré"}
                                                </div>
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setFilterRole('all');
                                                        }}
                                                        className="mt-2 text-blue-600 hover:underline"
                                                    >
                                                        Réinitialiser les filtres
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    modalType="user"
                    fetchUsers={fetchUsers}
                    currentItem={currentItem}
                />
            </motion.div>
        </div>
    );
}