import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiEdit, FiPlus, FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import API from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/modal/Modal';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const openModal = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const fetchParcels = async () => {
        try {
            const res = await API.get('/parcels');
            setParcels(res.data);
        } catch (err) {
            toast.error('Échec du chargement des parcelles');
            throw err;
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            await fetchParcels();
            const res = await API.get('/transactions');
            setTransactions(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Échec du chargement des transactions');
            toast.error('Échec du chargement des transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF'
        }).format(amount);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await API.delete(`/transactions/${id}`);
            await fetchTransactions();
            toast.success('Transaction supprimée avec succès');
        } catch (err) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleUpdate = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const filteredTransactions = transactions.filter(t =>
        (filterType === 'all' || t.type === filterType) &&
        (t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.parcelId?.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formatCurrency(t.montant).toLowerCase().includes(searchTerm.toLowerCase())
        ));

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
                    <p className="text-white mt-4">Chargement des transactions foncières...</p>
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
                            Transactions Foncières
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
                                onClick={fetchTransactions}
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
                        Transactions Foncières
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
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tous types</option>
                            <option value="achat">Achats</option>
                            <option value="vente">Ventes</option>
                            <option value="transfert">Transferts</option>
                        </select>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md"
                        >
                            <FiPlus className="w-5 h-5" />
                            <span>Ajouter une transaction</span>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcelle</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parties</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((t) => (
                                            <motion.tr
                                                key={t._id}
                                                variants={item}
                                                transition={{ duration: 0.3 }}
                                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                className="cursor-pointer"
                                                onClick={() => handleUpdate(t)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${t.type === 'achat' ? 'bg-green-100 text-green-800' :
                                                            t.type === 'vente' ? 'bg-red-100 text-red-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {t.parcelId?.ville + ", " + t.parcelId?.adresse || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                    t.type === 'achat' ? 'text-green-600' :
                                                    t.type === 'vente' ? 'text-red-600' :
                                                    'text-gray-600'
                                                }">
                                                    {formatCurrency(t.montant)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(t.dateTransaction)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{t.acheteurNom}</span>
                                                        <span className="text-xs text-gray-400">→ {t.vendeurNom}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdate(t);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                                        >
                                                            <FiEdit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(t._id, e)}
                                                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
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
                                            <td colSpan={6} className="px-6 py-8 text-center">
                                                <div className="text-gray-500">
                                                    {searchTerm ?
                                                        "Aucune transaction ne correspond à votre recherche" :
                                                        "Aucune transaction enregistrée"}
                                                </div>
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setFilterType('all');
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
                    modalType="transaction"
                    fetchTransactions={fetchTransactions}
                    parcels={parcels}
                    currentItem={currentItem}
                />
            </motion.div>
        </div>
    );
}