import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../services/api";
import FileUpload from "../FileUpload";

export default function AddParcelForm({ onClose, fetchParcels, currentItem }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Étape 1: Informations générales
        adresse: '',
        rue: '',
        numero: '',
        ville: '',
        codePostal: '',
        superficie: '',

        // Étape 2: Caractéristiques
        typeSol: '',
        topographie: '',
        usageActuel: '',

        // Étape 3: Limites
        coordonnees: '',
        planParcelle: null,
        pointsBornage: '',

        // Étape 4: Propriétaires et droits
        proprietaireNom: '',
        proprietaireAdresse: '',
        proprietaireContact: '',
        droitsFonciers: '',
        servitudes: '',
        hypothèques: '',

        // Étape 5: Documents
        titrePropriete: null,
        planCadastral: null,
        autresDocuments: []
    });

    const [titreProprieteToDelete, setTitreProprieteToDelete] = useState(null)
    const [planCadastralToDelete, setPlanCadastralToDelete] = useState(null)
    const [planParcelleToDelete, setPlanParcelleToDelete] = useState(null)
    const [autresDocumentsToDelete, setAutresDocumentsToDelete] = useState([])


    const nextStep = () => {
        // Tableau de validation pour chaque étape
        const validationRules = [
            { step: 1, condition: !formData.superficie, message: 'Veuillez remplir la superficie.' },
            { step: 3, condition: !formData.coordonnees, message: 'Veuillez remplir les coordonnées.' },
            { step: 4, condition: !formData.proprietaireNom || !formData.proprietaireAdresse || !formData.proprietaireContact, message: 'Veuillez remplir tous les champs du propriétaire.' },
        ];

        // Vérification des règles de validation
        const validationError = validationRules.find(rule => rule.step === step && rule.condition);

        if (validationError) {
            toast.error(validationError.message);
            return;
        }

        // Passer à l'étape suivante
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
            case 'titrePropriete':
              setTitreProprieteToDelete(removedFile);
              break;
            case 'planCadastral':
              setPlanCadastralToDelete(removedFile);
              break;
            case 'planParcelle':
              setPlanParcelleToDelete(removedFile);
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

        // Fonction pour comparer deux valeurs (simple ou objet)
        const isDifferent = (key, value) => {
            if (!currentItem || !(key in currentItem)) return true;

            const initialValue = currentItem[key];

            // Pour les fichiers, vérifier que c'est un File ou un array de File
            if (value instanceof File) return true;

            if (Array.isArray(value)) {
                return JSON.stringify(value) !== JSON.stringify(initialValue);
            }

            return value !== initialValue;
        };

        // Champs texte simples ou tableaux
        Object.entries(formData).forEach(([key, value]) => {
            if (
                value !== null &&
                typeof value !== 'object' &&
                isDifferent(key, value)
            ) {
                formDataToSend.append(key, value);
            }
        });

        // Ajout conditionnel des fichiers si modifiés
        if (formData.planParcelle instanceof File) {
            formDataToSend.append('planParcelle', formData.planParcelle);
        }

        if (formData.titrePropriete instanceof File) {
            formDataToSend.append('titrePropriete', formData.titrePropriete);
        }

        if (formData.planCadastral instanceof File) {
            formDataToSend.append('planCadastral', formData.planCadastral);
        }

        if (formData.autresDocuments && formData.autresDocuments.length > 0) {
            formData.autresDocuments.forEach(file => {
                if (file instanceof File) {
                    formDataToSend.append('autresDocuments', file);
                }
            });
        }

        if (titreProprieteToDelete) {
            formDataToSend.append('titreProprieteToDelete', titreProprieteToDelete ? "true" : "false");
        }

        if (planCadastralToDelete) {
            formDataToSend.append('planCadastralToDelete', planCadastralToDelete ? "true" : "false");
        }

        if (planParcelleToDelete) {
            formDataToSend.append('planParcelleToDelete', planParcelleToDelete ? "true" : "false");
        }

        if (autresDocumentsToDelete.length > 0) {
            autresDocumentsToDelete.forEach(url => {
                formDataToSend.append('autresDocumentsToDelete[]', url);
            });
        }


        setIsLoading(true);

        try {
            if (!currentItem) {
                await API.post('/parcels', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await API.put(`/parcels/${currentItem._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            toast.success('Parcelle enregistrée avec succès');
            onClose();
            fetchParcels();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Barre de progression
    const ProgressBar = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map((stepNumber) => (
                    <div key={stepNumber} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                            ${step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {stepNumber}
                        </div>
                        <div className={`text-xs mt-2 ${step >= stepNumber ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                            {stepNumber === 1 && 'Général'}
                            {stepNumber === 2 && 'Caractéristiques'}
                            {stepNumber === 3 && 'Limites'}
                            {stepNumber === 4 && 'Propriétaires'}
                            {stepNumber === 5 && 'Documents'}
                        </div>
                    </div>
                ))}
            </div>
            <div className="w-full bg-gray-200 h-1 mt-4">
                <div
                    className="bg-blue-600 h-1 transition-all duration-300"
                    style={{ width: `${(step / 5) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    useEffect(() => {
        if (currentItem) {
            setFormData({
                // Étape 1: Informations générales
                adresse: currentItem.adresse || '',
                rue: currentItem.rue || '',
                numero: currentItem.numero || '',
                ville: currentItem.ville || '',
                codePostal: currentItem.codePostal || '',
                superficie: currentItem.superficie || '',

                // Étape 2: Caractéristiques
                typeSol: currentItem.typeSol || '',
                topographie: currentItem.topographie || '',
                usageActuel: currentItem.usageActuel || '',

                // Étape 3: Limites
                coordonnees: currentItem.coordonnees || '',
                planParcelle: currentItem.planParcelle || null,
                pointsBornage: currentItem.pointsBornage || '',

                // Étape 4: Propriétaires et droits
                proprietaireNom: currentItem.proprietaireNom || '',
                proprietaireAdresse: currentItem.proprietaireAdresse || '',
                proprietaireContact: currentItem.proprietaireContact || '',
                droitsFonciers: currentItem.droitsFonciers || '',
                servitudes: currentItem.servitudes || '',
                hypothèques: currentItem.hypothèques || '',

                // Étape 5: Documents
                titrePropriete: currentItem.titrePropriete || null,
                planCadastral: currentItem.planCadastral || null,
                autresDocuments: currentItem.autresDocuments || []
            });
        }
    }, [currentItem]);

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white min-h-[calc(100vh-100px)]">
            {/* Barre de progression */}
            <ProgressBar />

            {/* Contenu de l'étape actuelle */}
            {step === 1 && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Informations générales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (m²) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="superficie"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.superficie}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <input
                                    type="text"
                                    name="adresse"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.adresse}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rue</label>
                                <input
                                    type="text"
                                    name="rue"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.rue}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                <input
                                    type="text"
                                    name="ville"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.ville}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                                <input
                                    type="text"
                                    name="codePostal"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.codePostal}
                                    onChange={handleInputChange}
                                />
                            </div> */}
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
                        <h3 className="text-xl font-semibold text-gray-800">Caractéristiques de la parcelle</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type de sol</label>
                                <select
                                    name="typeSol"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.typeSol}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="agricole">Agricole</option>
                                    <option value="forestier">Forestier</option>
                                    <option value="urbain">Urbain</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topographie</label>
                                <select
                                    name="topographie"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.topographie}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="plat">Plat</option>
                                    <option value="pente">En pente</option>
                                    <option value="vallonné">Vallonné</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usage actuel</label>
                                <select
                                    name="usageActuel"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.usageActuel}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="agricole">Agricole</option>
                                    <option value="residentiel">Résidentiel</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="industriel">Industriel</option>
                                </select>
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
            {step === 3 && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Limites de la parcelle</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coordonnées géographiques (lat,long)<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="coordonnees"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Ex: 12.3456, -12.3456"
                                    value={formData.coordonnees}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Points de bornage</label>
                                <textarea
                                    name="pointsBornage"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows="3"
                                    value={formData.pointsBornage}
                                    onChange={handleInputChange}
                                    placeholder="Décrire les points de bornage..."
                                />
                            </div>
                            <FileUpload
                                label="Plan de la parcelle"
                                name="planParcelle"
                                files={formData.planParcelle}
                                onFilesChange={(files) => setFormData({ ...formData, planParcelle: files })}
                                accept=".pdf,.jpg,.png"
                                handleRemovePreviewFile={(index) => handleRemovePreviewFile('planParcelle', index)}
                            // prefilledFiles={[currentItem && currentItem.planParcelle]}
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
                        <h3 className="text-xl font-semibold text-gray-800">Propriétaires et droits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du propriétaire<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="proprietaireNom"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.proprietaireNom}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse du propriétaire<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="proprietaireAdresse"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.proprietaireAdresse}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact du propriétaire<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="proprietaireContact"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.proprietaireContact}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Droits fonciers</label>
                                <textarea
                                    name="droitsFonciers"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows="2"
                                    value={formData.droitsFonciers}
                                    onChange={handleInputChange}
                                    placeholder="Décrire les droits fonciers..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Servitudes</label>
                                <input
                                    type="text"
                                    name="servitudes"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.servitudes}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hypothèques</label>
                                <input
                                    type="text"
                                    name="hypothèques"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.hypothèques}
                                    onChange={handleInputChange}
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
                        <h3 className="text-xl font-semibold text-gray-800">Documents associés</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FileUpload
                                label="Titre de propriété"
                                name="titrePropriete"
                                files={formData.titrePropriete}
                                onFilesChange={(files) => setFormData({ ...formData, titrePropriete: files })}
                                accept=".pdf,.jpg,.png"
                                handleRemovePreviewFile={(index) => handleRemovePreviewFile('titrePropriete', index)}
                            // prefilledFiles={[currentItem && currentItem.titrePropriete]}
                            />
                            <FileUpload
                                label="Plan cadastral"
                                name="planCadastral"
                                files={formData.planCadastral}
                                onFilesChange={(files) => setFormData({ ...formData, planCadastral: files })}
                                accept=".pdf,.jpg,.png"
                                handleRemovePreviewFile={(index) => handleRemovePreviewFile('planCadastral', index)}
                            // prefilledFiles={[currentItem && currentItem.planCadastral]}
                            />
                            <FileUpload
                                label="Autres documents"
                                name="autresDocuments"
                                files={formData.autresDocuments}
                                onFilesChange={(files) => setFormData({ ...formData, autresDocuments: files })}
                                accept=".pdf,.jpg,.png"
                                handleRemovePreviewFile={(index) => handleRemovePreviewFile('autresDocuments', index)}
                                // prefilledFiles={currentItem && currentItem.autresDocuments}
                                multiple
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
                                disable={isLoading}
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