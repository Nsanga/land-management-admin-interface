import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../services/api";

export default function AddUserForm({ onClose, fetchUsers, currentItem }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        role: 'user',
        password: 'password'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!currentItem) {
                await API.post('/users', formData);
            } else {
                await API.put(`/users/${currentItem._id}`, formData);
            }
            // Changed from '/parcelles'
            setFormData({ firstName: '', lastName: '', email: '', phoneNumber: '', role: '', password: 'password' });
            await fetchUsers();
            toast.success(!currentItem ? 'Utilisateur ajoutée avec succès' : 'Utilisateur mis à jour avec succès');
            onClose();
        } catch (err) {
            console.log("err:", err)
            toast.error(err.response?.data?.msg || 'Erreur lors de l\'ajout');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentItem) {
            setFormData(prev => ({
                ...prev,
                firstName: currentItem.firstName,
                lastName: currentItem.lastName,
                email: currentItem.email,
                phoneNumber: currentItem.phoneNumber,
                role: currentItem.role
            }));
        }
    }, [currentItem]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Rôle</label>
                    <select
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                    >
                        <option value="">Sélectionnez un rôle</option>
                        <option value="admin">Administrateur</option>
                        <option value="agent_foncier">Agent Foncier</option>
                        <option value="citoyen">Citoyen</option>
                    </select>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                    {currentItem ? (
                        <>
                            {isLoading ? "Mise à jour en cours..." : "Mettre à jour"}
                        </>
                    ) : (
                        <>
                            {isLoading ? "Enregistrement en cours..." : "Enregistrer"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}