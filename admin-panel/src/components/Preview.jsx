// // FIXME:

import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Preview = ({ sections, onClose, outputFormat, language, formData, selectedStory, partLanguages, stories, onSubmitStory, selectedTargetCard = null }) => {
  const [fontSize, setFontSize] = useState(16);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [multiAgeSections, setMultiAgeSections] = useState(null);
  const imageRefs = useRef([]);
  const paraRefs = useRef([]);
  const speechRef = useRef(null);
  const previewRef = useRef(null);

  // Helper function to get appropriate font family for language
  const getFontFamily = () => {
    switch (language) {
      case 'te':
        return '"Noto Sans Telugu", "Poppins", sans-serif';
      case 'hi':
        return '"Noto Sans Devanagari", "Poppins", sans-serif';
      default:
        return 'inherit';
    }
  };

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

  // Detect and parse multi-age content
  useEffect(() => {
    if (sections && sections.length > 0 && sections[0].targetAgeGroup) {
      // Multi-age content detected
      const ageGroupsData = {};
      sections.forEach(section => {
        const ageGroup = section.targetAgeGroup;
        if (!ageGroupsData[ageGroup]) {
          ageGroupsData[ageGroup] = [];
        }
        ageGroupsData[ageGroup].push(section);
      });
      setMultiAgeSections(ageGroupsData);
      // Set first age group as selected by default
      const firstAgeGroup = Object.keys(ageGroupsData)[0];
      setSelectedAgeGroup(firstAgeGroup);
    } else {
      setMultiAgeSections(null);
      setSelectedAgeGroup(null);
    }
  }, [sections]);

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
      // Use html2canvas to capture the content with proper font rendering
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#1f2937', // Gray-800
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      // Create PDF from canvas
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Calculate dimensions to fit the canvas in the PDF
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      // Add the canvas as image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
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

  // Function to view saved drafts
  const viewDrafts = () => {
    const drafts = JSON.parse(localStorage.getItem('storyDrafts') || '[]');
    
    if (drafts.length === 0) {
      alert('No drafts found.');
      return;
    }
    
    console.log('Saved drafts:', drafts);
    
    let message = `Found ${drafts.length} draft(s):\n\n`;
    drafts.forEach((draft, index) => {
      const date = new Date(draft.timestamp).toLocaleString();
      const ageGroups = draft.multiAgeSections ? Object.keys(draft.multiAgeSections).join(', ') : draft.formData.targetAgeGroup;
      message += `${index + 1}. ${draft.storyName} (${ageGroups}) - ${date}\n`;
    });
    
    alert(message);
  };

  // Function to process a saved draft (can be called later)
  const processDraft = async (draftData) => {
    console.log('=== PROCESSING DRAFT ===');
    console.log('Draft ID:', draftData.draftId);
    console.log('Existing Card ID:', draftData.existingCardId);
    console.log('Target Age Group:', draftData.formData?.targetAgeGroup);
    console.log('Has multiAgeSections?', !!draftData.multiAgeSections);
    console.log('Story ID:', draftData.storyId);
    
    // Get the story to access existing card data if updating
    const story = stories?.find(s => s.id === draftData.storyId);
    console.log('Found story in stories array?', !!story);
    
    let existingCardToMerge = null;
    
    if (draftData.existingCardId && story) {
      // Find the existing card in the story data
      const ageGroupMap = {
        '9-12': 'child',
        '13-18': 'teen',
        '18+': 'adult'
      };
      
      const targetField = ageGroupMap[draftData.formData?.targetAgeGroup];
      console.log('Target field to search:', targetField);
      console.log('story.parts:', !!story.parts);
      console.log('story[targetField]:', !!story[targetField]);
      
      if (targetField) {
        let cards = [];
        if (targetField === 'adult') {
          // Adult cards are in story.parts.card
          cards = story.parts?.card || [];
        } else {
          // Child and Teen cards are in story.child.card and story.teen.card
          cards = story[targetField]?.card || [];
        }
        
        console.log(`Available cards in '${targetField}':`, cards.length);
        console.log('Card IDs:', cards.map(c => c.id));
        existingCardToMerge = cards.find(c => c.id === draftData.existingCardId);
        console.log('✅ Found existing card to merge:', existingCardToMerge ? existingCardToMerge.id : '❌ NOT FOUND');
        if (existingCardToMerge) {
          console.log('Existing card title:', existingCardToMerge.title);
          console.log('Existing card sections:', existingCardToMerge.part?.length);
        }
      }
    } else {
      console.log('⚠️ Skipping merge - no existingCardId or story not found');
    }
    
    // Handle multi-age submissions SEQUENTIALLY to avoid 504/500 errors
    if (draftData.multiAgeSections && Object.keys(draftData.multiAgeSections).length > 0) {
      console.log('Multi-age submission detected, submitting sequentially...');
      
      const ageGroups = Object.keys(draftData.multiAgeSections);
      let successCount = 0;
      
      // Submit each age group one at a time
      for (let i = 0; i < ageGroups.length; i++) {
        const ageGroup = ageGroups[i];
        const ageSections = draftData.multiAgeSections[ageGroup];
        const isLastSubmission = i === ageGroups.length - 1;
        
        console.log(`[${i + 1}/${ageGroups.length}] Submitting ${ageGroup} content...`);
        
        // Convert sections to part format
        let partData = ageSections.map((section) => ({
          id: section.id || uuidv4(),
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
          image: section.imageUrl || section.image_gen || ''
        }));

        // MERGE with existing card if updating
        let mergedFormData = { ...draftData.formData };
        
        if (existingCardToMerge) {
          console.log('🔄 Merging draft data with existing card');
          
          // Helper to merge language objects
          const mergeLangObj = (existing, newObj) => {
            const merged = { ...existing };
            Object.keys(newObj || {}).forEach(lang => {
              if (newObj[lang] && newObj[lang].trim() !== '') {
                merged[lang] = newObj[lang];
              }
            });
            return merged;
          };
          
          // Merge card-level fields
          mergedFormData = {
            ...draftData.formData,
            title: mergeLangObj(existingCardToMerge.title || {}, draftData.formData.title || {}),
            date: mergeLangObj(existingCardToMerge.date || {}, draftData.formData.date || {}),
            description: mergeLangObj(existingCardToMerge.description || {}, draftData.formData.description || {}),
            timeToRead: mergeLangObj(existingCardToMerge.timeToRead || {}, draftData.formData.timeToRead || {}),
            storyType: mergeLangObj(existingCardToMerge.storyType || {}, draftData.formData.storyType || {}),
          };
          
          // Merge section-level data - keep ALL sections (existing + new)
          const maxSections = Math.max(partData.length, existingCardToMerge.part?.length || 0);
          const mergedSections = [];
          
          for (let index = 0; index < maxSections; index++) {
            const existingSection = existingCardToMerge.part?.[index];
            const newSection = partData[index];
            
            if (existingSection && newSection) {
              // Both exist - merge them
              mergedSections.push({
                id: existingSection.id,
                heading: mergeLangObj(existingSection.heading || {}, newSection.heading || {}),
                quote: mergeLangObj(existingSection.quote || {}, newSection.quote || {}),
                text: mergeLangObj(existingSection.text || {}, newSection.text || {}),
                image: newSection.image || existingSection.image,
              });
            } else if (existingSection) {
              // Only existing - keep it
              mergedSections.push(existingSection);
            } else if (newSection) {
              // Only new - add it
              mergedSections.push(newSection);
            }
          }
          
          partData = mergedSections;
          
          console.log('✅ Merged formData:', mergedFormData);
          console.log('✅ Merged partData sample:', partData[0]);
        }

        // Map age groups to database fields
        const groupMap = {
          '18+': 'adult',
          '13-18': 'teen',
          '9-12': 'child'
        };

        const dbGroup = groupMap[ageGroup];
        
        // Submit as parts (works for adult, child, and teen via ageGroup parameter)
        const submitData = new FormData();
        submitData.append('storyId', draftData.storyId);
        
        // If updating existing card, use partId for update
        if (draftData.existingCardId) {
          submitData.append('partId', draftData.existingCardId);
          console.log('🔄 FRONTEND (Draft Multi-Age): Updating existing card:', draftData.existingCardId);
        }
        
        // Add card details for ALL languages (not just partLanguages)
        ['en', 'te', 'hi'].forEach(lang => {
          const langKey = lang.charAt(0).toUpperCase() + lang.slice(1);
          submitData.append(`title${langKey}`, mergedFormData.title[lang] || '');
          submitData.append(`date${langKey}`, mergedFormData.date[lang] || '');
          submitData.append(`description${langKey}`, mergedFormData.description[lang] || '');
          submitData.append(`timeToRead${langKey}`, mergedFormData.timeToRead[lang] || '');
          submitData.append(`storyType${langKey}`, mergedFormData.storyType[lang] || '');
        });
        
        // Add thumbnail image
        if (draftData.formData.thumbnailImage) {
          submitData.append('thumbnailImage', draftData.formData.thumbnailImage);
        } else if (draftData.formData.thumbnailPreview) {
          submitData.append('thumbnailImage', draftData.formData.thumbnailPreview);
        }
        
        // Add part data for ALL languages
        partData.forEach((part, index) => {
          ['en', 'te', 'hi'].forEach(lang => {
            const langKey = lang.charAt(0).toUpperCase() + lang.slice(1);
            submitData.append(`heading${langKey}${index}`, part.heading[lang] || '');
            submitData.append(`quote${langKey}${index}`, part.quote[lang] || '');
            submitData.append(`text${langKey}${index}`, part.text[lang] || '');
          });
          
          if (part.image) {
            submitData.append(`partImage${index}`, part.image);
          }
          
          submitData.append(`id${index}`, part.id);
        });
        
        submitData.append('languages', JSON.stringify(['en', 'te', 'hi']));
        
        // Add ageGroup parameter for routing - SIMPLE FIX
        console.log('Multi-age - ageGroup:', ageGroup, 'dbGroup:', dbGroup);
        
        // Add contentType and ageGroup parameters for clear validation
        if (ageGroup === '13-18') {
          submitData.append('ageGroup', 'teen');
          submitData.append('contentType', 'teen');
        } else if (ageGroup === '9-12') {
          submitData.append('ageGroup', 'child');
          submitData.append('contentType', 'child');
        } else if (ageGroup === '18+') {
          submitData.append('contentType', 'adult');
        }
        
        // Debug: Log FormData contents
        console.log('📤 FormData contents for', ageGroup, ':');
        for (let [key, value] of submitData.entries()) {
          console.log(`  ${key}:`, typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value);
        }
        
        // Wait for this submission to complete before proceeding to next
        // Skip UI updates for all but the last submission
        try {
          await onSubmitStory(submitData, { skipUIUpdates: !isLastSubmission });
          console.log(`✓ ${ageGroup} content submitted successfully`);
          successCount++;
        } catch (error) {
          console.error(`✗ Failed to submit ${ageGroup} content:`, error);
          alert(`Failed to submit ${ageGroup} content after ${successCount} successful submissions. Please check the database and try again.`);
          return; // Stop if one fails
        }
      }

      console.log(`🎉 All ${successCount} multi-age submissions completed successfully!`);
      
      // Show final success message and navigate
      alert(`Successfully submitted content for ${successCount} age groups!`);
      
      // Remove draft from localStorage after successful submission
      const existingDrafts = JSON.parse(localStorage.getItem('storyDrafts') || '[]');
      const updatedDrafts = existingDrafts.filter(draft => draft.draftId !== draftData.draftId);
      localStorage.setItem('storyDrafts', JSON.stringify(updatedDrafts));
      
      return;
    }

    // Single age group submission
    let partData = draftData.sections.map((section, index) => ({
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
      image: section.imageUrl || section.image_gen || ''
    }));

    // MERGE with existing card if updating
    let mergedFormData = { ...draftData.formData };
    
    if (existingCardToMerge) {
      console.log('🔄 Merging single-age draft data with existing card');
      
      // Helper to merge language objects
      const mergeLangObj = (existing, newObj) => {
        const merged = { ...existing };
        Object.keys(newObj || {}).forEach(lang => {
          if (newObj[lang] && newObj[lang].trim() !== '') {
            merged[lang] = newObj[lang];
          }
        });
        return merged;
      };
      
      // Merge card-level fields
      mergedFormData = {
        ...draftData.formData,
        title: mergeLangObj(existingCardToMerge.title || {}, draftData.formData.title || {}),
        date: mergeLangObj(existingCardToMerge.date || {}, draftData.formData.date || {}),
        description: mergeLangObj(existingCardToMerge.description || {}, draftData.formData.description || {}),
        timeToRead: mergeLangObj(existingCardToMerge.timeToRead || {}, draftData.formData.timeToRead || {}),
        storyType: mergeLangObj(existingCardToMerge.storyType || {}, draftData.formData.storyType || {}),
      };
      
      // Merge section-level data - keep ALL sections (existing + new)
      const maxSections = Math.max(partData.length, existingCardToMerge.part?.length || 0);
      const mergedSections = [];
      
      for (let index = 0; index < maxSections; index++) {
        const existingSection = existingCardToMerge.part?.[index];
        const newSection = partData[index];
        
        if (existingSection && newSection) {
          // Both exist - merge them
          mergedSections.push({
            id: existingSection.id,
            heading: mergeLangObj(existingSection.heading || {}, newSection.heading || {}),
            quote: mergeLangObj(existingSection.quote || {}, newSection.quote || {}),
            text: mergeLangObj(existingSection.text || {}, newSection.text || {}),
            image: newSection.image || existingSection.image,
          });
        } else if (existingSection) {
          // Only existing - keep it
          mergedSections.push(existingSection);
        } else if (newSection) {
          // Only new - add it
          mergedSections.push(newSection);
        }
      }
      
      partData = mergedSections;
      
      console.log('✅ Merged single-age formData:', mergedFormData);
      console.log('✅ Merged single-age partData sample:', partData[0]);
    }

    const submitData = new FormData();
    submitData.append('storyId', draftData.storyId);
    
    // If updating existing card, use partId for update
    if (draftData.existingCardId) {
      submitData.append('partId', draftData.existingCardId);
      console.log('🔄 FRONTEND (Draft Single-Age): Updating existing card:', draftData.existingCardId);
    }
    
    // Add card details for ALL languages (not just partLanguages)
    ['en', 'te', 'hi'].forEach(lang => {
      const langKey = lang.charAt(0).toUpperCase() + lang.slice(1);
      submitData.append(`title${langKey}`, mergedFormData.title[lang] || '');
      submitData.append(`date${langKey}`, mergedFormData.date[lang] || '');
      submitData.append(`description${langKey}`, mergedFormData.description[lang] || '');
      submitData.append(`timeToRead${langKey}`, mergedFormData.timeToRead[lang] || '');
      submitData.append(`storyType${langKey}`, mergedFormData.storyType[lang] || '');
    });
    
    // Add thumbnail image
    if (draftData.formData.thumbnailImage) {
      submitData.append('thumbnailImage', draftData.formData.thumbnailImage);
    } else if (draftData.formData.thumbnailPreview) {
      submitData.append('thumbnailImage', draftData.formData.thumbnailPreview);
    }
    
    // Add part data for ALL languages
    partData.forEach((part, index) => {
      ['en', 'te', 'hi'].forEach(lang => {
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
    
    submitData.append('languages', JSON.stringify(['en', 'te', 'hi']));
    
    // Add ageGroup parameter for routing - SIMPLE FIX
    console.log('Single age - targetAgeGroup:', draftData.formData.targetAgeGroup);
    
    // Direct mapping - no complex logic
    if (draftData.formData.targetAgeGroup === '13-18') {
      submitData.append('ageGroup', 'teen');
      console.log('Added ageGroup: teen');
    } else if (draftData.formData.targetAgeGroup === '9-12') {
      submitData.append('ageGroup', 'child');
      console.log('Added ageGroup: child');
    } else if (draftData.formData.targetAgeGroup === '18+') {
      console.log('Adult content - no ageGroup needed');
    } else {
      console.log('Unknown targetAgeGroup:', draftData.formData.targetAgeGroup);
    }
    
    // Call the submit function
    await onSubmitStory(submitData);
    
    // Remove draft from localStorage after successful submission
    const existingDrafts = JSON.parse(localStorage.getItem('storyDrafts') || '[]');
    const updatedDrafts = existingDrafts.filter(draft => draft.draftId !== draftData.draftId);
    localStorage.setItem('storyDrafts', JSON.stringify(updatedDrafts));
  };

  const handleSubmitStory = async () => {
    console.log('=== SUBMIT STORY STARTED ===');
    console.log('selectedTargetCard:', selectedTargetCard);
    
    if (!selectedStory || !formData) {
      alert('Please select a story and ensure all required data is available.');
      return;
    }

    // Find the selected story to get its ID
    const story = stories?.find(s => s.name.en === selectedStory);
    if (!story) {
      alert('Selected story not found.');
      return;
    }

    // Save content to draft first to avoid token expiry issues
    const draftData = {
      storyId: story.id,
      storyName: story.name.en,
      formData: formData,
      sections: sections,
      multiAgeSections: multiAgeSections,
      partLanguages: partLanguages,
      existingCardId: selectedTargetCard?.id || null,
      timestamp: new Date().toISOString(),
      status: 'draft'
    };

    // Save to localStorage as draft
    const existingDrafts = JSON.parse(localStorage.getItem('storyDrafts') || '[]');
    const draftId = `draft_${Date.now()}`;
    draftData.draftId = draftId;
    existingDrafts.push(draftData);
    localStorage.setItem('storyDrafts', JSON.stringify(existingDrafts));

    console.log('Content saved to draft:', draftId);
    
    // Ask user if they want to process the draft now or later
    const processNow = confirm('Content saved to draft successfully! Do you want to process it now? (Click OK to submit now, Cancel to save for later)');
    
    if (processNow) {
      // Process the draft immediately
      try {
        await processDraft(draftData);
        onClose();
      } catch (error) {
        console.error('Error processing draft:', error);
        alert('Error processing draft. It has been saved and you can try again later.');
      }
    } else {
      alert('Draft saved successfully! You can process it later from the drafts section.');
      onClose();
    }
    return;

    // NOTE: The code below is commented out to prevent API calls and token expiry issues
    // Uncomment and use processDraft() function when ready to submit

    // Handle multi-age submissions SEQUENTIALLY to avoid 504/500 errors
    if (multiAgeSections && Object.keys(multiAgeSections).length > 0) {
      console.log('Multi-age submission detected, submitting sequentially...');
      
      const ageGroups = Object.keys(multiAgeSections);
      let successCount = 0;
      
      // Submit each age group one at a time
      for (let i = 0; i < ageGroups.length; i++) {
        const ageGroup = ageGroups[i];
        const ageSections = multiAgeSections[ageGroup];
        const isLastSubmission = i === ageGroups.length - 1;
        
        console.log(`[${i + 1}/${ageGroups.length}] Submitting ${ageGroup} content...`);

    // Convert sections to part format
        const partData = ageSections.map((section) => ({
          id: section.id || uuidv4(),
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
          image: section.imageUrl || section.image_gen || ''
        }));

        // Map age groups to database fields
        const groupMap = {
          '18+': 'adult',
          '13-18': 'teen',
          '9-12': 'child'
        };

        const dbGroup = groupMap[ageGroup];
        
        // Submit as parts (works for adult, child, and teen via ageGroup parameter)
        const submitData = new FormData();
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
          
          if (part.image) {
            submitData.append(`partImage${index}`, part.image);
          }
          
          submitData.append(`id${index}`, part.id);
        });
        
        submitData.append('languages', JSON.stringify(partLanguages));
        
        // Add ageGroup parameter for routing - SIMPLE FIX
        if (ageGroup === '13-18') {
          submitData.append('ageGroup', 'teen');
        } else if (ageGroup === '9-12') {
          submitData.append('ageGroup', 'child');
        }
        
        // Wait for this submission to complete before proceeding to next
        // Skip UI updates for all but the last submission
        try {
          await onSubmitStory(submitData, { skipUIUpdates: !isLastSubmission });
          console.log(`✓ ${ageGroup} content submitted successfully`);
          successCount++;
        } catch (error) {
          console.error(`✗ Failed to submit ${ageGroup} content:`, error);
          alert(`Failed to submit ${ageGroup} content after ${successCount} successful submissions. Please check the database and try again.`);
          return; // Stop if one fails
        }
      }

      console.log(`🎉 All ${successCount} multi-age submissions completed successfully!`);
      
      // Show final success message and navigate
      alert(`Successfully submitted content for ${successCount} age groups!`);
      onClose();
      return;
    }

    // Convert sections to part format (single age group)
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

    // TODO:
    // If target age group is toddler (3-5) or kids (6-8), send simplified age payload
const isToddler = formData.targetAgeGroup === '3-5';
const isKids = formData.targetAgeGroup === '6-8';
if (isToddler || isKids) {
  const group = isToddler ? 'toddler' : 'kids';

  console.log('formDataCheck :', formData);
  // Build ageCard with multi-language fields preserved
  const ageCard = {
    id: uuidv4(),
    title: {
      en: formData.title?.en || '',
      te: formData.title?.te || '',
      hi: formData.title?.hi || ''
    },
    thumbnailImage: formData.thumbnailImage || '',
      // (typeof formData.thumbnailPreview === 'string' && formData.thumbnailPreview) ||
      // (typeof formData.thumbnailImage === 'string' ? formData.thumbnailImage : '') ||
      // '',
    coverImage: '',
    description: {
      en: formData.description?.en || '',
      te: formData.description?.te || '',
      hi: formData.description?.hi || ''
    },
    timeToRead: {
      en: formData.timeToRead?.en || '',
      te: formData.timeToRead?.te || '',
      hi: formData.timeToRead?.hi || ''
    },
    storyType: {
      en: formData.storyType?.en || '',
      te: formData.storyType?.te || '',
      hi: formData.storyType?.hi || ''
    },
    partContent: sections.map((section) => ({
      id: uuidv4(),
      oneLineText: isToddler
        ? {
            en: section.oneLineText?.en || section.sectionText?.en || '',
            te: section.oneLineText?.te || section.sectionText?.te || '',
            hi: section.oneLineText?.hi || section.sectionText?.hi || ''
          }
        : undefined,
      headingText: isKids
        ? {
            en: section.heading?.en || '',
            te: section.heading?.te || '',
            hi: section.heading?.hi || ''
          }
        : undefined,
      imageUrl: section.image_gen || ''
    }))
  };

  onSubmitStory({ __agePayload: true, storyId: story.id, group, card: ageCard });
  onClose();
  return;
}


    // Otherwise, submit via classic multi-language parts flow
    const submitData = new FormData();
    submitData.append('storyId', story.id);
    
    // Prepare merged data if updating existing card
    let mergedFormData = { ...formData };
    let mergedPartData = partData;
    
    if (selectedTargetCard) {
      console.log('🔄 FRONTEND: Merging with existing card:', selectedTargetCard.id);
      console.log('Existing card data:', selectedTargetCard);
      console.log('New formData:', formData);
      
      // Helper function to merge language objects, only overwriting non-empty values
      const mergeLangObj = (existing, newObj) => {
        const merged = { ...existing };
        Object.keys(newObj || {}).forEach(lang => {
          if (newObj[lang] && newObj[lang].trim() !== '') {
            merged[lang] = newObj[lang];
          }
        });
        console.log('Merged lang object:', { existing, newObj, merged });
        return merged;
      };
      
      // Merge card-level fields (title, date, description, etc.)
      mergedFormData = {
        ...formData,
        title: mergeLangObj(selectedTargetCard.title || {}, formData.title || {}),
        date: mergeLangObj(selectedTargetCard.date || {}, formData.date || {}),
        description: mergeLangObj(selectedTargetCard.description || {}, formData.description || {}),
        timeToRead: mergeLangObj(selectedTargetCard.timeToRead || {}, formData.timeToRead || {}),
        storyType: mergeLangObj(selectedTargetCard.storyType || {}, formData.storyType || {}),
      };
      
      console.log('After card-level merge, mergedFormData:', mergedFormData);
      
      // Merge section-level data - keep ALL sections (existing + new)
      const maxSections = Math.max(partData.length, selectedTargetCard.part?.length || 0);
      const mergedSections = [];
      
      for (let index = 0; index < maxSections; index++) {
        const existingSection = selectedTargetCard.part?.[index];
        const newSection = partData[index];
        
        if (existingSection && newSection) {
          // Both exist - merge them
          console.log(`Merging section ${index}:`, { existing: existingSection, new: newSection });
          mergedSections.push({
            id: existingSection.id,
            heading: mergeLangObj(existingSection.heading || {}, newSection.heading || {}),
            quote: mergeLangObj(existingSection.quote || {}, newSection.quote || {}),
            text: mergeLangObj(existingSection.text || {}, newSection.text || {}),
            image: newSection.image || existingSection.image,
          });
        } else if (existingSection) {
          // Only existing - keep it (preserves extra existing sections)
          console.log(`Keeping existing section ${index} (no new content)`);
          mergedSections.push(existingSection);
        } else if (newSection) {
          // Only new - add it (adds extra new sections)
          console.log(`Adding new section ${index} (no existing content)`);
          mergedSections.push(newSection);
        }
      }
      
      mergedPartData = mergedSections;
      
      // Use existing card ID as partId for update
      submitData.append('partId', selectedTargetCard.id);
      
      console.log('✅ Merged data prepared:', {
        cardId: selectedTargetCard.id,
        existingSections: selectedTargetCard.part?.length || 0,
        newSections: mergedPartData.length,
        mergedTitle: mergedFormData.title,
        sampleMergedSection: mergedPartData[0]
      });
    } else {
      console.log('✨ Creating new card (no selectedTargetCard)');
    }
    
    // Add card details for ALL languages (existing + new)
    ['en', 'te', 'hi'].forEach(lang => {
      const langKey = lang.charAt(0).toUpperCase() + lang.slice(1);
      submitData.append(`title${langKey}`, mergedFormData.title[lang] || '');
      submitData.append(`date${langKey}`, mergedFormData.date[lang] || '');
      submitData.append(`description${langKey}`, mergedFormData.description[lang] || '');
      submitData.append(`timeToRead${langKey}`, mergedFormData.timeToRead[lang] || '');
      submitData.append(`storyType${langKey}`, mergedFormData.storyType[lang] || '');
    });
    
    // Add thumbnail image
    if (formData.thumbnailImage) {
    console.log("Submitting thumbnail file:", formData.thumbnailImage);
    submitData.append('thumbnailImage', formData.thumbnailImage);
  } else if (formData.thumbnailPreview) {
      console.log("Submitting thumbnail preview file:", formData.thumbnailPreview);
      submitData.append('thumbnailImage', formData.thumbnailPreview);
    }
    
    // Add part data for ALL languages (existing + new)
    mergedPartData.forEach((part, index) => {
      ['en', 'te', 'hi'].forEach(lang => {
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
    
    // Send all languages that exist in merged data
    const allLanguages = ['en', 'te', 'hi'];
    submitData.append('languages', JSON.stringify(allLanguages));
    
    // Debug: Log what's being sent
    console.log('📤 Final FormData being sent:');
    for (let [key, value] of submitData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    // Add contentType and ageGroup parameters for clear validation
    if (formData.targetAgeGroup === '13-18') {
      submitData.append('ageGroup', 'teen');
      submitData.append('contentType', 'teen');
    } else if (formData.targetAgeGroup === '9-12') {
      submitData.append('ageGroup', 'child');
      submitData.append('contentType', 'child');
    } else if (formData.targetAgeGroup === '18+') {
      submitData.append('contentType', 'adult');
    }
    
    // Call the submit function
    onSubmitStory(submitData);
    
    // Close the preview after successful submission
    onClose();
  };

  // Get current sections to display
  const displaySections = multiAgeSections && selectedAgeGroup 
    ? multiAgeSections[selectedAgeGroup] 
    : sections;

  // Get age group label
  const getAgeGroupLabel = (ageGroup) => {
    const labels = {
      '3-5': 'Toddler (3-5)',
      '6-8': 'Kids (6-8)',
      '9-12': 'Child (9-12)',
      '13-18': 'Teen (13-18)',
      '18+': 'Adult (18+)'
    };
    return labels[ageGroup] || ageGroup;
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

        {/* Age Group Selector for Multi-Age Content */}
        {multiAgeSections && Object.keys(multiAgeSections).length > 0 && (
          <div className="mb-6 bg-gray-700 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Age Group to Preview:
            </label>
            <div className="flex gap-4 flex-wrap">
              {Object.keys(multiAgeSections).map((ageGroup) => (
                <label key={ageGroup} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="ageGroupPreview"
                    value={ageGroup}
                    checked={selectedAgeGroup === ageGroup}
                    onChange={(e) => setSelectedAgeGroup(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white">{getAgeGroupLabel(ageGroup)}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Preview content for different age groups. All will be submitted together.
            </p>
          </div>
        )}

        <div ref={previewRef} className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Helvetica Neue", Arial, sans-serif, "Noto Sans Telugu", "Noto Sans Devanagari", "Poppins"' }}>
          {displaySections.map((section, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              {(outputFormat?.includeHeadings || section.heading[language]) && (
                <p
                  style={{ 
                    fontSize: `${fontSize + 2}px`,
                    fontFamily: getFontFamily()
                  }}
                  className="text-lg font-semibold text-indigo-400 mb-2"
                >
                  {`${index + 1})`} {section.heading[language] || ""}
                  {outputFormat?.includeQuotes && (
                    <span 
                      className="block text-sm text-gray-300 italic mt-1"
                      style={{ 
                        fontFamily: getFontFamily()
                      }}
                    >
                      {section.quote[language] || ""}
                    </span>
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
                      style={{ 
                        fontSize: `${fontSize}px`,
                        fontFamily: getFontFamily()
                      }}
                      className="text-gray-200"
                      ref={(el) => (paraRefs.current[index] = el)}
                    >
                      {section.sectionText[language] || ""}
                    </p>
                  )}
                  {outputFormat?.oneLineText && (
                    <p
                      style={{ 
                        fontSize: `${fontSize}px`,
                        fontFamily: getFontFamily()
                      }}
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

        {displaySections.length > 0 && (
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
                  disabled={!displaySections.length || !voicesLoaded}
                  className={`flex-1 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
                    !displaySections.length || !voicesLoaded
                      ? 'bg-gray-600 cursor-not-allowed'
                      : isSpeaking
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {!displaySections.length || !voicesLoaded
                    ? "Loading..."
                    : isSpeaking
                    ? "Stop Reading"
                    : "Read Aloud"}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={viewDrafts}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200"
              >
                View Drafts
              </button>
            <button
              onClick={handleSubmitStory}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              Submit Story
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview;