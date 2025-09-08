import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

const LanguageModal = ({ onSelect, onSkip }) => {
  const [selectedLanguages, setSelectedLanguages] = useState(['en', 'te']); // Default English and Telugu

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = () => {
    if (selectedLanguages.length === 0) {
      alert('Please select at least one language');
      return;
    }
    onSelect(selectedLanguages); // Pass selected languages and close modal
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Select Language(s) for Story/Part</h2>
        <div className="mb-4 flex space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedLanguages.includes('en')}
              onChange={() => toggleLanguage('en')}
              className="mr-2"
            />
            English
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedLanguages.includes('te')}
              onChange={() => toggleLanguage('te')}
              className="mr-2"
            />
            Telugu
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedLanguages.includes('hi')}
              onChange={() => toggleLanguage('hi')}
              className="mr-2"
            />
            Hindi
          </label>
        </div>
        <div className="flex justify-between">
          <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded flex items-center">
            <CheckCircle className="mr-2" /> Confirm
          </button>
          <button onClick={onSkip} className="bg-gray-500 text-white px-4 py-2 rounded">
            Skip (Default: En, Te)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;