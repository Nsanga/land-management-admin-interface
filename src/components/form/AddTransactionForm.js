import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../services/api";
import FileUpload from "../FileUpload";
import TextInputField from "../TextInputField";

export default function AddTransactionForm({ onClose, fetchTransactions, parcels, currentItem }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Étape 1: Informations sur la transaction
        type: 'vente',
        dateTransaction: new Date().toISOString().split('T')[0],
        montant: '',
        statut: 'en cours',

        // Étape 2: Parties impliquées
        acheteurNom: '',
        acheteurAdresse: '',
        acheteurContact: '',
        vendeurNom: '',
        vendeurAdresse: '',
        vendeurContact: '',
        proprietairePrecedent: '',
        nouveauProprietaire: '',

        // Étape 3: Informations parcelle
        parcelId: '',
        adresseParcelle: '',
        descriptionParcelle: '',

        // Étape 4: Documents
        contratVente: null,
        acteNotarie: null,
        autresDocuments: [],
    });

    const [contratVenteToDelete, setContratVenteToDelete] = useState(null)
    const [acteNotarieToDelete, setActeNotarieToDelete] = useState(null)
    const [autresDocumentsToDelete, setAutresDocumentsToDelete] = useState([])

    const isParcelsArray = Array.isArray(parcels) && parcels.length > 0;

    const nextStep = () => {
        // Tableau de validation pour chaque étape
        const validationRules = [
            { step: 1, condition: !formData.montant, message: 'Veuillez remplir le montant.' },
            { step: 2, condition: !formData.acheteurNom || !formData.acheteurContact || !formData.vendeurNom || !formData.vendeurContact, message: 'Veuillez remplir tout les champs obligatoires.' },
            { step: 4, condition: !formData.proprietaireNom || !formData.proprietaireAdresse || !formData.proprietaireContact, message: 'Veuillez remplir tous les champs du propriétaire.' },
        ];

        // Vérification des règles de validation
        const validationError = validationRules.find(rule => rule.step === step && rule.condition);

        if (validationError) {
            toast.error(validationError.message);
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleRemovePreviewFile = (field, index) => {
        let fieldFiles = formData[field];

        // Normaliser en tableau (utile si c'est un seul fichier ou une string)
        const normalizedFiles = Array.isArray(fieldFiles)
            ? fieldFiles
            : fieldFiles
                ? [fieldFiles]
                : [];

        const removedFile = normalizedFiles[index];

        const updatedFiles = normalizedFiles.filter((_, i) => i !== index);

        // Pour les champs single-file, rétablir à null si aucun fichier
        const valueToSet = field === 'autresDocuments' ? updatedFiles : updatedFiles[0] || null;

        setFormData(prev => ({
            ...prev,
            [field]: valueToSet,
        }));

        // Enregistrer l'URL à supprimer uniquement si c'est une string
        if (typeof removedFile === 'string') {
            switch (field) {
                case 'contratVente':
                    setContratVenteToDelete(removedFile);
                    break;
                case 'acteNotarie':
                    setActeNotarieToDelete(removedFile);
                    break;
                case 'autresDocuments':
                    setAutresDocumentsToDelete(prev => [...prev, removedFile]);
                    break;
                default:
                    break;
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();

        // Fonction pour comparer les valeurs simples (texte, number, etc.)
        const isDifferent = (key, value) => {
            if (!currentItem || !(key in currentItem)) return true;

            const initialValue = currentItem[key];

            // Pour les fichiers, on vérifie uniquement l'instance
            if (value instanceof File) return true;

            // Pour les valeurs simples
            return value !== initialValue;
        };

        // Ajouter uniquement les champs texte qui ont changé
        Object.entries(formData).forEach(([key, value]) => {
            if (
                value !== null &&
                typeof value !== 'object' &&
                isDifferent(key, value)
            ) {
                formDataToSend.append(key, value);
            }
        });

        // Ajouter les fichiers uniquement s’ils ont été sélectionnés ou modifiés
        if (formData.contratVente instanceof File) {
            formDataToSend.append('contratVente', formData.contratVente);
        }

        if (formData.acteNotarie instanceof File) {
            formDataToSend.append('acteNotarie', formData.acteNotarie);
        }

        if (formData.autresDocuments && formData.autresDocuments.length > 0) {
            formData.autresDocuments.forEach(file => {
                if (file instanceof File) {
                    formDataToSend.append('autresDocuments', file);
                }
            });
        }

        if (contratVenteToDelete) {
            formDataToSend.append('contratVenteToDelete', contratVenteToDelete ? "true" : "false");
        }

        if (acteNotarieToDelete) {
            formDataToSend.append('acteNotarieToDelete', acteNotarieToDelete ? "true" : "false");
        }

        if (autresDocumentsToDelete.length > 0) {
            autresDocumentsToDelete.forEach(url => {
                formDataToSend.append('autresDocumentsToDelete[]', url);
            });
        }

        setIsLoading(true);

        try {
            if (!currentItem) {
                await API.post('/transactions', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await API.put(`/transactions/${currentItem._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            toast.success('Transaction enregistrée avec succès');
            onClose();
            fetchTransactions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (fieldName, value) => {
        setFormData((prevFormData) => {
            const newFormData = {
                ...prevFormData,
                [fieldName]: value,
            };

            // Si on change la parcelle sélectionnée, on met à jour l'adresse
            if (fieldName === 'parcelId' && value) {
                const selectedParcel = parcels.find(p => p._id === value);
                if (selectedParcel) {
                    newFormData.adresseParcelle = `${selectedParcel.ville}, ${selectedParcel.adresse}`;
                }
            }

            return newFormData;
        });
    };

    // Barre de progression
    const ProgressBar = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((stepNumber) => (
                    <div key={stepNumber} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                            ${step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {stepNumber}
                        </div>
                        <div className={`text-xs mt-2 ${step >= stepNumber ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                            {stepNumber === 1 && 'Transaction'}
                            {stepNumber === 2 && 'Parties'}
                            {stepNumber === 3 && 'Parcelle'}
                            {stepNumber === 4 && 'Documents'}
                        </div>
                    </div>
                ))}
            </div>
            <div className="w-full bg-gray-200 h-1 mt-4">
                <div
                    className="bg-blue-600 h-1 transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    useEffect(() => {
        if (currentItem) {
            setFormData(prev => ({
                ...prev,
                type: currentItem.type || 'vente',
                dateTransaction: currentItem.dateTransaction
                    ? new Date(currentItem.dateTransaction).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                montant: currentItem.montant || '',
                statut: currentItem.statut || 'en cours',

                acheteurNom: currentItem.acheteurNom || '',
                acheteurAdresse: currentItem.acheteurAdresse || '',
                acheteurContact: currentItem.acheteurContact || '',
                vendeurNom: currentItem.vendeurNom || '',
                vendeurAdresse: currentItem.vendeurAdresse || '',
                vendeurContact: currentItem.vendeurContact || '',
                proprietairePrecedent: currentItem.proprietairePrecedent || '',
                nouveauProprietaire: currentItem.nouveauProprietaire || '',

                parcelId: currentItem.parcelId?._id || '',
                adresseParcelle: currentItem.adresseParcelle || '',
                descriptionParcelle: currentItem.descriptionParcelle || '',

                contratVente: currentItem.contratVente || null, // ou currentItem.contratVente si tu stockes déjà des fichiers
                acteNotarie: currentItem.acteNotarie || null,
                autresDocuments: currentItem.autresDocuments || null
            }));
        }
    }, [currentItem]);

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white max-w-4xl mx-auto">
            {/* Barre de progression */}
            <ProgressBar />

            {/* Contenu de l'étape actuelle */}
            {step === 1 && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Informations sur la transaction</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type de transaction*</label>
                                <select
                                    name="type"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.type}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        type: e.target.value
                                    })}
                                    required
                                >
                                    <option value="vente">Vente</option>
                                    <option value="achat">Achat</option>
                                    <option value="transfert">Transfert</option>
                                    <option value="hypotheque">Hypothèque</option>
                                    <option value="donation">Donation</option>
                                    <option value="echange">Échange</option>
                                </select>
                            </div>
                            <TextInputField
                                label="Date de transaction"
                                name="dateTransaction"
                                type="date"
                                value={formData.dateTransaction}
                                onChange={handleInputChange}
                                required
                            />
                            <TextInputField
                                label="Montant (FCFA)"
                                name="montant"
                                type="number"
                                value={formData.montant}
                                onChange={handleInputChange}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Statut*</label>
                                <select
                                    name="statut"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.statut}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        statut: e.target.value
                                    })}
                                    required
                                >
                                    <option value="en cours">En cours</option>
                                    <option value="termine">Terminé</option>
                                    <option value="annule">Annulé</option>
                                    <option value="suspendu">Suspendu</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-8">
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Suivant
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </>
            )}
            {step === 2 && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Parties impliquées</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <h4 className="text-md font-medium text-gray-700 mb-2">Acheteur</h4>
                            </div>
                            <TextInputField
                                label="Nom complet"
                                name="acheteurNom"
                                value={formData.acheteurNom}
                                onChange={handleInputChange}
                                required
                            />
                            <TextInputField
                                label="Adresse"
                                name="acheteurAdresse"
                                value={formData.acheteurAdresse}
                                onChange={handleInputChange}
                            />
                            <TextInputField
                                label="Contact"
                                name="acheteurContact"
                                type="number"
                                value={formData.acheteurContact}
                                onChange={handleInputChange}
                                required
                            />
                            <div className="md:col-span-2 mt-4">
                                <h4 className="text-md font-medium text-gray-700 mb-2">Vendeur</h4>
                            </div>
                            <TextInputField
                                label="Nom complet"
                                name="vendeurNom"
                                value={formData.vendeurNom}
                                onChange={handleInputChange}
                                required
                            />
                            <TextInputField
                                label="Adresse"
                                name="vendeurAdresse"
                                value={formData.vendeurAdresse}
                                onChange={handleInputChange}
                            />
                            <TextInputField
                                label="Contact"
                                name="vendeurContact"
                                type="number"
                                value={formData.vendeurContact}
                                onChange={handleInputChange}
                                required
                            />

                            <div className="md:col-span-2 mt-4">
                                <h4 className="text-md font-medium text-gray-700 mb-2">Propriétaires</h4>
                            </div>
                            <TextInputField
                                label="Propriétaire précédent"
                                name="proprietairePrecedent"
                                value={formData.proprietairePrecedent}
                                onChange={handleInputChange}
                            />
                            <TextInputField
                                label="Nouveau propriétaire"
                                name="nouveauProprietaire"
                                value={formData.nouveauProprietaire}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between mt-8">
                        <div>
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Précédent
                            </button>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Suivant
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </>
            )}
            {step === 3 && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Informations sur la parcelle</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <TextInputField
                                label="Parcelle associée"
                                name="parcelId"
                                value={formData.parcelId || ''}
                                onChange={handleInputChange}
                                type="select"
                                isArrayOptions={true}
                                options={
                                    isParcelsArray
                                        ? [
                                            { value: '', label: 'Sélectionnez une parcelle' }, // <-- Ajout d'une option vide
                                            ...parcels.map(parcel => ({
                                                value: parcel._id,
                                                label: `${parcel?.ville}(${parcel?.adresse}, ${parcel?.rue})`
                                            }))
                                        ]
                                        : [{ value: '', label: 'Aucune parcelle disponible' }]
                                }
                                required={true}
                            />
                            <TextInputField
                                label="Adresse de la parcelle"
                                name="adresseParcelle"
                                value={formData.adresseParcelle || ''}
                                onChange={handleInputChange}
                                required
                                placeholder="Adresse de la parcelle"
                                readOnly={!!formData.parcelId} // Rend le champ en lecture seule si une parcelle est sélectionnée
                            />
                            <TextInputField
                                label="Description"
                                name="descriptionParcelle"
                                value={formData.descriptionParcelle}
                                onChange={handleInputChange}
                                type="textarea"
                                placeholder="Description détaillée de la parcelle..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-between mt-8">
                        <div>
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Précédent
                            </button>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Suivant
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </>
            )}
            {step === 4 && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Documents associés</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FileUpload
                                label="Contrat de vente"
                                name="contratVente"
                                files={formData.contratVente}
                                onFilesChange={(files) => setFormData({ ...formData, contratVente: files })}
                                // prefilledFiles={[currentItem.contratVente]}
                                accept=".pdf,.jpg,.png"
                                handleRemovePreviewFile={(index) => handleRemovePreviewFile('contratVente', index)}
                            />
                            <FileUpload
                                label="Acte notarié"
                                name="acteNotarie"
                                files={formData.acteNotarie}
                                onFilesChange={(files) => setFormData({ ...formData, acteNotarie: files })}
                                accept=".pdf,.jpg,.png"
                                handleRemovePreviewFile={(index) => handleRemovePreviewFile('acteNotarie', index)}
                            // prefilledFiles={[currentItem && currentItem.acteNotarie]}
                            />
                            <FileUpload
                                label="Autres documents"
                                name="autresDocuments"
                                files={formData.autresDocuments}
                                onFilesChange={(files) => setFormData({ ...formData, autresDocuments: files })}
                                accept=".pdf,.jpg,.png"
                                handleRemovePreviewFile={(index) => handleRemovePreviewFile('autresDocuments', index)}
                                // prefilledFiles={currentItem && currentItem.autresDocuments}
                                multiple={true}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between mt-8">
                        <div>
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Précédent
                            </button>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </>
            )}
        </form>
    );
}