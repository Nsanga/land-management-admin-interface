import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiEdit, FiPlus, FiRefreshCw, FiFileText, FiDownload } from 'react-icons/fi';
import API from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/modal/Modal';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentItem(null);
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/reports');
      setReports(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Échec du chargement des rapports');
      toast.error('Échec du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/reports/${id}`);
      await fetchReports();
      toast.success('Rapport supprimé avec succès');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleUpdate = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleDownload = async (id, reportNumber) => {
    try {
      const response = await API.get(`/reports/${id}/download-full`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-${reportNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const filteredReports = reports.filter(report =>
    report.referenceDossier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.lieuExact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.objetDescente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white mt-4">Chargement des Rapport...</p>
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
              Rapports d'Inspection
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
                onClick={fetchReports}
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
            Rapports d'Inspection
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
              onClick={openModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md"
            >
              <FiPlus className="w-5 h-5" />
              <span>Nouveau rapport</span>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objet
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <motion.tr
                        key={report._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                        className="cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.referenceDossier || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(report.dateDescente)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.lieuExact || 'Non spécifié'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.objetDescente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(report._id, report.referenceDossier);
                              }}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                              title="Télécharger"
                            >
                              <FiDownload className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdate(report);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                              title="Modifier"
                            >
                              <FiEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(report._id, e)}
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
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          {searchTerm ?
                            "Aucun rapport ne correspond à votre recherche" :
                            "Aucun rapport disponible"}
                        </div>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-2 text-blue-600 hover:underline"
                          >
                            Réinitialiser la recherche
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
          onClose={() => {
            setIsModalOpen(false);
            setCurrentItem(null);
          }}
          modalType="report"
          fetchReports={fetchReports}
          currentItem={currentItem}
        />
      </motion.div>
    </div>
  );
}