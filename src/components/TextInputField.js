import React from 'react';

const TextInputField = ({
  label,
  name,
  value,
  type = 'text',  // Valeur par défaut 'text'
  onChange,
  placeholder,
  required = false,
  options = [],  // Options à passer pour un select
  isArrayOptions = false,  // Si les options sont sous forme de tableau ou non
  readOnly = false,
}) => {
  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          className="w-full p-2 border border-gray-300 rounded-md"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          className="w-full p-2 border border-gray-300 rounded-md"
          value={value}
          onChange={handleChange}
          required={required}
        >
          {/* Cas où les options sont un tableau d'objets */}
          {isArrayOptions ? (
            options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            // Cas par défaut avec des options statiques
            options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))
          )}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          className="w-full p-2 border border-gray-300 rounded-md"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};

export default TextInputField;
