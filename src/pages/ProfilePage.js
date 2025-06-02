import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiEdit2 } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from "react-hot-toast";

const EditProfilePage = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        avatar: null
    })

    const [isEditing, setIsEditing] = useState(false)
    const [activeField, setActiveField] = useState(null)

    const handleChange = (field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }))
    }

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
            toast.error('Échec du chargement des utilisateurs');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsEditing(false);
        try {
            const formData = new FormData();
            formData.append('firstName', userData.firstName);
            formData.append('lastName', userData.lastName);
            formData.append('email', userData.email);
            formData.append('phoneNumber', userData.phoneNumber);
            if (userData.password) formData.append('password', userData.password);

            if (userData.avatar instanceof File) {
                formData.append('avatar', userData.avatar); // 🆕
            }

            await API.put(`/api/users/${user.userInfo._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            await fetchUser();
            toast.success('Mise à jour effectuée avec succès');
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 rounded-lg"
        >
            <div className="max-w-3xl mx-auto">
                {/* Header animé */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-12"
                >
                    <motion.h1
                        whileHover={{ scale: 1.02 }}
                        className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                        Mon Profil
                    </motion.h1>
                    <p className="text-lg text-gray-600">Gérez vos informations personnelles</p>
                </motion.div>

                {/* Carte de profil */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="relative"
                            >
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border">
                                    {userData.avatar && !(userData.avatar instanceof File) ? (
                                        <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-4xl text-white bg-gradient-to-r from-blue-500 to-purple-500">
                                            <FiUser />
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <>
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-md cursor-pointer"
                                        >
                                            <FiEdit2 size={16} />
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setUserData(prev => ({ ...prev, avatar: file }));
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </>
                                )}
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 ${isEditing
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'bg-blue-100 text-blue-600'
                                    }`}
                            >
                                {isEditing ? (
                                    <>
                                        <FiSave size={18} />
                                        <span>Enregistrer</span>
                                    </>
                                ) : (
                                    <>
                                        <FiEdit2 size={18} />
                                        <span>Modifier</span>
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Formulaire */}
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Nom */}
                                <motion.div
                                    whileFocus={{ scale: 1.01 }}
                                    className="relative"
                                >
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
                                    {isEditing ? (
                                        <motion.input
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            type="text"
                                            value={userData.lastName}
                                            onChange={(e) => handleChange('lastName', e.target.value)}
                                            className="w-full p-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-gray-50 rounded-lg"
                                            onFocus={() => setActiveField('lastName')}
                                        />
                                    ) : (
                                        <motion.p
                                            initial={{ x: 10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="p-3 text-gray-800 font-medium"
                                        >
                                            {userData.lastName}
                                        </motion.p>
                                    )}
                                    {activeField === 'lastName' && (
                                        <motion.div
                                            layoutId="activeField"
                                            className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </motion.div>

                                {/* Prénom */}
                                <motion.div
                                    whileFocus={{ scale: 1.01 }}
                                    className="relative"
                                >
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
                                    {isEditing ? (
                                        <motion.input
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            type="text"
                                            value={userData.firstName}
                                            onChange={(e) => handleChange('firstName', e.target.value)}
                                            className="w-full p-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-gray-50 rounded-lg"
                                            onFocus={() => setActiveField('firstName')}
                                        />
                                    ) : (
                                        <motion.p
                                            initial={{ x: 10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="p-3 text-gray-800 font-medium"
                                        >
                                            {userData.firstName}
                                        </motion.p>
                                    )}
                                </motion.div>

                                {/* Email */}
                                <motion.div
                                    whileFocus={{ scale: 1.01 }}
                                    className="relative"
                                >
                                    <label className="flex items-center text-sm font-medium text-gray-500 mb-1">
                                        <FiMail className="mr-2" /> Email
                                    </label>
                                    {isEditing ? (
                                        <motion.input
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            type="email"
                                            value={userData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="w-full p-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-gray-50 rounded-lg"
                                            onFocus={() => setActiveField('email')}
                                        />
                                    ) : (
                                        <motion.p
                                            initial={{ x: 10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="p-3 text-gray-800 font-medium"
                                        >
                                            {userData.email}
                                        </motion.p>
                                    )}
                                </motion.div>

                                {/* Téléphone */}
                                <motion.div
                                    whileFocus={{ scale: 1.01 }}
                                    className="relative"
                                >
                                    <label className="flex items-center text-sm font-medium text-gray-500 mb-1">
                                        <FiPhone className="mr-2" /> Téléphone
                                    </label>
                                    {isEditing ? (
                                        <motion.input
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            type="tel"
                                            value={userData.phoneNumber}
                                            onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                            className="w-full p-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-gray-50 rounded-lg"
                                            onFocus={() => setActiveField('phoneNumber')}
                                        />
                                    ) : (
                                        <motion.p
                                            initial={{ x: 10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="p-3 text-gray-800 font-medium"
                                        >
                                            {userData.phoneNumber}
                                        </motion.p>
                                    )}
                                </motion.div>

                                {/* Mot de passe */}
                                {isEditing && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="relative"
                                    >
                                        <label className="flex items-center text-sm font-medium text-gray-500 mb-1">
                                            <FiLock className="mr-2" /> Nouveau mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            value={userData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            className="w-full p-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-gray-50 rounded-lg"
                                            placeholder="••••••••"
                                            onFocus={() => setActiveField('password')}
                                        />
                                    </motion.div>
                                )}
                            </div>

                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-10 flex justify-end gap-4"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100"
                                    >
                                        Annuler
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-md hover:shadow-lg"
                                    >
                                        Enregistrer les modifications
                                    </motion.button>
                                </motion.div>
                            )}
                        </form>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default EditProfilePage