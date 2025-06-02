import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../../services/api';
import { File, FileImage, FilePlus, FileText, Link, Trash2 } from 'lucide-react';
import UrlPreview from '../UrlPreview';

const AddReportForm = ({ currentItem, onClose, fetchReports }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    // État pour chaque section du formulaire
    const [generalInfo, setGeneralInfo] = useState({
        dateDescente: '',
        heureDebut: '',
        heureFin: '',
        lieuExact: '',
        coordonneesGPS: '',
        referenceDossier: '',
        objetDescente: 'constatation',
        membresCommission: [],
        autresPersonnes: [],
        conditionsMeteo: 'clair'
    });

    const [terrainInfo, setTerrainInfo] = useState({
        superficie: '',
        limitesBornes: '',
        topographie: '',
        occupationSol: '',
        infrastructures: '',
        servitudes: '',
        observations: ''
    });

    const [constatDetails, setConstatDetails] = useState({
        occupationParties: '',
        constructions: '',
        tracesActivites: '',
        respectPlans: '',
        difficultesBornage: '',
        accordParties: '',
        positionBornes: '',
        elementsEvaluation: '',
        comparaisonBiens: '',
        pointsDesaccord: '',
        preuvesObservées: ''
    });

    const [declarations, setDeclarations] = useState([]);
    const [newDeclaration, setNewDeclaration] = useState({
        nom: '',
        prenom: '',
        qualite: '',
        declaration: ''
    });

    const [piecesJointes, setPiecesJointes] = useState({
        documents: [],
        photos: []
    });
    const [photoDescriptions, setPhotoDescriptions] = useState({});

    const [recommandations, setRecommandations] = useState('');
    const [urgence, setUrgence] = useState('moyenne');
    const [partiesResponsables, setPartiesResponsables] = useState('');
    const [dateEcheance, setDateEcheance] = useState('');
    const [documentsToDelete, setDocumentsToDelete] = useState([]);
    const [photosToDelete, setPhotosToDelete] = useState([]);

    // Gestion des étapes
    const nextStep = () => {
        // Validation basique pour chaque étape
        if (step === 1 && !generalInfo.dateDescente) {
            toast.error('La date de descente est obligatoire');
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    // Handlers pour chaque section
    const handleGeneralInfoChange = (e) => {
        const { name, value } = e.target;
        setGeneralInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleConstatChange = (e) => {
        const { name, value } = e.target;
        setConstatDetails(prev => ({ ...prev, [name]: value }));
    };

    const addMembreCommission = () => {
        // Implémentation pour ajouter un membre
    };

    const handleTerrainInfoChange = (e) => {
        const { name, value } = e.target;
        setTerrainInfo(prev => ({ ...prev, [name]: value }));
    };


    const handleDeclarationChange = (e) => {
        const { name, value } = e.target;
        setNewDeclaration(prev => ({ ...prev, [name]: value }));
    };

    const addDeclaration = () => {
        if (newDeclaration.nom && newDeclaration.declaration) {
            setDeclarations([...declarations, newDeclaration]);
            setNewDeclaration({ nom: '', prenom: '', qualite: '', declaration: '' });
        } else {
            toast.error('Le nom et la déclaration sont obligatoires');
        }
    };

    const removeDeclaration = (index) => {
        setDeclarations(declarations.filter((_, i) => i !== index));
    };

    const editDeclaration = (index) => {
        setNewDeclaration(declarations[index]);
        removeDeclaration(index);
    };

    const handleDocumentDescriptionChange = (fileName, description) => {
        setPiecesJointes(prev => ({
            ...prev,
            documents: prev.documents.map(doc =>
                doc.file.name === fileName ? { ...doc, description } : doc
            )
        }));
    };

    const handleDescriptionChange = (index, description, type) => {
        setPiecesJointes(prev => ({
            ...prev,
            [type]: prev[type].map((item, i) =>
                i === index ? { ...item, description } : item
            )
        }));
    };

    const removeDocument = (index, type) => {
        setPiecesJointes(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
        console.log('piece supp', piecesJointes)
    };

    const handleFileUpload = (e, type) => {
        const files = Array.from(e.target.files);
        if (type === 'documents') {
            setPiecesJointes(prev => ({
                ...prev,
                documents: [
                    ...prev.documents,
                    ...files.map(file => ({ file, description: '' }))
                ]
            }));
        } else {
            setPiecesJointes(prev => ({
                ...prev,
                photos: [
                    ...prev.photos,
                    ...files.map(file => ({ file, description: '' }))
                ]
            }));
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();

        // Partie 1 : Infos générales
        Object.entries(generalInfo).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Partie 2 : Infos terrain
        Object.entries(terrainInfo).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Partie 3 : Détails constat
        Object.entries(constatDetails).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Partie 4 : Déclarations (si une seule dans ton modèle)
        if (declarations.length > 0) {
            const { nom, prenom, qualite, declaration } = declarations[0];
            formData.append('nom', nom);
            formData.append('prenom', prenom);
            formData.append('qualite', qualite);
            formData.append('declaration', declaration);
        }

        formData.append('recommandations', recommandations);
        formData.append('urgence', urgence);
        formData.append('partiesResponsables', partiesResponsables);
        formData.append('dateEcheance', dateEcheance);

        // Partie 5 : Documents
        piecesJointes.documents.forEach((doc) => {
            formData.append('documents', doc.file);
            formData.append('documentDescriptions', doc.description || '');
        });

        // Partie 6 : Photos
        piecesJointes.photos.forEach((photo) => {
            formData.append('photos', photo.file);
            formData.append('photoDescriptions', photo.description || '');
        });

        documentsToDelete.forEach(url => {
            formData.append('documentsToDelete[]', url);
        });

        photosToDelete.forEach(url => {
            formData.append('photosToDelete[]', url);
        });

        setIsLoading(true);

        // Envoi via Axios
        try {
            console.log(formData)
            if (!currentItem) {
                await API.post('/api/reports', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // PUT avec uniquement les champs modifiés (optionnel à implémenter)
                await API.put(`/api/reports/${currentItem._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            toast.success('Rapport enregistré avec succès');
            onClose();
            fetchReports();
        } catch (error) {
            console.error('Erreur lors de l’envoi du rapport :', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log(currentItem)
        if (currentItem) {
            // Préremplir les informations générales
            setGeneralInfo({
                dateDescente: currentItem.dateDescente?.split('T')[0] || '',
                heureDebut: currentItem.heureDebut || '',
                heureFin: currentItem.heureFin || '',
                lieuExact: currentItem.lieuExact || '',
                coordonneesGPS: currentItem.coordonneesGPS || '',
                referenceDossier: currentItem.referenceDossier || '',
                objetDescente: currentItem.objetDescente || 'constatation',
                membresCommission: currentItem.membresCommission || [],
                autresPersonnes: currentItem.autresPersonnes || [],
                conditionsMeteo: currentItem.conditionsMeteo || 'clair'
            });

            // Préremplir les informations terrain
            setTerrainInfo({
                superficie: currentItem.superficie || '',
                limitesBornes: currentItem.limitesBornes || '',
                topographie: currentItem.topographie || '',
                occupationSol: currentItem.occupationSol || '',
                infrastructures: currentItem.infrastructures || '',
                servitudes: currentItem.servitudes || '',
                observations: currentItem.observations || ''
            });

            // Préremplir les détails de constat
            setConstatDetails({
                occupationParties: currentItem.occupationParties || '',
                constructions: currentItem.constructions || '',
                tracesActivites: currentItem.tracesActivites || '',
                respectPlans: currentItem.respectPlans || '',
                difficultesBornage: currentItem.difficultesBornage || '',
                accordParties: currentItem.accordParties || '',
                positionBornes: currentItem.positionBornes || '',
                elementsEvaluation: currentItem.elementsEvaluation || '',
                comparaisonBiens: currentItem.comparaisonBiens || '',
                pointsDesaccord: currentItem.pointsDesaccord || '',
                preuvesObservées: currentItem.preuvesObservées || ''
            });

            // Préremplir les déclarations
            if (currentItem.nom || currentItem.prenom || currentItem.qualite || currentItem.declaration) {
                setDeclarations([{
                    nom: currentItem.nom || '',
                    prenom: currentItem.prenom || '',
                    qualite: currentItem.qualite || '',
                    declaration: currentItem.declaration || ''
                }]);
            } else {
                setDeclarations([]);
            }

            // Préremplir les pièces jointes
            setPiecesJointes({
                documents: currentItem.documents?.map(doc => ({
                    file: doc.file,
                    description: doc.description || '',
                })) || [],
                photos: currentItem.photos?.map(photo => ({
                    file: photo.file,
                    description: photo.description || '',
                })) || []
            });

            // Préremplir les autres champs
            setRecommandations(currentItem.recommandations || '');
            setUrgence(currentItem.urgence || 'moyenne');
            setPartiesResponsables(currentItem.partiesResponsables || '');
            setDateEcheance(currentItem.dateEcheance || '')
        }
    }, [currentItem]);

    const handleRemoveFile = (fileUrl) => {
        setPiecesJointes(prev => ({
            ...prev,
            documents: prev.documents.filter(doc => doc.file !== fileUrl),
            photos: prev.photos.filter(photo => photo.file !== fileUrl),
        }));

        setDocumentsToDelete(prev => [...prev, fileUrl]);
        setPhotosToDelete(prev => [...prev, fileUrl]);
    };


    // Rendu conditionnel en fonction de l'objet de la descente
    const renderFields = () => {
        switch (generalInfo.objetDescente) {
            case 'constatation':
                return (
                    <>
                        <div>
                            <label className="block mb-1">État d'occupation par les parties prenantes</label>
                            <textarea
                                name="occupationParties"
                                value={constatDetails.occupationParties}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Identification des occupants, nature de l'occupation..."
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Existence de constructions</label>
                            <textarea
                                name="constructions"
                                value={constatDetails.constructions}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Description, matériaux, état..."
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Traces d'activités récentes ou anciennes</label>
                            <textarea
                                name="tracesActivites"
                                value={constatDetails.tracesActivites}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="2"
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Respect des plans ou permis éventuels</label>
                            <textarea
                                name="respectPlans"
                                value={constatDetails.respectPlans}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="2"
                            />
                        </div>
                    </>
                );

            case 'bornage':
                return (
                    <>
                        <div>
                            <label className="block mb-1">Difficultés rencontrées lors de l'identification des limites</label>
                            <textarea
                                name="difficultesBornage"
                                value={constatDetails.difficultesBornage}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Accord ou désaccord des parties prenantes</label>
                            <textarea
                                name="accordParties"
                                value={constatDetails.accordParties}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Décrire les positions de chaque partie..."
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Positionnement des nouvelles bornes</label>
                            <textarea
                                name="positionBornes"
                                value={constatDetails.positionBornes}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Description et coordonnées GPS si possible..."
                            />
                        </div>
                    </>
                );

            case 'evaluation':
                return (
                    <>
                        <div>
                            <label className="block mb-1">Éléments pris en compte pour l'évaluation</label>
                            <textarea
                                name="elementsEvaluation"
                                value={constatDetails.elementsEvaluation}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Nature du sol, accessibilité, environnement..."
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Comparaison avec des biens similaires</label>
                            <textarea
                                name="comparaisonBiens"
                                value={constatDetails.comparaisonBiens}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="2"
                                placeholder="Références des biens comparés..."
                            />
                        </div>
                    </>
                );

            case 'litige':
                return (
                    <>
                        <div>
                            <label className="block mb-1">Points de désaccord clairement identifiés</label>
                            <textarea
                                name="pointsDesaccord"
                                value={constatDetails.pointsDesaccord}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Éléments de preuve observés</label>
                            <textarea
                                name="preuvesObservées"
                                value={constatDetails.preuvesObservées}
                                onChange={handleConstatChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Traces d'empiètement, modifications..."
                            />
                        </div>
                    </>
                );

            default:
                return (
                    <div>
                        <label className="block mb-1">Observations spécifiques</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            rows="5"
                            placeholder="Décrire en détail les constatations..."
                        />
                    </div>
                );
        }
    };

    // Barre de progression
    const ProgressBar = () => {
        const steps = [
            "Général",
            "Terrain",
            "Constatations",
            "Déclarations",
            "Pièces jointes",
            "Recommandations",
            "Prévisualisation"
        ];

        return (
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((stepName, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${step > index ? 'bg-green-500 text-white' :
                                    step === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {index + 1}
                            </div>
                            <div className={`text-xs mt-1 ${step >= index + 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                {stepName}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="w-full bg-gray-200 h-1.5 mt-3">
                    <div
                        className="bg-blue-600 h-1.5 transition-all duration-300"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <ProgressBar />

            <form>
                {step === 1 && <div className="space-y-6">
                    <h2 className="text-2xl font-bold">1. Informations Générales</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">Date de la descente*</label>
                            <input
                                type="date"
                                name="dateDescente"
                                value={generalInfo.dateDescente}
                                onChange={handleGeneralInfoChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Heure de début</label>
                            <input
                                type="time"
                                name="heureDebut"
                                value={generalInfo.heureDebut}
                                onChange={handleGeneralInfoChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Heure de fin</label>
                            <input
                                type="time"
                                name="heureFin"
                                value={generalInfo.heureFin}
                                onChange={handleGeneralInfoChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Objet de la descente*</label>
                            <select
                                name="objetDescente"
                                value={generalInfo.objetDescente}
                                onChange={handleGeneralInfoChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="constatation">Constatation</option>
                                <option value="bornage">Bornage</option>
                                <option value="evaluation">Évaluation</option>
                                <option value="litige">Règlement de litige</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1">Lieu exact de la descente*</label>
                        <input
                            type="text"
                            name="lieuExact"
                            value={generalInfo.lieuExact}
                            onChange={handleGeneralInfoChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Coordonnées GPS (optionnel)</label>
                        <input
                            type="text"
                            name="coordonneesGPS"
                            value={generalInfo.coordonneesGPS}
                            onChange={handleGeneralInfoChange}
                            className="w-full p-2 border rounded"
                            placeholder="Ex: 4.123456, -2.123456"
                        />
                    </div>
                </div>}

                {step === 2 &&
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">2. Description du Terrain</h2>

                        <div>
                            <label className="block mb-1">Superficie approximative</label>
                            <div className="flex">
                                <input
                                    type="text"
                                    name="superficie"
                                    value={terrainInfo.superficie}
                                    onChange={handleTerrainInfoChange}
                                    className="w-3/4 p-2 border rounded"
                                    placeholder="Ex: 2.5"
                                />
                                <select className="w-1/4 p-2 border rounded ml-2">
                                    <option>hectares</option>
                                    <option>m²</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1">Limites et bornes</label>
                            <textarea
                                name="limitesBornes"
                                value={terrainInfo.limitesBornes}
                                onChange={handleTerrainInfoChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Description des limites, bornes, points de repère..."
                            />
                        </div>

                        <div>
                            <label className="block mb-1">Topographie</label>
                            <textarea
                                name="topographie"
                                value={terrainInfo.topographie}
                                onChange={handleTerrainInfoChange}
                                className="w-full p-2 border rounded"
                                rows="2"
                                placeholder="Description du relief, pente, cours d'eau..."
                            />
                        </div>
                    </div>
                }

                {step === 3 &&
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">3. Constatations et Observations Spécifiques</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Section adaptée à l'objet: <span className="font-semibold capitalize">{generalInfo.objetDescente}</span>
                        </p>

                        {renderFields()}

                        <div>
                            <label className="block mb-1">Observations complémentaires</label>
                            <textarea
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Toute autre observation pertinente..."
                            />
                        </div>
                    </div>
                }

                {step === 4 &&
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">4. Déclarations des Personnes Présentes</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Enregistrez les déclarations faites par les personnes présentes lors de la descente
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block mb-1">Nom*</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={newDeclaration.nom}
                                    onChange={handleDeclarationChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Prénom</label>
                                <input
                                    type="text"
                                    name="prenom"
                                    value={newDeclaration.prenom}
                                    onChange={handleDeclarationChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Qualité/Fonction</label>
                                <input
                                    type="text"
                                    name="qualite"
                                    value={newDeclaration.qualite}
                                    onChange={handleDeclarationChange}
                                    className="w-full p-2 border rounded"
                                    placeholder="Ex: Propriétaire, Témoin, Expert..."
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1">Déclaration*</label>
                            <textarea
                                name="declaration"
                                value={newDeclaration.declaration}
                                onChange={handleDeclarationChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                                required
                            />
                        </div>

                        <button
                            type="button"
                            onClick={addDeclaration}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
                        >
                            Ajouter cette déclaration
                        </button>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Déclarations enregistrées ({declarations.length})</h3>

                            {declarations.length === 0 ? (
                                <p className="text-gray-500">Aucune déclaration enregistrée</p>
                            ) : (
                                <div className="space-y-4">
                                    {declarations.map((decl, index) => (
                                        <div key={index} className="border p-4 rounded-lg relative">
                                            <button
                                                onClick={() => removeDeclaration(index)}
                                                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                                title="Supprimer"
                                            >
                                                ×
                                            </button>
                                            <button
                                                onClick={() => editDeclaration(index)}
                                                className="absolute top-2 right-8 text-blue-600 hover:text-blue-800"
                                                title="Modifier"
                                            >
                                                ✎
                                            </button>

                                            <h4 className="font-medium">
                                                {decl.nom} {decl.prenom && `${decl.prenom}`}
                                                {decl.qualite && ` (${decl.qualite})`}
                                            </h4>
                                            <p className="text-gray-700 mt-1 whitespace-pre-line">{decl.declaration}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                }

                {step === 5 &&
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">5. Pièces Jointes</h2>

                        {/* Section Documents */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-3">Documents</h3>

                            {/* Mode édition - Affichage des URLs existantes */}
                            {currentItem && piecesJointes.documents.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-medium mb-3 text-gray-700 flex items-center">
                                        <Link size={16} className="mr-2 text-purple-500" />
                                        Documents existants ({piecesJointes.documents.filter(doc => typeof doc.file === 'string').length})
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {piecesJointes.documents.map((doc, index) => (
                                            typeof doc.file === 'string' && (
                                                <UrlPreview
                                                    key={`url-${index}`}
                                                    url={doc.file}
                                                    onRemove={() => handleRemoveFile(doc.file)}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Zone d'ajout de fichiers */}
                            <div className="flex flex-wrap items-center mb-6">
                                <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full cursor-pointer hover:shadow-md transition-all mr-3 mb-2">
                                    <FilePlus size={16} className="mr-2" />
                                    {currentItem ? 'Ajouter de nouveaux documents' : 'Ajouter des documents'}
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        onChange={(e) => handleFileUpload(e, 'documents')}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    />
                                </label>
                                <span className="text-sm text-gray-500 flex items-center mb-2">
                                    <File size={14} className="mr-1" />
                                    Formats acceptés: PDF, Word, Excel (max 10MB)
                                </span>
                            </div>

                            {/* Nouveaux fichiers (mode création/édition) */}
                            {piecesJointes.documents.filter(doc => {
                                // Vérification plus robuste que instanceof
                                return doc.file && typeof doc.file === 'object' && 'name' in doc.file && 'size' in doc.file;
                            }).length > 0 && (
                                    <div className="border rounded-lg p-4 mb-6">
                                        <h4 className="font-medium mb-3">
                                            {currentItem ? 'Nouveaux documents' : 'Documents à envoyer'} ({piecesJointes.documents.filter(doc =>
                                                doc.file && typeof doc.file === 'object' && 'name' in doc.file
                                            ).length})
                                        </h4>

                                        <ul className="space-y-2">
                                            {piecesJointes.documents.map((doc, index) => {
                                                if (!doc.file || typeof doc.file !== 'object' || !('name' in doc.file)) return null;

                                                return (
                                                    <li key={`file-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                        <div className="flex items-center truncate">
                                                            <File size={14} className="mr-2 text-gray-500 flex-shrink-0" />
                                                            <div>
                                                                <p className="truncate">{doc.file.name}</p>
                                                                <p className="text-xs text-gray-400">
                                                                    {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setPiecesJointes(prev => ({
                                                                    ...prev,
                                                                    documents: prev.documents.filter((_, i) => i !== index)
                                                                }));
                                                            }}
                                                            className="text-red-500 hover:text-red-700 ml-2"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                            {/* Message vide */}
                            {piecesJointes.documents.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-400">
                                    <FileText size={24} className="mx-auto mb-2" />
                                    {currentItem ? 'Aucun document associé' : 'Aucun document joint'}
                                </div>
                            )}
                        </div>

                        {/* Section Photos */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Photographies</h3>

                            {/* Mode édition - Affichage des URLs existantes */}
                            {currentItem && piecesJointes.photos.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-medium mb-3 text-gray-700 flex items-center">
                                        <Link size={16} className="mr-2 text-purple-500" />
                                        Photographies existantes ({piecesJointes.photos.filter(photo => typeof photo.file === 'string').length})
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {piecesJointes.photos.map((photo, index) => (
                                            typeof photo.file === 'string' && (
                                                <UrlPreview
                                                    key={`photo-url-${index}`}
                                                    url={photo.file}
                                                    onRemove={() => handleRemoveFile(photo.file)}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Zone d'ajout de photos */}
                            <div className="flex flex-wrap items-center mb-6">
                                <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full cursor-pointer hover:shadow-md transition-all mr-3 mb-2">
                                    <FilePlus size={16} className="mr-2" />
                                    {currentItem ? 'Ajouter de nouvelles photos' : 'Ajouter des photos'}
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        onChange={(e) => handleFileUpload(e, 'photos')}
                                        accept="image/*"
                                        capture="environment"
                                    />
                                </label>
                                <span className="text-sm text-gray-500 flex items-center mb-2">
                                    <File size={14} className="mr-1" />
                                    Formats acceptés: JPG, PNG (max 5MB)
                                </span>
                            </div>

                            {/* Nouveaux fichiers (mode création/édition) */}
                            {piecesJointes.photos.filter(photo => {
                                return photo.file && typeof photo.file === 'object' && 'name' in photo.file && 'type' in photo.file;
                            }).length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="font-medium">
                                            {currentItem ? 'Nouvelles photos' : 'Photos à envoyer'} ({piecesJointes.photos.filter(photo =>
                                                photo.file && typeof photo.file === 'object' && 'name' in photo.file
                                            ).length})
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {piecesJointes.photos.map((photo, index) => {
                                                if (!photo.file || typeof photo.file !== 'object' || !('name' in photo.file)) return null;

                                                return (
                                                    <div key={`photo-${index}`} className="border rounded-lg p-3">
                                                        <div className="mb-2 h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                                                            {photo.file.type.startsWith('image/') ? (
                                                                <img
                                                                    src={URL.createObjectURL(photo.file)}
                                                                    alt={`Preview ${index}`}
                                                                    className="max-h-full max-w-full object-contain"
                                                                />
                                                            ) : (
                                                                <FileImage size={24} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <textarea
                                                            value={photo.description || ''}
                                                            onChange={(e) => handleDescriptionChange(index, e.target.value, 'photos')}
                                                            className="w-full p-2 border rounded text-sm"
                                                            rows="2"
                                                            placeholder="Description de la photo..."
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                setPiecesJointes(prev => ({
                                                                    ...prev,
                                                                    photos: prev.photos.filter((_, i) => i !== index)
                                                                }));
                                                            }}
                                                            className="flex justify-end mt-2 text-sm text-red-600 hover:text-red-800 w-full text-center"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                            {/* Message vide */}
                            {piecesJointes.photos.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-400">
                                    <FileImage size={24} className="mx-auto mb-2" />
                                    {currentItem ? 'Aucune photo associée' : 'Aucune photo jointe'}
                                </div>
                            )}
                        </div>
                    </div>
                }

                {step === 6 &&
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">6. Recommandations et Suites à Donner</h2>

                        <div>
                            <label className="block mb-1">Actions recommandées*</label>
                            <textarea
                                value={recommandations}
                                onChange={(e) => setRecommandations(e.target.value)}
                                className="w-full p-2 border rounded"
                                rows="5"
                                required
                                placeholder="Détailler les actions à entreprendre suite à cette descente..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1">Niveau d'urgence*</label>
                                <select
                                    value={urgence}
                                    onChange={(e) => setUrgence(e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="faible">Faible</option>
                                    <option value="moyenne">Moyenne</option>
                                    <option value="élevée">Élevée</option>
                                    <option value="critique">Critique</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1">Parties responsables</label>
                                <input
                                    type="text"
                                    value={partiesResponsables}
                                    onChange={(e) => setPartiesResponsables(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Services ou personnes responsables"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1">Échéance recommandée</label>
                            <input
                                type="date"
                                value={dateEcheance}
                                onChange={(e) => setDateEcheance(e.target.value)}
                                className="w-full p-2 border rounded"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="bg-blue-50 p-4 rounded border border-blue-100">
                            <h3 className="font-semibold text-blue-800 mb-2">Conseils pour les recommandations :</h3>
                            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                                <li>Soyez aussi précis que possible dans les actions à entreprendre</li>
                                <li>Priorisez les recommandations par ordre d'importance</li>
                                <li>Identifiez clairement les responsables pour chaque action</li>
                                <li>Précisez des échéances réalistes</li>
                            </ul>
                        </div>
                    </div>
                }

                {step === 7 &&
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Prévisualisation du Rapport</h2>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-2">1. Informations Générales</h3>
                            <p><strong>Date:</strong> {generalInfo.dateDescente}</p>
                            <p><strong>Lieu:</strong> {generalInfo.lieuExact}</p>
                            <p><strong>Objet:</strong> {generalInfo.objetDescente}</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-2">2. Description du Terrain</h3>
                            <p><strong>Superficie:</strong> {terrainInfo.superficie}</p>
                            <p><strong>Limites:</strong> {terrainInfo.limitesBornes}</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-3 border-b pb-2">3. Constatations et Observations Spécifiques</h3>
                            <p className="text-sm text-gray-500 mb-3">
                                Objet de la descente: <span className="font-medium capitalize">{generalInfo.objetDescente}</span>
                            </p>

                            {generalInfo.objetDescente === 'constatation' && (
                                <>
                                    {constatDetails.occupationParties && (
                                        <div className="mb-4">
                                            <h4 className="font-medium mb-1">État d'occupation:</h4>
                                            <p className="whitespace-pre-line">{constatDetails.occupationParties}</p>
                                        </div>
                                    )}
                                    {constatDetails.constructions && (
                                        <div className="mb-4">
                                            <h4 className="font-medium mb-1">Constructions:</h4>
                                            <p className="whitespace-pre-line">{constatDetails.constructions}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {generalInfo.objetDescente === 'bornage' && (
                                <>
                                    {constatDetails.difficultesBornage && (
                                        <div className="mb-4">
                                            <h4 className="font-medium mb-1">Difficultés rencontrées:</h4>
                                            <p className="whitespace-pre-line">{constatDetails.difficultesBornage}</p>
                                        </div>
                                    )}
                                    {constatDetails.positionBornes && (
                                        <div className="mb-4">
                                            <h4 className="font-medium mb-1">Position des bornes:</h4>
                                            <p className="whitespace-pre-line">{constatDetails.positionBornes}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Ajouter les autres cas (évaluation, litige) de la même manière */}

                            {constatDetails.observations && (
                                <div className="mt-4">
                                    <h4 className="font-medium mb-1">Observations complémentaires:</h4>
                                    <p className="whitespace-pre-line">{constatDetails.observations}</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-2">4. Déclarations des Personnes Présentes</h3>
                            {declarations.length > 0 ? (
                                <div className="space-y-3">
                                    {declarations.map((decl, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-1">
                                            <p className="font-medium">
                                                {decl.nom} {decl.prenom && `${decl.prenom}`}
                                                {decl.qualite && ` (${decl.qualite})`}:
                                            </p>
                                            <p className="text-gray-700">"{decl.declaration}"</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">Aucune déclaration enregistrée</p>
                            )}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-3 border-b pb-2">5. Pièces Jointes</h3>

                            {/* Section Documents */}
                            <div className="mb-6">
                                <h4 className="font-medium mb-3">Documents joints:</h4>
                                {piecesJointes.documents.length > 0 ? (
                                    <div className="space-y-3">
                                        {piecesJointes.documents.map((doc, index) => {
                                            // Vérification du type de fichier
                                            const isUrl = typeof doc.file === 'string';
                                            const fileName = isUrl
                                                ? doc.file.split('/').pop() || `Document ${index + 1}`
                                                : doc.file?.name || `Document ${index + 1}`;

                                            return (
                                                <div key={`doc-${index}`} className="flex items-start p-3 border rounded-lg bg-gray-50">
                                                    <div className="mr-3 mt-1">
                                                        <FileText size={18} className="text-blue-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{fileName}</p>
                                                        {doc.description && (
                                                            <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                                        )}
                                                        {isUrl && (
                                                            <a
                                                                href={doc.file}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                                                            >
                                                                Voir le document
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 border-2 border-dashed rounded-lg text-gray-400">
                                        <FileText size={24} className="mx-auto mb-2" />
                                        Aucun document joint
                                    </div>
                                )}
                            </div>

                            {/* Section Photos */}
                            <div>
                                <h4 className="font-medium mb-3">Photographies:</h4>
                                {piecesJointes.photos.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {piecesJointes.photos.map((photo, index) => {
                                            // Vérification du type de fichier
                                            const isUrl = typeof photo.file === 'string';
                                            const previewUrl = isUrl
                                                ? photo.file
                                                : URL.createObjectURL(photo.file);
                                            const fileName = isUrl
                                                ? photo.file.split('/').pop() || `Photo ${index + 1}`
                                                : photo.file?.name || `Photo ${index + 1}`;

                                            return (
                                                <div key={`photo-${index}`} className="border rounded-lg overflow-hidden">
                                                    <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={previewUrl}
                                                            alt={`Photo ${index + 1}`}
                                                            className="max-h-full max-w-full object-contain"
                                                            onLoad={() => !isUrl && URL.revokeObjectURL(previewUrl)}
                                                        />
                                                    </div>
                                                    <div className="p-3">
                                                        <p className="text-sm font-medium truncate">{fileName}</p>
                                                        {photo.description && (
                                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{photo.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-400">
                                        <ImageIcon size={24} className="mx-auto mb-2" />
                                        Aucune photo jointe
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-3 border-b pb-2">6. Recommandations et Suites à Donner</h3>

                            <div className="mb-4">
                                <h4 className="font-medium mb-1">Actions recommandées:</h4>
                                <div className="bg-gray-50 p-3 rounded">
                                    {recommandations ? (
                                        <p className="whitespace-pre-line">{recommandations}</p>
                                    ) : (
                                        <p className="text-gray-500">Aucune recommandation spécifiée</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <h4 className="font-medium mb-1">Niveau d'urgence:</h4>
                                    <p className="capitalize bg-gray-50 p-2 rounded">{urgence}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Parties responsables:</h4>
                                    <p className="bg-gray-50 p-2 rounded">
                                        {partiesResponsables || "Non spécifié"}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Priorité:</h4>
                                    <p className="bg-gray-50 p-2 rounded">
                                        {urgence === 'faible' ? 'Basse priorité' :
                                            urgence === 'moyenne' ? 'Priorité moyenne' :
                                                urgence === 'élevée' ? 'Haute priorité' : 'Urgence absolue'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Ajouter les autres sections de prévisualisation */}

                        <div className="mt-6 p-4 bg-gray-50 rounded">
                            <h3 className="font-semibold">Vérifiez attentivement les informations avant soumission</h3>
                            <p className="text-sm text-gray-600">Le rapport sera envoyé aux parties concernées après validation</p>
                        </div>
                    </div>
                }

                <div className="flex justify-between mt-8">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Précédent
                        </button>
                    )}

                    {step < 7 && (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Suivant
                        </button>
                    )}

                    {step === 7 && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            {currentItem ? (
                                <>
                                    {isLoading ? "Mise à jour en cours..." : "Mettre à jour"}
                                </>
                            ) : (
                                <>
                                    {isLoading ? "Enregistrement en cours..." : "Soumettre le Rapport"}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddReportForm;