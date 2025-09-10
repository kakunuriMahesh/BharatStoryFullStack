// // FIXME:

import React, { useState, useRef, useEffect } from 'react';

const Preview = ({ sections, onClose, outputFormat, language }) => {
  const [fontSize, setFontSize] = useState(16);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const imageRefs = useRef([]);
  const paraRefs = useRef([]);
  const speechRef = useRef(null);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      } else {
        speechSynthesis.addEventListener('voiceschanged', () => {
          setVoicesLoaded(true);
        });
      }
    }
  }, []);

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = sections.map(section => 
        `${section.heading[language] || ''}. ${section.quote[language] || ''}. ${section.sectionText[language] || section.oneLineText[language] || ''}`
      ).join('. ');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Story Preview</h2>
          <div className="flex items-center gap-4">
            <button
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200"
              onClick={decreaseFontSize}
              title="Decrease font size"
            >
              A-
            </button>
            <span className="text-gray-300 text-sm">{fontSize}px</span>
            <button
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200"
              onClick={increaseFontSize}
              title="Increase font size"
            >
              A+
            </button>
            <button
              className="text-gray-400 hover:text-white text-2xl"
              onClick={onClose}
              title="Close preview"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              {(outputFormat?.includeHeadings || section.heading[language]) && (
                <p
                  style={{ fontSize: `${fontSize + 2}px` }}
                  className="text-lg font-semibold text-indigo-400 mb-2"
                >
                  {`${index + 1})`} {section.heading[language] || ""}
                  {outputFormat?.includeQuotes && (
                    <span className="block text-sm text-gray-300 italic mt-1">{section.quote[language] || ""}</span>
                  )}
                </p>
              )}
              
              <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-4`}>
                {outputFormat?.includeImageSuggestions && section.image_gen && (
                  <div className="flex-shrink-0 w-full md:w-1/3">
                    <img
                      ref={(el) => (imageRefs.current[index] = el)}
                      onLoad={() =>
                        setImagesLoaded((prev) => ({ ...prev, [index]: true }))
                      }
                      className="w-full h-48 object-cover rounded-lg"
                      src={section.image_gen}
                      alt={section.heading[language] || "Section image"}
                    />
                  </div>
                )}
                
                <div className="flex-grow">
                  {!outputFormat?.oneLineText && (
                    <p
                      style={{ fontSize: `${fontSize}px` }}
                      className="text-gray-200"
                      ref={(el) => (paraRefs.current[index] = el)}
                    >
                      {section.sectionText[language] || ""}
                    </p>
                  )}
                  {outputFormat?.oneLineText && (
                    <p
                      style={{ fontSize: `${fontSize}px` }}
                      className="text-gray-200"
                    >
                      {section.oneLineText[language] || ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {sections.length > 0 && voicesLoaded && (
          <div className='flex justify-center items-center gap-3'>
            <button
              onClick={toggleSpeech}
              disabled={!sections.length || !voicesLoaded}
              className={`w-full py-3 mt-6 rounded-lg font-semibold text-white transition-colors duration-200 ${
                !sections.length || !voicesLoaded
                  ? 'bg-gray-600 cursor-not-allowed'
                  : isSpeaking
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {!sections.length || !voicesLoaded
                ? "Loading..."
                : isSpeaking
                ? "Stop Reading"
                : "Read Aloud"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview;