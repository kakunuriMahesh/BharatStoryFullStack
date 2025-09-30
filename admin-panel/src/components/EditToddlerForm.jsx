import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useStories } from "../hooks/useStories";

const EditToddlerForm = ({ updateAgeContent, deleteAgeContent }) => {
  const { storyId, cardId } = useParams();
  const navigate = useNavigate();
  const { stories } = useStories();
  const [formData, setFormData] = useState({
    title: { en: '', te: '', hi: '' },
    description: { en: '', te: '', hi: '' },
    timeToRead: { en: '', te: '', hi: '' },
    storyType: { en: '', te: '', hi: '' },
    thumbnailImage: null,
    coverImage: null,
    partContent: []
  });
  const [selectedLanguages, setSelectedLanguages] = useState(['en', 'te']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const story = stories.find(s => s.id === storyId);
    if (story && story.toddler && story.toddler.card) {
      const toddler = story.toddler.card.find(c => c.id === cardId);
      if (toddler) {
        setFormData({
          title: toddler.title || { en: '', te: '', hi: '' },
          description: toddler.description || { en: '', te: '', hi: '' },
          timeToRead: toddler.timeToRead || { en: '', te: '', hi: '' },
          storyType: toddler.storyType || { en: '', te: '', hi: '' },
          thumbnailImage: toddler.thumbnailImage || '',
          coverImage: toddler.coverImage || '',
          partContent: toddler.partContent || []
        });
        
        // Determine which languages have data
        const languagesWithData = [];
        if (toddler.title?.en || toddler.description?.en || toddler.timeToRead?.en || toddler.storyType?.en) {
          languagesWithData.push('en');
        }
        if (toddler.title?.te || toddler.description?.te || toddler.timeToRead?.te || toddler.storyType?.te) {
          languagesWithData.push('te');
        }
        if (toddler.title?.hi || toddler.description?.hi || toddler.timeToRead?.hi || toddler.storyType?.hi) {
          languagesWithData.push('hi');
        }
        
        // Set selected languages based on available data, fallback to story languages
        const storyLanguages = story.languages || ['en', 'te'];
        setSelectedLanguages(languagesWithData.length > 0 ? languagesWithData : storyLanguages);
      }
    }
  }, [stories, storyId, cardId]);

  const handleInputChange = (field, language, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }));
  };

  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(prev => prev.filter(l => l !== lang));
    } else {
      setSelectedLanguages(prev => [...prev, lang]);
    }
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handlePartContentChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      partContent: prev.partContent.map((part, i) => 
        i === index ? { ...part, [field]: value } : part
      )
    }));
  };

  const addPartContent = () => {
    setFormData(prev => ({
      ...prev,
      partContent: [...prev.partContent, {
        id: Date.now().toString(),
        oneLineText: { en: '', te: '', hi: '' },
        headingText: { en: '', te: '', hi: '' },
        imageUrl: null
      }]
    }));
  };

  const removePartContent = (index) => {
    setFormData(prev => ({
      ...prev,
      partContent: prev.partContent.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Filter form data to only include selected languages
      const filteredFormData = {
        ...formData,
        title: Object.fromEntries(
          Object.entries(formData.title).filter(([lang]) => selectedLanguages.includes(lang))
        ),
        description: Object.fromEntries(
          Object.entries(formData.description).filter(([lang]) => selectedLanguages.includes(lang))
        ),
        timeToRead: Object.fromEntries(
          Object.entries(formData.timeToRead).filter(([lang]) => selectedLanguages.includes(lang))
        ),
        storyType: Object.fromEntries(
          Object.entries(formData.storyType).filter(([lang]) => selectedLanguages.includes(lang))
        ),
        partContent: formData.partContent.map(part => ({
          ...part,
          oneLineText: part.oneLineText ? Object.fromEntries(
            Object.entries(part.oneLineText).filter(([lang]) => selectedLanguages.includes(lang))
          ) : undefined,
          headingText: part.headingText ? Object.fromEntries(
            Object.entries(part.headingText).filter(([lang]) => selectedLanguages.includes(lang))
          ) : undefined
        }))
      };
      
      await updateAgeContent(storyId, cardId, 'toddler', {
        card: filteredFormData
      });
    } catch (error) {
      console.error('Error updating toddler:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this toddler story?")) {
      try {
        await deleteAgeContent(storyId, cardId, 'toddler');
        navigate('/stories/toddler');
      } catch (error) {
        console.error('Error deleting toddler:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Toddler Story</h1>
        <button
          onClick={() => navigate('/stories/toddler')}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} /> Back to Toddler Stories
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 space-y-6">
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Languages for this Toddler Story:</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedLanguages.includes("en")}
                onChange={() => toggleLanguage("en")}
                className="mr-2"
              />
              English
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedLanguages.includes("te")}
                onChange={() => toggleLanguage("te")}
                className="mr-2"
              />
              Telugu
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedLanguages.includes("hi")}
                onChange={() => toggleLanguage("hi")}
                className="mr-2"
              />
              Hindi
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedLanguages.includes('en') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">English</label>
                <input
                  type="text"
                  value={formData.title.en}
                  onChange={(e) => handleInputChange('title', 'en', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            {selectedLanguages.includes('te') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Telugu</label>
                <input
                  type="text"
                  value={formData.title.te}
                  onChange={(e) => handleInputChange('title', 'te', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            {selectedLanguages.includes('hi') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hindi</label>
                <input
                  type="text"
                  value={formData.title.hi}
                  onChange={(e) => handleInputChange('title', 'hi', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedLanguages.includes('en') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">English</label>
                <textarea
                  value={formData.description.en}
                  onChange={(e) => handleInputChange('description', 'en', e.target.value)}
                  className="w-full p-2 border rounded h-20"
                />
              </div>
            )}
            {selectedLanguages.includes('te') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Telugu</label>
                <textarea
                  value={formData.description.te}
                  onChange={(e) => handleInputChange('description', 'te', e.target.value)}
                  className="w-full p-2 border rounded h-20"
                />
              </div>
            )}
            {selectedLanguages.includes('hi') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hindi</label>
                <textarea
                  value={formData.description.hi}
                  onChange={(e) => handleInputChange('description', 'hi', e.target.value)}
                  className="w-full p-2 border rounded h-20"
                />
              </div>
            )}
          </div>
        </div>

        {/* Time to Read */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time to Read</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedLanguages.includes('en') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">English</label>
                <input
                  type="text"
                  value={formData.timeToRead.en}
                  onChange={(e) => handleInputChange('timeToRead', 'en', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            {selectedLanguages.includes('te') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Telugu</label>
                <input
                  type="text"
                  value={formData.timeToRead.te}
                  onChange={(e) => handleInputChange('timeToRead', 'te', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            {selectedLanguages.includes('hi') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hindi</label>
                <input
                  type="text"
                  value={formData.timeToRead.hi}
                  onChange={(e) => handleInputChange('timeToRead', 'hi', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>
        </div>

        {/* Story Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Story Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedLanguages.includes('en') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">English</label>
                <input
                  type="text"
                  value={formData.storyType.en}
                  onChange={(e) => handleInputChange('storyType', 'en', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            {selectedLanguages.includes('te') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Telugu</label>
                <input
                  type="text"
                  value={formData.storyType.te}
                  onChange={(e) => handleInputChange('storyType', 'te', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            {selectedLanguages.includes('hi') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hindi</label>
                <input
                  type="text"
                  value={formData.storyType.hi}
                  onChange={(e) => handleInputChange('storyType', 'hi', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('thumbnailImage', e.target.files[0])}
              className="w-full p-2 border rounded"
            />
            {formData.thumbnailImage && typeof formData.thumbnailImage === 'string' && (
              <img src={formData.thumbnailImage} alt="Thumbnail" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('coverImage', e.target.files[0])}
              className="w-full p-2 border rounded"
            />
            {formData.coverImage && typeof formData.coverImage === 'string' && (
              <img src={formData.coverImage} alt="Cover" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
          </div>
        </div>

        {/* Part Content */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Part Content</label>
            <button
              type="button"
              onClick={addPartContent}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Add Part
            </button>
          </div>
          
          {formData.partContent.map((part, index) => (
            <div key={part.id} className="border rounded p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Part {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removePartContent(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {selectedLanguages.includes('en') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">One Line Text (EN)</label>
                    <input
                      type="text"
                      value={part.oneLineText?.en || ''}
                      onChange={(e) => handlePartContentChange(index, 'oneLineText', { ...part.oneLineText, en: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
                {selectedLanguages.includes('te') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">One Line Text (TE)</label>
                    <input
                      type="text"
                      value={part.oneLineText?.te || ''}
                      onChange={(e) => handlePartContentChange(index, 'oneLineText', { ...part.oneLineText, te: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
                {selectedLanguages.includes('hi') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">One Line Text (HI)</label>
                    <input
                      type="text"
                      value={part.oneLineText?.hi || ''}
                      onChange={(e) => handlePartContentChange(index, 'oneLineText', { ...part.oneLineText, hi: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {selectedLanguages.includes('en') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Heading Text (EN)</label>
                    <input
                      type="text"
                      value={part.headingText?.en || ''}
                      onChange={(e) => handlePartContentChange(index, 'headingText', { ...part.headingText, en: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
                {selectedLanguages.includes('te') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Heading Text (TE)</label>
                    <input
                      type="text"
                      value={part.headingText?.te || ''}
                      onChange={(e) => handlePartContentChange(index, 'headingText', { ...part.headingText, te: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
                {selectedLanguages.includes('hi') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Heading Text (HI)</label>
                    <input
                      type="text"
                      value={part.headingText?.hi || ''}
                      onChange={(e) => handlePartContentChange(index, 'headingText', { ...part.headingText, hi: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePartContentChange(index, 'imageUrl', e.target.files[0])}
                  className="w-full p-2 border rounded"
                />
                {part.imageUrl && typeof part.imageUrl === 'string' && (
                  <img src={part.imageUrl} alt={`Part ${index + 1}`} className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditToddlerForm;
