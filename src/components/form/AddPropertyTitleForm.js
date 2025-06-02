import { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import FileUpload from '../FileUpload';
import API from '../../services/api';
import TextInputField from '../TextInputField';

export default function AddPropertyTitleForm({ onClose, fetchTitles, parcels, currentItem }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Étape 1: Informations sur le titre
        numeroTitre: '',
        dateEmission: new Date().toISOString().split('T')[0],
        typeTitre: 'foncier',

        // Étape 2: Informations propriétaire
        proprietaireNom: '',
        proprietairePrenom: '',
        proprietaireAdresse: '',
        proprietaireContact: '',
        proprietaireEmail: '',

        // Étape 3: Informations parcelle
        parcelId: '',
        adresseParcelle: '',
        descriptionParcelle: '',

        // Étape 4: Droits et restrictions
        droitsPropriete: '',
        restrictions: '',
        servitudes: '',
        hypothèques: '',

        // Étape 5: Historique transactions
        historiqueTransactions: [],
        nouvelleTransaction: { date: '', nature: '', details: '' },

        // Étape 6: Documents
        copieTitre: null,
        actesNotaries: null,
        autresDocuments: []
    });

    const [copieTitreToDelete, setCopieTitreToDelete] = useState(null)
    const [actesNotariesToDelete, setActesNotariesToDelete] = useState(null)
    const [autresDocumentsToDelete, setAutresDocumentsToDelete] = useState([])

    const isParcelsArray = Array.isArray(parcels) && parcels.length > 0;

    const nextStep = () => {
        const validationRules = [
            { step: 2, condition: !formData.proprietaireNom, message: 'Veuillez remplir le nom du propriétaire.' },
            { step: 2, condition: !formData.proprietairePrenom, message: 'Veuillez remplir le prénom du propriétaire.' },
            { step: 2, condition: !formData.proprietaireAdresse, message: "Veuillez remplir l'adresse du propriétaire." },
            { step: 2, condition: !formData.proprietaireContact, message: "Veuillez remplir le contact du propriétaire." },
            { step: 3, condition: !formData.parcelId, message: "Veuillez sélectionner la parcelle associée." },
            { step: 3, condition: !formData.adresseParcelle, message: "Veuillez remplir l'adresse de la parcelle." },

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
            case 'copieTitre':
              setCopieTitreToDelete(removedFile);
              break;
            case 'actesNotaries':
              setActesNotariesToDelete(removedFile);
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

        const isDifferent = (key, value) => {
            if (!currentItem || !(key in currentItem)) return true;

            const initialValue = currentItem[key];

            if (value instanceof File) return true;

            if (typeof value === 'object') {
                return JSON.stringify(value) !== JSON.stringify(initialValue);
            }

            return value !== initialValue;
        };

        // Champs texte simples
        const fields = [
            'dateEmission', 'typeTitre',
            'proprietaireNom', 'proprietairePrenom', 'proprietaireAdresse', 'proprietaireContact', 'proprietaireEmail',
            'parcelId', 'adresseParcelle', 'descriptionParcelle',
            'droitsPropriete', 'restrictions', 'servitudes', 'hypothèques'
        ];

        fields.forEach(field => {
            const value = formData[field];
            if (isDifferent(field, value)) {
                formDataToSend.append(field, value);
            }
        });

        // Champs JSON
        if (isDifferent('historiqueTransactions', formData.historiqueTransactions)) {
            formDataToSend.append('historiqueTransactions', JSON.stringify(formData.historiqueTransactions));
        }

        if (isDifferent('nouvelleTransaction', formData.nouvelleTransaction)) {
            formDataToSend.append('nouvelleTransaction', JSON.stringify(formData.nouvelleTransaction));
        }

        // Fichiers
        if (formData.copieTitre instanceof File) {
            formDataToSend.append('copieTitre', formData.copieTitre);
        }

        if (formData.actesNotaries instanceof File) {
            formDataToSend.append('actesNotaries', formData.actesNotaries);
        }

        if (formData.autresDocuments && formData.autresDocuments.length > 0) {
            formData.autresDocuments.forEach(file => {
                if (file instanceof File) {
                    formDataToSend.append('autresDocuments', file);
                }
            });
        }

        if (copieTitreToDelete) {
            formDataToSend.append('copieTitreToDelete', copieTitreToDelete ? "true" : "false");
        }

        if (actesNotariesToDelete) {
            formDataToSend.append('actesNotariesToDelete', actesNotariesToDelete ? "true" : "false");
        }

        if (autresDocumentsToDelete.length > 0) {
            autresDocumentsToDelete.forEach(url => {
                formDataToSend.append('autresDocumentsToDelete[]', url);
            });
        }

        setIsLoading(true);

        try {
            if (!currentItem) {
                await API.post('/api/titles', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await API.put(`/api/titles/${currentItem._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            toast.success('Titre de propriété enregistré avec succès');
            onClose();
            fetchTitles();
        } catch (err) {
            console.log(err);
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


    const addTransaction = () => {
        if (formData.nouvelleTransaction.date && formData.nouvelleTransaction.nature) {
            setFormData({
                ...formData,
                historiqueTransactions: [...formData.historiqueTransactions, formData.nouvelleTransaction],
                nouvelleTransaction: { date: '', nature: '', details: '' }
            });
        }
    };

    const removeTransaction = (index) => {
        const updatedTransactions = [...formData.historiqueTransactions];
        updatedTransactions.splice(index, 1);
        setFormData({ ...formData, historiqueTransactions: updatedTransactions });
    };

    // Barre de progression
    const ProgressBar = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
                    <div key={stepNumber} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                            ${step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {stepNumber}
                        </div>
                        <div className={`text-xs mt-1 ${step >= stepNumber ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                            {stepNumber === 1 && 'Titre'}
                            {stepNumber === 2 && 'Propriétaire'}
                            {stepNumber === 3 && 'Parcelle'}
                            {stepNumber === 4 && 'Droits'}
                            {stepNumber === 5 && 'Historique'}
                            {stepNumber === 6 && 'Documents'}
                        </div>
                    </div>
                ))}
            </div>
            <div className="w-full bg-gray-200 h-1.5 mt-3">
                <div
                    className="bg-blue-600 h-1.5 transition-all duration-300"
                    style={{ width: `${(step / 6) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    useEffect(() => {
        if (currentItem) {
            const parsedTransactions = currentItem.historiqueTransactions
                ? JSON.parse(currentItem.historiqueTransactions[0])
                : [];
            setFormData(prev => ({
                ...prev,
                // Étape 1: Informations sur le titre
                numeroTitre: currentItem.numeroTitre || '',
                dateEmission: currentItem.dateEmission.split('T')[0] || new Date().toISOString().split('T')[0],
                typeTitre: currentItem.typeTitre || 'foncier',

                // Étape 2: Informations propriétaire
                proprietaireNom: currentItem.proprietaireNom || '',
                proprietairePrenom: currentItem.proprietairePrenom || '',
                proprietaireAdresse: currentItem.proprietaireAdresse || '',
                proprietaireContact: currentItem.proprietaireContact || '',
                proprietaireEmail: currentItem.proprietaireEmail || '',

                // Étape 3: Informations parcelle
                parcelId: currentItem.parcelId?._id || currentItem.parcelId || '',
                adresseParcelle: currentItem.adresseParcelle || '',
                descriptionParcelle: currentItem.descriptionParcelle || '',

                // Étape 4: Droits et restrictions
                droitsPropriete: currentItem.droitsPropriete || '',
                restrictions: currentItem.restrictions || '',
                servitudes: currentItem.servitudes || '',
                hypothèques: currentItem.hypothèques || '',

                // Étape 5: Historique transactions
                historiqueTransactions: Array.isArray(parsedTransactions) ? parsedTransactions : [],
                nouvelleTransaction: currentItem.nouvelleTransaction || { date: '', nature: '', details: '' },

                // Étape 6: Documents
                copieTitre: currentItem.copieTitre || null,
                actesNotaries: currentItem.actesNotaries || null,
                autresDocuments: currentItem.autresDocuments || []
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
                        <h3 className="text-xl font-semibold text-gray-800">Informations sur le titre</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentItem && <TextInputField
                                label="Numéro du titre"
                                name="numeroTitre"
                                value={formData.numeroTitre}
                                onChange={handleInputChange}
                                required
                                placeholder="Ex: T-2023-001"
                                readOnly
                            />}
                            <TextInputField
                                label="Date d'émission"
                                name="dateEmission"
                                type="date"
                                value={formData.dateEmission}
                                onChange={handleInputChange}
                                required
                            />
                            <TextInputField
                                label="Type de titre"
                                name="typeTitre"
                                value={formData.typeTitre}
                                onChange={handleInputChange}
                                type="select"
                                options={[
                                    { value: 'foncier', label: 'Titre foncier' },
                                    { value: 'immobilier', label: 'Titre immobilier' },
                                    { value: 'communautaire', label: 'Titre communautaire' },
                                    { value: 'concession', label: 'Titre de concession' },
                                    { value: 'autre', label: 'Autre' },
                                ]}
                                required={true}
                            />

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
                        <h3 className="text-xl font-semibold text-gray-800">Informations sur le propriétaire</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInputField
                                label="Nom"
                                name="proprietaireNom"
                                value={formData.proprietaireNom}
                                onChange={handleInputChange}
                                required
                            />
                            <TextInputField
                                label="Prénom"
                                name="proprietairePrenom"
                                value={formData.proprietairePrenom}
                                onChange={handleInputChange}
                                required
                            />
                            <TextInputField
                                label="Adresse"
                                name="proprietaireAdresse"
                                value={formData.proprietaireAdresse}
                                onChange={handleInputChange}
                                required
                            />
                            <TextInputField
                                label="Contact"
                                name="proprietaireContact"
                                value={formData.proprietaireContact}
                                onChange={handleInputChange}
                                required
                            />
                            <TextInputField
                                label="Email"
                                name="proprietaireEmail"
                                value={formData.proprietaireEmail}
                                onChange={handleInputChange}
                                placeholder="Email"
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
                        <h3 className="text-xl font-semibold text-gray-800">Droits et restrictions</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <TextInputField
                                label="Droits de propriété"
                                name="droitsPropriete"
                                value={formData.droitsPropriete}
                                onChange={handleInputChange}
                                type="textarea"
                                placeholder="Droits d'usage, de jouissance, de disposition..."
                                required
                            />
                            <TextInputField
                                label="Restrictions"
                                name="restrictions"
                                value={formData.restrictions}
                                onChange={handleInputChange}
                                type="textarea"
                                placeholder="Restrictions légales ou contractuelles..."
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInputField
                                    label="Servitudes"
                                    name="servitudes"
                                    value={formData.servitudes}
                                    onChange={handleInputChange}
                                    placeholder="Servitudes existantes"
                                />
                                <TextInputField
                                    label="Hypothèques"
                                    name="hypothèques"
                                    value={formData.hypothèques}
                                    onChange={handleInputChange}
                                    placeholder="Hypothèques en cours"
                                />
                            </div>
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
            {step === 5 && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Historique des transactions</h3>

                        <div className="space-y-2">
                            {formData.historiqueTransactions.map((transaction, index) => (
                                <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <span className="font-medium">{transaction.nature}</span> -
                                        <span className="text-sm text-gray-600 ml-2">{transaction.date}</span>
                                        {transaction.details && <p className="text-sm text-gray-600 mt-1">{transaction.details}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeTransaction(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.nouvelleTransaction.date}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        nouvelleTransaction: {
                                            ...formData.nouvelleTransaction,
                                            date: e.target.value
                                        }
                                    })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nature*</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.nouvelleTransaction.nature}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        nouvelleTransaction: {
                                            ...formData.nouvelleTransaction,
                                            nature: e.target.value
                                        }
                                    })}
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="vente">Vente</option>
                                    <option value="achat">Achat</option>
                                    <option value="donation">Donation</option>
                                    <option value="succession">Succession</option>
                                    <option value="hypothèque">Hypothèque</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>
                            <div className="flex items-end mb-1">
                                <button
                                    type="button"
                                    onClick={addTransaction}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                    disabled={!formData.nouvelleTransaction.date || !formData.nouvelleTransaction.nature}
                                >
                                    Ajouter
                                </button>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Détails</label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows="2"
                                    value={formData.nouvelleTransaction.details}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        nouvelleTransaction: {
                                            ...formData.nouvelleTransaction,
                                            details: e.target.value
                                        }
                                    })}
                                    placeholder="Détails supplémentaires..."
                                />
                            </div>
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
            {step === 6 && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Documents associés</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FileUpload
                                label="Copie du titre de propriété"
                                name="copieTitre"
                                files={formData.copieTitre}
                                onFilesChange={(files) => setFormData({ ...formData, copieTitre: files })}
                                accept=".pdf,.jpg,.png"
                                handleRemovePreviewFile={(index) => handleRemovePreviewFile('copieTitre', index)}
                            // prefilledFiles={[currentItem && currentItem.copieTitre]}
                            />
                            <FileUpload
                                label="Actes notariés"
                                name="actesNotaries"
                                files={formData.actesNotaries}
                                onFilesChange={(files) => setFormData({ ...formData, actesNotaries: files })}
                                accept=".pdf,.jpg,.png"
                                handleRemovePreviewFile={(index) => handleRemovePreviewFile('actesNotaries', index)}
                            // prefilledFiles={[currentItem && currentItem.actesNotaries]}
                            />
                            <FileUpload
                                label="Autres documents"
                                name="autresDocuments"
                                files={formData.autresDocuments}
                                onFilesChange={(files) => setFormData({ ...formData, autresDocuments: files })}
                                accept=".pdf,.jpg,.png"
                                multiple={true}
                                handleRemovePreviewFile={(index) => handleRemovePreviewFile('autresDocuments', index)}
                            // prefilledFiles={currentItem && currentItem.autresDocuments}
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
                                    <>{isLoading ? "Mise à jour en cours..." : "Mettre à jour"}</>
                                ) : (
                                    <>{isLoading ? "Enregistrement en cours..." : "Enregistrer"}</>
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