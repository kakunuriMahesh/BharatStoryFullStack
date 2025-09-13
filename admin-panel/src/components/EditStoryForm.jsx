import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaTrash } from 'react-icons/fa'; // For remove icon
import { ButtonLoader } from './Loader';

const EditStoryForm = ({ updateStory, deleteStory }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
  const [removeLanguages, setRemoveLanguages] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/stories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched story:', response.data); // Debug response
        setStory(response.data);
        setFormData({
          nameEn: response.data.name?.en || '',
          nameTe: response.data.name?.te || '',
          nameHi: response.data.name?.hi || '',
          languages: response.data.languages || [],
          storyCoverImage: response.data.storyCoverImage || '', // From DB
          bannerImge: response.data.bannerImge || '', // From DB
        });
        setPreviews({
          storyCoverImage: response.data.storyCoverImage || '',
          bannerImge: response.data.bannerImge || '',
        });
      } catch (err) {
        console.error('Error fetching story:', err);
      }
    };
    fetchStory();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox' && name === 'languages') {
      const newLanguages = checked
        ? [...formData.languages, value]
        : formData.languages.filter((lang) => lang !== value);

      if (!checked && story?.languages.includes(value)) {
        setRemoveLanguages([...removeLanguages, value]);
      } else {
        setRemoveLanguages(removeLanguages.filter((lang) => lang !== value));
      }

      setFormData((prev) => ({ ...prev, languages: newLanguages }));
    } else if (type === 'file') {
      const file = files[0];
      console.log(`File selected for ${name}:`, file); // Debug file upload
      if (file) {
        setFormData((prev) => ({ ...prev, [name]: file }));
        setPreviews((prev) => ({
          ...prev,
          [name]: URL.createObjectURL(file),
        }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = (field) => {
    console.log(`Removing image for ${field}`); // Debug removal
    setFormData((prev) => ({ ...prev, [field]: '' }));
    setPreviews((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.storyCoverImage) newErrors.storyCoverImage = 'Story Cover Image is required';
    if (!formData.bannerImge) newErrors.bannerImge = 'Banner Image is required';
    if (!formData.languages.length) newErrors.languages = 'At least one language is required';
    setErrors(newErrors);
    console.log('Validation errors:', newErrors); // Debug validation
    return Object.keys(newErrors).length === 0;
  };

  const confirmAction = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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

      if (removeLanguages.length > 0) {
        const confirmRemove = window.confirm(
          `Do you want to remove the following languages: ${removeLanguages.join(', ')}? ` +
          'If you remove them, all content in these languages will be deleted from the story and its parts.'
        );
        if (confirmRemove) {
          data.append('removeLanguages', JSON.stringify(removeLanguages));
          data.append('deleteContent', 'true');
          await updateStory(id, data);
          setRemoveLanguages([]); // Reset after successful update
        } else {
          setFormData((prev) => ({ ...prev, languages: story.languages }));
          setRemoveLanguages([]);
          return;
        }
      } else {
        await updateStory(id, data);
      }

      navigate('/'); // Redirect after update
    } catch (error) {
      console.error('Error updating story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      setDeleteLoading(true);
      try {
        await deleteStory(id);
        navigate('/');
      } catch (error) {
        console.error('Error deleting story:', error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  if (!story) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Edit Story</h2>
      <form onSubmit={confirmAction} className="space-y-4">
        <div>
          <label>English Name:</label>
          <input
            type="text"
            name="nameEn"
            value={formData.nameEn}
            onChange={handleChange}
            className="border p-2 w-full"
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
            className="border p-2 w-full"
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
            className="border p-2 w-full"
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
        >
          Update Story
        </ButtonLoader>
        <ButtonLoader
          type="button"
          loading={deleteLoading}
          onClick={handleDelete}
          className="bg-red-500 text-white p-2 rounded ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete Story
        </ButtonLoader>
      </form>
    </div>
  );
};

export default EditStoryForm;

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { Image as ImageIcon, Trash2 } from 'lucide-react';

// const EditStoryForm = ({ updateStory, deleteStory }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ nameEn: '', nameTe: '', nameHi: '', storyCoverImage: null, bannerImge: null });
//   const [languages, setLanguages] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState({ storyCoverImage: null, bannerImge: null });
//   const [confirmModal, setConfirmModal] = useState({ show: false, action: '' });

//   useEffect(() => {
//     const fetchStory = async () => {
//       const token = Cookies.get('token');
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/stories/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setFormData({
//         nameEn: response.data.name.en || '',
//         nameTe: response.data.name.te || '',
//         nameHi: response.data.name.hi || '',
//         storyCoverImage: null,
//         bannerImge: null,
//       });
//       setLanguages(response.data.languages);
//       setImagePreviews({
//         storyCoverImage: response.data.storyCoverImage,
//         bannerImge: response.data.bannerImge,
//       });
//     };
//     fetchStory();
//   }, [id]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setConfirmModal({ show: true, action: 'update' });
//   };

//   const handleDelete = () => {
//     setConfirmModal({ show: true, action: 'delete' });
//   };

//   const handleImageChange = (field, e) => {
//     const file = e.target.files[0];
//     setFormData({ ...formData, [field]: file });
//     setImagePreviews({ ...imagePreviews, [field]: URL.createObjectURL(file) });
//   };

//   const confirmAction = () => {
//     if (confirmModal.action === 'update') {
//       const data = new FormData();
//       if (languages.includes('en')) data.append('nameEn', formData.nameEn || '');
//       if (languages.includes('te')) data.append('nameTe', formData.nameTe || '');
//       if (languages.includes('hi')) data.append('nameHi', formData.nameHi || '');
//       if (formData.storyCoverImage) data.append('storyCoverImage', formData.storyCoverImage);
//       if (formData.bannerImge) data.append('bannerImge', formData.bannerImge);
//       data.append('languages', JSON.stringify(languages));
//       updateStory(id, data);
//     } else if (confirmModal.action === 'delete') {
//       deleteStory(id);
//     }
//     setConfirmModal({ show: false, action: '' });
//     navigate('/my-stories'); // Navigate after action
//   };

//   const toggleLanguage = (lang) => {
//     setLanguages((prev) =>
//       prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
//     );
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Edit Story</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label className="font-semibold">Languages:</label>
//           <div className="flex space-x-4">
//             <label><input type="checkbox" checked={languages.includes('en')} onChange={() => toggleLanguage('en')} /> English</label>
//             <label><input type="checkbox" checked={languages.includes('te')} onChange={() => toggleLanguage('te')} /> Telugu</label>
//             <label><input type="checkbox" checked={languages.includes('hi')} onChange={() => toggleLanguage('hi')} /> Hindi</label>
//           </div>
//         </div>
//         <div className="grid grid-cols-3 gap-4">
//           {languages.includes('en') && (
//             <div className="mb-4">
//               <label className="flex items-center"><span className="font-semibold mr-2">Name (English):</span>
//                 <input type="text" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} className="border p-2 w-full" />
//               </label>
//             </div>
//           )}
//           {languages.includes('te') && (
//             <div className="mb-4">
//               <label className="flex items-center"><span className="font-semibold mr-2">Name (Telugu):</span>
//                 <input type="text" value={formData.nameTe} onChange={(e) => setFormData({ ...formData, nameTe: e.target.value })} className="border p-2 w-full" />
//               </label>
//             </div>
//           )}
//           {languages.includes('hi') && (
//             <div className="mb-4">
//               <label className="flex items-center"><span className="font-semibold mr-2">Name (Hindi):</span>
//                 <input type="text" value={formData.nameHi} onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })} className="border p-2 w-full" />
//               </label>
//             </div>
//           )}
//         </div>
//         <div className="mb-4">
//           <label className="flex items-center"><ImageIcon className="mr-2" /> Story Cover Image:</label>
//           <input type="file" onChange={(e) => handleImageChange('storyCoverImage', e)} className="mb-2" />
//           {imagePreviews.storyCoverImage && <img src={imagePreviews.storyCoverImage} alt="Cover Preview" className="w-32 h-32 object-cover" />}
//         </div>
//         <div className="mb-4">
//           <label className="flex items-center"><ImageIcon className="mr-2" /> Banner Image:</label>
//           <input type="file" onChange={(e) => handleImageChange('bannerImge', e)} className="mb-2" />
//           {imagePreviews.bannerImge && <img src={imagePreviews.bannerImge} alt="Banner Preview" className="w-32 h-32 object-cover" />}
//         </div>
//         <button type="submit" className="bg-green-500 text-white px-4 py-2 mr-2 rounded">Update Story</button>
//         <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">Delete Story</button>
//       </form>
//       {confirmModal.show && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded shadow-lg">
//             <p className="text-lg font-semibold">
//               {confirmModal.action === 'update' ? 'Confirm update?' : 'Delete story and all parts?'}
//             </p>
//             <button onClick={confirmAction} className="bg-green-500 text-white px-4 py-2 mr-2 rounded">Yes</button>
//             <button onClick={() => setConfirmModal({ show: false, action: '' })} className="bg-red-500 text-white px-4 py-2 rounded">No</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EditStoryForm;

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Cookies from 'js-cookie';

// const EditStoryForm = ({ updateStory, deleteStory }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ nameEn: '', nameTe: '', nameHi: '', storyCoverImage: null, bannerImge: null });
//   const [languages, setLanguages] = useState([]);
//   const [confirmModal, setConfirmModal] = useState({ show: false, action: '' });

//   useEffect(() => {
//     const fetchStory = async () => {
//       const token = Cookies.get('token');
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/stories/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setFormData({
//         nameEn: response.data.name.en || '',
//         nameTe: response.data.name.te || '',
//         nameHi: response.data.name.hi || '',
//         storyCoverImage: null,
//         bannerImge: null,
//       });
//       setLanguages(response.data.languages);
//     };
//     fetchStory();
//   }, [id]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setConfirmModal({ show: true, action: 'update' });
//   };

//   const handleDelete = () => {
//     setConfirmModal({ show: true, action: 'delete' });
//   };

//   const confirmAction = () => {
//     if (confirmModal.action === 'update') {
//       const data = new FormData();
//       if (languages.includes('en')) data.append('nameEn', formData.nameEn);
//       if (languages.includes('te')) data.append('nameTe', formData.nameTe);
//       if (languages.includes('hi')) data.append('nameHi', formData.nameHi);
//       if (formData.storyCoverImage) data.append('storyCoverImage', formData.storyCoverImage);
//       if (formData.bannerImge) data.append('bannerImge', formData.bannerImge);
//       data.append('languages', JSON.stringify(languages));
//       updateStory(id, data);
//     } else if (confirmModal.action === 'delete') {
//       deleteStory(id);
//     }
//     setConfirmModal({ show: false, action: '' });
//   };

//   return (
//     <div className="p-6">
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label>Languages:</label>
//           <input
//             type="checkbox"
//             checked={languages.includes('en')}
//             onChange={(e) => setLanguages(e.target.checked ? [...languages, 'en'] : languages.filter((l) => l !== 'en'))}
//           /> English
//           <input
//             type="checkbox"
//             checked={languages.includes('te')}
//             onChange={(e) => setLanguages(e.target.checked ? [...languages, 'te'] : languages.filter((l) => l !== 'te'))}
//           /> Telugu
//           <input
//             type="checkbox"
//             checked={languages.includes('hi')}
//             onChange={(e) => setLanguages(e.target.checked ? [...languages, 'hi'] : languages.filter((l) => l !== 'hi'))}
//           /> Hindi
//         </div>
//         {languages.includes('en') && (
//           <input
//             type="text"
//             value={formData.nameEn}
//             onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
//             placeholder="Name (English)"
//             className="border p-2 mb-2 w-full"
//           />
//         )}
//         {languages.includes('te') && (
//           <input
//             type="text"
//             value={formData.nameTe}
//             onChange={(e) => setFormData({ ...formData, nameTe: e.target.value })}
//             placeholder="Name (Telugu)"
//             className="border p-2 mb-2 w-full"
//           />
//         )}
//         {languages.includes('hi') && (
//           <input
//             type="text"
//             value={formData.nameHi}
//             onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })}
//             placeholder="Name (Hindi)"
//             className="border p-2 mb-2 w-full"
//           />
//         )}
//         <input
//           type="file"
//           onChange={(e) => setFormData({ ...formData, storyCoverImage: e.target.files[0] })}
//           className="mb-2"
//         />
//         <input
//           type="file"
//           onChange={(e) => setFormData({ ...formData, bannerImge: e.target.files[0] })}
//           className="mb-2"
//         />
//         <button type="submit" className="bg-green-500 text-white px-4 py-2 mr-2 rounded">
//           Update Story
//         </button>
//         <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
//           Delete Story
//         </button>
//       </form>
//       {confirmModal.show && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded shadow-lg">
//             <p className="text-lg font-semibold">
//               {confirmModal.action === 'update' ? 'Confirm update?' : 'Delete story and all parts?'}
//             </p>
//             <button onClick={confirmAction} className="bg-green-500 text-white px-4 py-2 mr-2 rounded">
//               Yes
//             </button>
//             <button
//               onClick={() => setConfirmModal({ show: false, action: '' })}
//               className="bg-red-500 text-white px-4 py-2 rounded"
//             >
//               No
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EditStoryForm;