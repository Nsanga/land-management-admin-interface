import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiEdit, FiPlus, FiRefreshCw, FiFileText } from 'react-icons/fi';
import API from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/modal/Modal';
import { useAuth } from '../context/AuthContext';

export default function RequestsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const openModal = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const agentId = user?.userInfo?._id || user?.userInfo?._id;
            const res = await API.get(`/requests/by-agent/${agentId}`);
            setRequests(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Échec du chargement des titres');
            toast.error('Échec du chargement des titres');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log(JSON.parse(localStorage.getItem('user')))
        fetchRequests();
    }, []);

    const handleUpdate = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const filteredRequests = requests.filter(request =>
        (filterStatus === 'all' || request.status === filterStatus) &&
        request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.citizen.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.citizen.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-500';
            case 'in_progress': return 'bg-blue-100 text-blue-500';
            case 'completed': return 'bg-green-100 text-green-500';
            case 'Rejetée': return 'bg-red-100 text-red-500';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const getUrgencyColor = (urgency) => {
        console.log(`Urgency: ${urgency}`);
        if (!urgency) return 'border-l-gray-500';

        const level = urgency.toLowerCase().trim();
        return {
            high: 'border-l-red-500',
            medium: 'border-l-blue-500',
            low: 'border-l-green-500'
        }[level] || 'border-l-gray-500';
    };

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-white mt-4">Chargement des demandes...</p>
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
                            <FiFileText className="text-blue-600" />
                            Demande d'Immatriculation
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
                                onClick={fetchRequests}
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
                        Demandes d'Immatriculation
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

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tous</option>
                                <option value="pending">En attente</option>
                                <option value="in_progress">En cours</option>
                                <option value="completed">Approuvée</option>
                                <option value="rejected">Rejetée</option>
                            </select>
                        </motion.button>
                    </div>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <div className="overflow-x-auto bg-white rounded-xl shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Demande</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propriétaire</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NUI</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de soumission</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filteredRequests.length > 0 ? (
                                        filteredRequests.map((r) => (
                                            <motion.tr
                                                key={r._id}
                                                variants={item}
                                                transition={{ duration: 0.3 }}
                                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                className={`cursor-pointer border-l-4 !border-l-${getUrgencyColor(r.urgency).split('-').pop()}`}
                                                onClick={() => handleUpdate(r)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.requestNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {r.citizen.firstName} {r.citizen.lastName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.citizen?.telephone}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{r.citizen?.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{r.citizen?.NUI}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(r.createdAt).toLocaleString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(r.status)}`}>
                                                        {r.status === 'pending' ? 'En attente' : r.status === 'in_progress' ? ' En cours' : r.status === 'completed' ? 'Approuvée' : 'Rejetée'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdate(r);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                                        >
                                                            <FiEdit className="w-5 h-5" />
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
                                            <td colSpan={7} className="px-6 py-8 text-center">
                                                <div className="text-gray-500">
                                                    {searchTerm ?
                                                        "Aucune demande ne correspond à votre recherche" :
                                                        "Aucune demande d'Immatriculation enregistrée"}
                                                </div>
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setFilterStatus('all');
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
                    modalType="request"
                    fetchRequests={fetchRequests}
                    currentItem={currentItem}
                />
            </motion.div>
        </div>
    );
}