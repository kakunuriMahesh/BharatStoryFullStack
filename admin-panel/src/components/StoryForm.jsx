import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa'; // For remove icon
import { ButtonLoader } from './Loader';

const StoryForm = ({ addStory, storyToEdit, updateStory }) => {
  console.log(addStory, 'addstory check');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameTe: '',
    nameHi: '',
    languages: [],
    storyCoverImage: '', // URL or File
    bannerImge: '', // URL or File
  });
  const [previews, setPreviews] = useState({
    storyCoverImage: '',
    bannerImge: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (storyToEdit) {
      setFormData({
        nameEn: storyToEdit.name.en || '',
        nameTe: storyToEdit.name.te || '',
        nameHi: storyToEdit.name.hi || '',
        languages: storyToEdit.languages || [],
        storyCoverImage: storyToEdit.storyCoverImage || '', // From DB
        bannerImge: storyToEdit.bannerImge || '', // From DB
      });
      setPreviews({
        storyCoverImage: storyToEdit.storyCoverImage || '',
        bannerImge: storyToEdit.bannerImge || '',
      });
    }
  }, [storyToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox' && name === 'languages') {
      const newLanguages = checked
        ? [...formData.languages, value]
        : formData.languages.filter((lang) => lang !== value);
      setFormData({ ...formData, languages: newLanguages });
    } else if (type === 'file') {
      const file = files[0];
      setFormData({ ...formData, [name]: file || '' });
      setPreviews({
        ...previews,
        [name]: file ? URL.createObjectURL(file) : '',
      });
      setErrors({ ...errors, [name]: '' }); // Clear error on file change
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveImage = (field) => {
    setFormData({ ...formData, [field]: '' });
    setPreviews({ ...previews, [field]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.storyCoverImage) newErrors.storyCoverImage = 'Story Cover Image is required';
    if (!formData.bannerImge) newErrors.bannerImge = 'Banner Image is required';
    if (!formData.languages.length) newErrors.languages = 'At least one language is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log('handleSubmit called, event:', e);
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, proceeding with submission');
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append('nameEn', formData.nameEn);
      data.append('nameTe', formData.nameTe);
      data.append('nameHi', formData.nameHi);
      data.append('languages', JSON.stringify(formData.languages));
      if (typeof formData.storyCoverImage === 'string' && formData.storyCoverImage) {
        data.append('storyCoverImage', formData.storyCoverImage); // Existing URL
      } else if (formData.storyCoverImage) {
        data.append('storyCoverImage', formData.storyCoverImage); // New file
      }
      if (typeof formData.bannerImge === 'string' && formData.bannerImge) {
        data.append('bannerImge', formData.bannerImge); // Existing URL
      } else if (formData.bannerImge) {
        data.append('bannerImge', formData.bannerImge); // New file
      }

      console.log('Calling addStory function:', addStory);
      if (storyToEdit) {
        await updateStory(storyToEdit.id, data);
      } else {
        await addStory(data);
      }

      setFormData({
        nameEn: '',
        nameTe: '',
        nameHi: '',
        languages: [],
        storyCoverImage: '',
        bannerImge: '',
      });
      setPreviews({ storyCoverImage: '', bannerImge: '' });
      setErrors({});
      console.log('Form submission completed successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{storyToEdit ? 'Edit Story' : 'Add Story'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label>English Name:</label>
          <input
            type="text"
            name="nameEn"
            value={formData.nameEn}
            onChange={handleChange}
            className="border p-2 w-full text-black"
            disabled={!formData.languages.includes('en')}
          />
        </div>
        <div>
          <label>Telugu Name:</label>
          <input
            type="text"
            name="nameTe"
            value={formData.nameTe}
            onChange={handleChange}
            className="border p-2 w-full text-black"
            disabled={!formData.languages.includes('te')}
          />
        </div>
        <div>
          <label>Hindi Name:</label>
          <input
            type="text"
            name="nameHi"
            value={formData.nameHi}
            onChange={handleChange}
            className="border p-2 w-full text-black"
            disabled={!formData.languages.includes('hi')}
          />
        </div>
        <div>
          <label>Languages:</label>
          <div>
            <label>
              <input
                type="checkbox"
                name="languages"
                value="en"
                checked={formData.languages.includes('en')}
                onChange={handleChange}
              />
              English
            </label>
            <label>
              <input
                type="checkbox"
                name="languages"
                value="te"
                checked={formData.languages.includes('te')}
                onChange={handleChange}
              />
              Telugu
            </label>
            <label>
              <input
                type="checkbox"
                name="languages"
                value="hi"
                checked={formData.languages.includes('hi')}
                onChange={handleChange}
              />
              Hindi
            </label>
          </div>
          {errors.languages && <p className="text-red-500">{errors.languages}</p>}
        </div>
        <div>
          <label>Story Cover Image:</label>
          <input type="file" name="storyCoverImage" onChange={handleChange} accept="image/*" />
          {previews.storyCoverImage && (
            <div className="mt-2 flex items-center">
              <img src={previews.storyCoverImage} alt="Cover Preview" className="max-w-xs h-auto" />
              <button
                type="button"
                onClick={() => handleRemoveImage('storyCoverImage')}
                className="ml-2 text-red-500"
              >
                <FaTrash />
              </button>
            </div>
          )}
          {errors.storyCoverImage && <p className="text-red-500">{errors.storyCoverImage}</p>}
        </div>
        <div>
          <label>Banner Image:</label>
          <input type="file" name="bannerImge" onChange={handleChange} accept="image/*" />
          {previews.bannerImge && (
            <div className="mt-2 flex items-center">
              <img src={previews.bannerImge} alt="Banner Preview" className="max-w-xs h-auto" />
              <button
                type="button"
                onClick={() => handleRemoveImage('bannerImge')}
                className="ml-2 text-red-500"
              >
                <FaTrash />
              </button>
            </div>
          )}
          {errors.bannerImge && <p className="text-red-500">{errors.bannerImge}</p>}
        </div>
        <ButtonLoader
          type="submit"
          loading={loading}
          className="bg-blue-500 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => {
            console.log('Button clicked');
            if (loading) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {storyToEdit ? 'Update Story' : 'Add Story'}
        </ButtonLoader>
      </form>
    </div>
  );
};

export default StoryForm;

// ----- updated code without image preview and url -----

// import React, { useState } from 'react';

// const StoryForm = ({ addStory }) => {
//   const [formData, setFormData] = useState({
//     nameEn: '',
//     nameTe: '',
//     nameHi: '',
//     languages: [],
//     storyCoverImage: null,
//     bannerImge: null,
//   });
//   const [previews, setPreviews] = useState({
//     storyCoverImage: null,
//     bannerImge: null,
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
//     if (type === 'checkbox' && name === 'languages') {
//       const newLanguages = checked
//         ? [...formData.languages, value]
//         : formData.languages.filter((lang) => lang !== value);
//       setFormData({ ...formData, languages: newLanguages });
//     } else if (type === 'file') {
//       const file = files[0];
//       setFormData({ ...formData, [name]: file });
//       setPreviews({ ...previews, [name]: file ? URL.createObjectURL(file) : null });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const removeImage = (field) => {
//     setFormData({ ...formData, [field]: null });
//     setPreviews({ ...previews, [field]: null });
//   };

//   const validateForm = () => {
//     const errors = [];
//     formData.languages.forEach((lang) => {
//       if (!formData[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}`]) {
//         errors.push(`Name (${lang}) is required`);
//       }
//     });
//     return errors;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const errors = validateForm();
//     if (errors.length > 0) {
//       alert(`Please fill in all required fields:\n${errors.join('\n')}`);
//       return;
//     }

//     const data = new FormData();
//     data.append('nameEn', formData.nameEn);
//     data.append('nameTe', formData.nameTe);
//     data.append('nameHi', formData.nameHi);
//     data.append('languages', JSON.stringify(formData.languages));
//     if (formData.storyCoverImage) data.append('storyCoverImage', formData.storyCoverImage);
//     if (formData.bannerImge) data.append('bannerImge', formData.bannerImge);

//     addStory(data);

//     setFormData({
//       nameEn: '',
//       nameTe: '',
//       nameHi: '',
//       languages: [],
//       storyCoverImage: null,
//       bannerImge: null,
//     });
//     setPreviews({
//       storyCoverImage: null,
//       bannerImge: null,
//     });
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl mb-4">Add Story</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label>English Name:</label>
//           <input
//             type="text"
//             name="nameEn"
//             value={formData.nameEn}
//             onChange={handleChange}
//             className="border p-2 w-full"
//             disabled={!formData.languages.includes('en')}
//           />
//         </div>
//         <div>
//           <label>Telugu Name:</label>
//           <input
//             type="text"
//             name="nameTe"
//             value={formData.nameTe}
//             onChange={handleChange}
//             className="border p-2 w-full"
//             disabled={!formData.languages.includes('te')}
//           />
//         </div>
//         <div>
//           <label>Hindi Name:</label>
//           <input
//             type="text"
//             name="nameHi"
//             value={formData.nameHi}
//             onChange={handleChange}
//             className="border p-2 w-full"
//             disabled={!formData.languages.includes('hi')}
//           />
//         </div>
//         <div>
//           <label>Languages:</label>
//           <div>
//             <label>
//               <input
//                 type="checkbox"
//                 name="languages"
//                 value="en"
//                 checked={formData.languages.includes('en')}
//                 onChange={handleChange}
//               />
//               English
//             </label>
//             <label>
//               <input
//                 type="checkbox"
//                 name="languages"
//                 value="te"
//                 checked={formData.languages.includes('te')}
//                 onChange={handleChange}
//               />
//               Telugu
//             </label>
//             <label>
//               <input
//                 type="checkbox"
//                 name="languages"
//                 value="hi"
//                 checked={formData.languages.includes('hi')}
//                 onChange={handleChange}
//               />
//               Hindi
//             </label>
//           </div>
//         </div>
//         <div>
//           <label>Story Cover Image:</label>
//           <input type="file" name="storyCoverImage" onChange={handleChange} accept="image/*" />
//           {previews.storyCoverImage && (
//             <div className="mt-2 relative inline-block">
//               <img
//                 src={previews.storyCoverImage}
//                 alt="Story Cover Preview"
//                 className="max-w-xs h-auto"
//               />
//               <button
//                 type="button"
//                 onClick={() => removeImage('storyCoverImage')}
//                 className="absolute top-0 right-0 text-red-500 hover:text-red-700"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="20"
//                   height="20"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path d="M18 6L6 18M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//           )}
//         </div>
//         <div>
//           <label>Banner Image:</label>
//           <input type="file" name="bannerImge" onChange={handleChange} accept="image/*" />
//           {previews.bannerImge && (
//             <div className="mt-2 relative inline-block">
//               <img
//                 src={previews.bannerImge}
//                 alt="Banner Preview"
//                 className="max-w-xs h-auto"
//               />
//               <button
//                 type="button"
//                 onClick={() => removeImage('bannerImge')}
//                 className="absolute top-0 right-0 text-red-500 hover:text-red-700"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="20"
//                   height="20"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path d="M18 6L6 18M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//           )}
//         </div>
//         <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//           Add Story
//         </button>
//       </form>
//     </div>
//   );
// };

// export default StoryForm;


// ----- begin original code -----

// import React, { useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { Image, Trash2 } from 'lucide-react';

// const StoryForm = ({ addStory }) => {
//   const location = useLocation();
//   const [formData, setFormData] = useState({ nameEn: '', nameTe: '', nameHi: '', storyCoverImage: null, bannerImge: null });
//   const [languages, setLanguages] = useState(location.state?.languages || ['en', 'te']);
//   const [imagePreviews, setImagePreviews] = useState({ storyCoverImage: null, bannerImge: null });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.storyCoverImage || !formData.bannerImge) {
//       alert('Please upload both Story Cover Image and Banner Image');
//       return;
//     }
//     const data = new FormData();
//     if (languages.includes('en')) data.append('nameEn', formData.nameEn);
//     if (languages.includes('te')) data.append('nameTe', formData.nameTe);
//     if (languages.includes('hi')) data.append('nameHi', formData.nameHi);
//     data.append('storyCoverImage', formData.storyCoverImage);
//     data.append('bannerImge', formData.bannerImge);
//     data.append('languages', JSON.stringify(languages));
//     addStory(data);
//   };

//   const handleImageChange = (field, e) => {
//     const file = e.target.files[0];
//     setFormData({ ...formData, [field]: file });
//     setImagePreviews({ ...imagePreviews, [field]: URL.createObjectURL(file) });
//   };

//   const removeImage = (field) => {
//     setFormData({ ...formData, [field]: null });
//     setImagePreviews({ ...imagePreviews, [field]: null });
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Add New Story</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label className="font-semibold">Languages:</label>
//           <div className="flex space-x-4">
//             <label><input type="checkbox" checked={languages.includes('en')} onChange={(e) => setLanguages(e.target.checked ? [...languages, 'en'] : languages.filter((l) => l !== 'en'))} /> English</label>
//             <label><input type="checkbox" checked={languages.includes('te')} onChange={(e) => setLanguages(e.target.checked ? [...languages, 'te'] : languages.filter((l) => l !== 'te'))} /> Telugu</label>
//             <label><input type="checkbox" checked={languages.includes('hi')} onChange={(e) => setLanguages(e.target.checked ? [...languages, 'hi'] : languages.filter((l) => l !== 'hi'))} /> Hindi</label>
//           </div>
//         </div>
//         {languages.includes('en') && (
//           <div className="mb-4">
//             <label className="flex items-center"><span className="font-semibold mr-2">Name (English):</span>
//               <input type="text" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} className="border p-2 w-full" />
//             </label>
//           </div>
//         )}
//         {languages.includes('te') && (
//           <div className="mb-4">
//             <label className="flex items-center"><span className="font-semibold mr-2">Name (Telugu):</span>
//               <input type="text" value={formData.nameTe} onChange={(e) => setFormData({ ...formData, nameTe: e.target.value })} className="border p-2 w-full" />
//             </label>
//           </div>
//         )}
//         {languages.includes('hi') && (
//           <div className="mb-4">
//             <label className="flex items-center"><span className="font-semibold mr-2">Name (Hindi):</span>
//               <input type="text" value={formData.nameHi} onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })} className="border p-2 w-full" />
//             </label>
//           </div>
//         )}
//         <div className="mb-4">
//           <label className="flex items-center"><Image className="mr-2" /> Story Cover Image:</label>
//           <input type="file" onChange={(e) => handleImageChange('storyCoverImage', e)} className="mb-2" />
//           {imagePreviews.storyCoverImage && (
//             <div className="flex items-center">
//               <img src={imagePreviews.storyCoverImage} alt="Preview" className="w-32 h-32 object-cover mr-2" />
//               <button type="button" onClick={() => removeImage('storyCoverImage')} className="text-red-500"><Trash2 /></button>
//             </div>
//           )}
//         </div>
//         <div className="mb-4">
//           <label className="flex items-center"><Image className="mr-2" /> Banner Image:</label>
//           <input type="file" onChange={(e) => handleImageChange('bannerImge', e)} className="mb-2" />
//           {imagePreviews.bannerImge && (
//             <div className="flex items-center">
//               <img src={imagePreviews.bannerImge} alt="Preview" className="w-32 h-32 object-cover mr-2" />
//               <button type="button" onClick={() => removeImage('bannerImge')} className="text-red-500"><Trash2 /></button>
//             </div>
//           )}
//         </div>
//         <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add Story</button>
//       </form>
//     </div>
//   );
// };

// export default StoryForm;