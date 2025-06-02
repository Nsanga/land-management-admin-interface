import { useState, useEffect } from 'react';
import { X, Link, ExternalLink, File, Upload, Loader } from 'lucide-react';

// Composant pour afficher une URL avec une prévisualisation élégante
const UrlPreview = ({ url, onRemove, index }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favicon, setFavicon] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    // Extraire le domaine pour le favicon et le titre par défaut
    try {
      const domain = new URL(url).hostname;
      setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      setTitle(domain);
      
      // Simuler le chargement (dans une vraie app, vous pourriez faire un fetch 
      // pour obtenir des métadonnées de l'URL via votre backend)
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  }, [url]);

  return (
    <div className="relative flex flex-col rounded-lg overflow-hidden border border-purple-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all w-full max-w-sm mb-4">
      {/* Bannière avec dégradé */}
      <div className="h-3 w-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
      
      {/* Prévisualisation */}
      <div className="flex flex-col p-4">
        {/* Haut de carte avec favicon et domaine */}
        <div className="flex items-center mb-3">
          {loading ? (
            <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
          ) : error ? (
            <Link size={18} className="text-gray-400" />
          ) : (
            <img 
              src={favicon} 
              alt="" 
              className="w-6 h-6 rounded-full border border-gray-200"
              onError={() => setFavicon('')}
            />
          )}
          <span className="ml-2 text-sm font-medium text-gray-600 truncate">{title}</span>
        </div>
        
        {/* Zone de prévisualisation */}
        <div className="relative bg-gray-100 rounded-md overflow-hidden h-36 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader size={24} className="text-blue-500 animate-spin mb-2" />
              <span className="text-xs text-gray-500">Chargement de l'aperçu...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center">
              <File size={24} className="text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Impossible de charger l'aperçu</span>
            </div>
          ) : (
            <>
              {/* Aperçu de l'URL dans un iframe masqué (ne s'affiche que lorsqu'il est chargé) */}
              <iframe 
                src={url} 
                title={`Preview of ${url}`}
                className="absolute inset-0 w-full h-full opacity-30"
                style={{ pointerEvents: 'none' }}
              />
              <div className="z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <span className="text-xs font-medium text-blue-800 truncate max-w-xs block">
                  {url.length > 40 ? `${url.substring(0, 40)}...` : url}
                </span>
              </div>
            </>
          )}
        </div>
        
        {/* Pied de carte avec boutons */}
        <div className="flex justify-between items-center mt-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            <ExternalLink size={14} className="mr-1" />
            Ouvrir le lien
          </a>
          
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center text-xs text-red-500 hover:text-red-700 font-medium"
          >
            <X size={14} className="mr-1" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlPreview;