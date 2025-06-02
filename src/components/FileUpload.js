import React from 'react';
import UrlPreview from './UrlPreview';

const FileUpload = ({
  label,
  name,
  files = null, // Peut être null ou tableau
  onFilesChange,
  accept = '.pdf,.jpg,.png',
  required = false,
  multiple = false,
  prefilledFiles = [], // URL de fichiers à pré-remplir
  handleRemovePreviewFile
}) => {
  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (multiple) {
      onFilesChange(selectedFiles);
    } else {
      onFilesChange(selectedFiles[0] || null);
    }
  };

  const handleRemoveFile = (index) => {
    if (multiple) {
      const updatedFiles = (files || []).filter((_, i) => i !== index);
      onFilesChange(updatedFiles);
    } else {
      onFilesChange(null);
    }
  };

  const displayFiles = multiple ? (files || []) : files ? [files] : [];

  const combinedFiles = [...prefilledFiles, ...displayFiles]; // Combina les fichiers pré-remplis et ceux sélectionnés par l'utilisateur

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>

      <input
        type="file"
        id={name}
        name={name}
        multiple={multiple}
        className="sr-only"
        onChange={handleChange}
        accept={accept}
        required={required && combinedFiles.length === 0}
      />

      <label
        htmlFor={name}
        className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors"
      >
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        {combinedFiles.length > 0 ? (
          <span className="text-sm font-medium text-gray-700">
            {multiple
              ? `${combinedFiles.length} fichier${combinedFiles.length > 1 ? 's' : ''} sélectionné${combinedFiles.length > 1 ? 's' : ''}`
              : combinedFiles[0]?.name}
          </span>
        ) : (
          <>
            <span className="text-sm font-medium">
              Cliquez pour téléverser
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Formats acceptés: {accept.replaceAll('.', '').toUpperCase()}
            </span>
          </>
        )}
      </label>

      {combinedFiles.length > 0 && (
        <ul className="mt-2 space-y-1">
          {combinedFiles.map((file, index) => (
            <li key={index} className="flex items-center justify-between text-sm text-gray-700">
              {/* Si le fichier est une URL, affiche-le comme un lien */}
              {typeof file === 'string' ? (
                <UrlPreview url={file} onRemove={handleRemovePreviewFile} index={index} />
              ) : (
                <span>{file?.name}</span>
              )}
              {/* Si c'est un fichier sélectionné, on permet de le supprimer */}
              {typeof file !== 'string' && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  Supprimer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUpload;
