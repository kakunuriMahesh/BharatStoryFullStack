// // FIXME:

import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Preview = ({ sections, onClose, outputFormat, language, formData, selectedStory, partLanguages, stories, onSubmitStory }) => {
  const [fontSize, setFontSize] = useState(16);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const imageRefs = useRef([]);
  const paraRefs = useRef([]);
  const speechRef = useRef(null);
  const previewRef = useRef(null);

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

  const downloadAsPDF = async () => {
    if (!previewRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let currentY = margin;
      
      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(31, 41, 55); // Gray-800 background
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Story Preview', pageWidth / 2, currentY, { align: 'center' });
      currentY += 20;
      
      // Process each section
      for (let index = 0; index < sections.length; index++) {
        const section = sections[index];
        // Check if we need a new page
        if (currentY > pageHeight - 100) {
          pdf.addPage();
          pdf.setFillColor(31, 41, 55);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
          currentY = margin;
        }
        
        // Add section number and heading
        if (outputFormat?.includeHeadings || section.heading[language]) {
          pdf.setFontSize(18);
          pdf.setTextColor(129, 140, 248); // Indigo-400
          const headingText = `${index + 1}) ${section.heading[language] || ""}`;
          pdf.text(headingText, margin, currentY);
          currentY += 10;
          
          // Add quote if included
          if (outputFormat?.includeQuotes && section.quote[language]) {
            pdf.setFontSize(12);
            pdf.setTextColor(200, 200, 200);
            pdf.text(section.quote[language], margin, currentY);
            currentY += 8;
          }
        }
        
        // Add image if included
        if (outputFormat?.includeImageSuggestions && section.image_gen) {
          try {
            // Check if we have enough space for image
            const imageHeight = 80; // Fixed height for images
            if (currentY + imageHeight > pageHeight - margin) {
              pdf.addPage();
              pdf.setFillColor(31, 41, 55);
              pdf.rect(0, 0, pageWidth, pageHeight, 'F');
              currentY = margin;
            }
            
            // Try to load and add the actual image
            try {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              const imageLoaded = await new Promise((resolve, reject) => {
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = section.image_gen;
              });
              
              // Calculate image dimensions to fit content width
              const imgAspectRatio = imageLoaded.width / imageLoaded.height;
              const imgWidth = contentWidth;
              const imgHeight = imgWidth / imgAspectRatio;
              const finalHeight = Math.min(imgHeight, 80); // Max height of 80mm
              
              // Add image to PDF
              pdf.addImage(imageLoaded, 'JPEG', margin, currentY, contentWidth, finalHeight);
              currentY += finalHeight + 10;
              
            } catch (imgError) {
              console.log('Could not load image, adding placeholder:', imgError);
              
              // Add image placeholder
              pdf.setFillColor(75, 85, 99); // Gray-600
              pdf.rect(margin, currentY, contentWidth, imageHeight, 'F');
              
              // Add image text
              pdf.setFontSize(10);
              pdf.setTextColor(255, 255, 255);
              pdf.text('Image: ' + (section.heading[language] || 'Section image'), margin + 5, currentY + 15);
              currentY += imageHeight + 10;
            }
          } catch (error) {
            console.log('Could not add image:', error);
            currentY += 10;
          }
        }
        
        // Add text content
        const textContent = !outputFormat?.oneLineText 
          ? (section.sectionText[language] || section.oneLineText[language] || "")
          : (section.oneLineText[language] || "");
        
        if (textContent) {
          pdf.setFontSize(14);
          pdf.setTextColor(229, 231, 235); // Gray-200
          
          // Split text into lines that fit the page width
          const lines = pdf.splitTextToSize(textContent, contentWidth);
          
          // Check if we need a new page for the text
          const lineHeight = 6; // Line height in mm
          const textHeight = lines.length * lineHeight;
          
          if (currentY + textHeight > pageHeight - margin - 20) {
            pdf.addPage();
            pdf.setFillColor(31, 41, 55);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            currentY = margin;
          }
          
          // Add the text with proper line spacing
          pdf.text(lines, margin, currentY, { lineHeightFactor: 1.2 });
          currentY += textHeight + 15;
        }
        
        // Add spacing between sections
        currentY += 15;
      }
      
      // Add page numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 20,
          pageHeight - 10
        );
      }
      
      // Download the PDF
      const fileName = `story-preview-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSubmitStory = () => {
    if (!selectedStory || !formData) {
      alert('Please select a story and ensure all required data is available.');
      return;
    }

    // Convert sections to part format
    const partData = sections.map((section, index) => ({
      id: uuidv4(),
      heading: {
        en: section.heading?.en || '',
        te: section.heading?.te || '',
        hi: section.heading?.hi || ''
      },
      quote: {
        en: section.quote?.en || '',
        te: section.quote?.te || '',
        hi: section.quote?.hi || ''
      },
      text: {
        en: section.sectionText?.en || section.oneLineText?.en || '',
        te: section.sectionText?.te || section.oneLineText?.te || '',
        hi: section.sectionText?.hi || section.oneLineText?.hi || ''
      },
      image: section.image_gen || ''
    }));

    // Create FormData for submission
    const submitData = new FormData();
    
    // Find the selected story to get its ID
    const story = stories?.find(s => s.name.en === selectedStory);
    if (!story) {
      alert('Selected story not found.');
      return;
    }
    
    submitData.append('storyId', story.id);
    
    // Add card details for each language
    partLanguages.forEach(lang => {
      const langKey = lang.charAt(0).toUpperCase() + lang.slice(1);
      submitData.append(`title${langKey}`, formData.title[lang] || '');
      submitData.append(`date${langKey}`, formData.date[lang] || '');
      submitData.append(`description${langKey}`, formData.description[lang] || '');
      submitData.append(`timeToRead${langKey}`, formData.timeToRead[lang] || '');
      submitData.append(`storyType${langKey}`, formData.storyType[lang] || '');
    });
    
    // Add thumbnail image
    if (formData.thumbnailImage) {
      submitData.append('thumbnailImage', formData.thumbnailImage);
    } else if (formData.thumbnailPreview) {
      submitData.append('thumbnailImage', formData.thumbnailPreview);
    }
    
    // Add part data for each language
    partData.forEach((part, index) => {
      partLanguages.forEach(lang => {
        const langKey = lang.charAt(0).toUpperCase() + lang.slice(1);
        submitData.append(`heading${langKey}${index}`, part.heading[lang] || '');
        submitData.append(`quote${langKey}${index}`, part.quote[lang] || '');
        submitData.append(`text${langKey}${index}`, part.text[lang] || '');
      });
      
      // Add image for this part
      if (part.image) {
        submitData.append(`partImage${index}`, part.image);
      }
      
      submitData.append(`id${index}`, part.id);
    });
    
    submitData.append('languages', JSON.stringify(partLanguages));
    
    // Call the submit function
    onSubmitStory(submitData);
    
    // Close the preview after successful submission
    onClose();
  };

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

        <div ref={previewRef} className="space-y-6">
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

        {sections.length > 0 && (
          <div className='flex flex-col gap-3 mt-6'>
            <div className='flex justify-center items-center gap-3'>
              <button
                onClick={downloadAsPDF}
                disabled={isGeneratingPDF}
                className={`flex-1 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
                  isGeneratingPDF
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isGeneratingPDF ? "Generating PDF..." : "Download as PDF"}
              </button>
              {voicesLoaded && (
                <button
                  onClick={toggleSpeech}
                  disabled={!sections.length || !voicesLoaded}
                  className={`flex-1 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
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
              )}
            </div>
            <button
              onClick={handleSubmitStory}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              Submit Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview;