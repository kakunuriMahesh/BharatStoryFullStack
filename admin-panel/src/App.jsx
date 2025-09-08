import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MyStories from './pages/MyStories';
import StoryForm from './components/StoryForm';
import EditStoryForm from './components/EditStoryForm';
import PartForm from './components/PartForm';
import Login from './pages/Login';
import NotifySubscribers from './pages/notifySubscribers';

function App() {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [modal, setModal] = useState({ show: false, message: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setIsAuthenticated(true);
      fetchStories(token);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchStories = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/stories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStories(response.data);
      setFilteredStories(response.data);
    } catch (err) {
      setModal({ show: true, message: 'Failed to fetch stories' });
    }
  };

  const addStory = async (data) => {
    console.log('Sending data for addStory:', data);
    try {
      const token = Cookies.get('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/stories`, data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      const updatedStories = [...stories, response.data.story];
      setStories(updatedStories);
      setFilteredStories(updatedStories);
      setModal({ show: true, message: 'Story added successfully!' });
      setTimeout(() => setModal({ show: false, message: '' }), 2000);
      navigate('/my-stories');
    } catch (err) {
      console.error('Add story error:', err.response?.data || err.message);
      setModal({ show: true, message: 'Failed to add story' });
    }
  };

  const updateStory = async (id, data) => {
    console.log('Sending data for updateStory:', id, data);
    try {
      const token = Cookies.get('token');
      for (let pair of data.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/stories/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      console.log('Response from updateStory:', response.data);
      const updatedStories = stories.map((s) => (s.id === id ? response.data.story : s));
      setStories(updatedStories);
      setFilteredStories(updatedStories);
      setModal({ show: true, message: 'Story updated successfully!' });
      setTimeout(() => setModal({ show: false, message: '' }), 2000);
      navigate('/my-stories');
    } catch (err) {
      console.error('Update story error:', err.response?.data || err.message);
      setModal({ show: true, message: `Failed to update story: ${err.response?.data?.details || 'Unknown error'}` });
    }
  };

  const deleteStory = async (id) => {
    try {
      const token = Cookies.get('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/stories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedStories = stories.filter((s) => s.id !== id);
      setStories(updatedStories);
      setFilteredStories(updatedStories);
      setModal({ show: true, message: 'Story deleted successfully!' });
      setTimeout(() => setModal({ show: false, message: '' }), 2000);
    } catch (err) {
      console.error('Delete story error:', err.response?.data || err.message);
      setModal({ show: true, message: 'Failed to delete story' });
    }
  };

  const addPart = async (data) => {
    try {
      const token = Cookies.get('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/parts`, data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      const updatedStories = stories.map((s) =>
        s.id === data.get('storyId') ? { ...s, parts: { card: s.parts.card.concat(response.data.part) } } : s
      );
      setStories(updatedStories);
      setFilteredStories(updatedStories);
      setModal({ show: true, message: response.data.message });
      setTimeout(() => setModal({ show: false, message: '' }), 2000);
      navigate('/my-stories');
    } catch (err) {
      console.error('Add part error:', err.response?.data || err.message);
      setModal({ show: true, message: 'Failed to add part' });
    }
  };


  // src/App.jsx (only showing relevant changes)
const updatePart = async (storyName, partId, updatedPart) => {
  const formData = updatedPart instanceof FormData ? updatedPart : new FormData();
  if (!(updatedPart instanceof FormData)) {
    const story = stories.find((s) => s.name.en === storyName);
    formData.append('storyId', story.id);
    formData.append('partId', partId);
    Object.entries(updatedPart).forEach(([key, value]) => {
      if (key === 'thumbnailImage' && value) {
        formData.append('thumbnailImage', value);
      } else if (key === 'part' && Array.isArray(value)) {
        value.forEach((p, i) => {
          Object.entries(p).forEach(([subKey, subValue]) => {
            if (subKey === 'image' && subValue) {
              formData.append(`partImage${i}`, subValue);
            } else if (typeof subValue === 'object') {
              Object.entries(subValue).forEach(([lang, langValue]) => {
                if (langValue) formData.append(`${subKey}${lang.charAt(0).toUpperCase() + lang.slice(1)}${i}`, langValue);
              });
            }
          });
        });
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([lang, langValue]) => {
          if (langValue) formData.append(`${key}${lang.charAt(0).toUpperCase() + lang.slice(1)}`, langValue);
        });
      }
    });
  }

  console.log('Sending formData for updatePart:');
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  try {
    const token = Cookies.get('token');
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/parts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
    });
    const updatedStories = stories.map((s) =>
      s.id === formData.get('storyId')
        ? { ...s, parts: { card: s.parts.card.map((p) => (p.id === partId ? response.data.part : p)) } }
        : s
    );
    setStories(updatedStories);
    setFilteredStories(updatedStories);
    setModal({ show: true, message: 'Part updated successfully!' });
    setTimeout(() => setModal({ show: false, message: '' }), 1500);
  } catch (error) {
    console.error('Error updating part:', error.response?.data || error.message);
    setModal({
      show: true,
      message: `Failed to update part: ${error.response?.data?.error || error.response?.data?.details || error.message}`,
    });
  }
};

  const deletePart = async (storyId, partId) => {
    try {
      const token = Cookies.get('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/parts/${storyId}/${partId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedStories = stories.map((s) =>
        s.id === storyId ? { ...s, parts: { card: s.parts.card.filter((p) => p.id !== partId) } } : s
      );
      setStories(updatedStories);
      setFilteredStories(updatedStories);
      setModal({ show: true, message: 'Part deleted successfully!' });
      setTimeout(() => setModal({ show: false, message: '' }), 2000);
    } catch (err) {
      console.error('Delete part error:', err.response?.data || err.message);
      setModal({ show: true, message: 'Failed to delete part' });
    }
  };

  const handleSearch = (selectedStory, query) => {
    if (!query) {
      setFilteredStories(stories);
      return;
    }
    if (selectedStory) {
      const story = stories.find((s) => s.name.en === selectedStory || s.name.te === selectedStory || s.name.hi === selectedStory);
      const filteredParts = story.parts.card.filter((p) =>
        (p.title.en?.toLowerCase().includes(query.toLowerCase()) ||
         p.title.te?.toLowerCase().includes(query.toLowerCase()) ||
         p.title.hi?.toLowerCase().includes(query.toLowerCase())) ||
        p.part.some((subPart) =>
          (subPart.heading.en?.toLowerCase().includes(query.toLowerCase()) ||
           subPart.heading.te?.toLowerCase().includes(query.toLowerCase()) ||
           subPart.heading.hi?.toLowerCase().includes(query.toLowerCase()))
        )
      );
      setFilteredStories(stories.map((s) =>
        (s.name.en === selectedStory || s.name.te === selectedStory || s.name.hi === selectedStory)
          ? { ...s, parts: { card: filteredParts } }
          : s
      ));
    } else {
      const filtered = stories.map((s) => ({
        ...s,
        parts: {
          card: s.parts.card.filter((p) =>
            (p.title.en?.toLowerCase().includes(query.toLowerCase()) ||
             p.title.te?.toLowerCase().includes(query.toLowerCase()) ||
             p.title.hi?.toLowerCase().includes(query.toLowerCase())) ||
            p.part.some((subPart) =>
              (subPart.heading.en?.toLowerCase().includes(query.toLowerCase()) ||
               subPart.heading.te?.toLowerCase().includes(query.toLowerCase()) ||
               subPart.heading.hi?.toLowerCase().includes(query.toLowerCase()))
            )
          ),
        },
      })).filter((s) =>
        s.parts.card.length > 0 ||
        (s.name.en?.toLowerCase().includes(query.toLowerCase()) ||
         s.name.te?.toLowerCase().includes(query.toLowerCase()) ||
         s.name.hi?.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredStories(filtered);
    }
  };

  if (!isAuthenticated) {
    return <Routes><Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} /></Routes>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar stories={filteredStories} onSearch={handleSearch} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-stories" element={<MyStories stories={filteredStories} deleteStory={deleteStory} />} />
        <Route path="/add-story" element={<StoryForm addStory={addStory} />} />
        <Route path="/edit-story/:id" element={<EditStoryForm updateStory={updateStory} deleteStory={deleteStory} />} />
        <Route path="/add-part" element={<PartForm stories={filteredStories} addPart={addPart} updatePart={updatePart} deletePart={deletePart} />} />
        <Route path='/notify-subscribers' element={<NotifySubscribers />} />
      </Routes>
      {modal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg font-semibold">{modal.message}</p>
            <button
              onClick={() => setModal({ show: false, message: '' })}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// import React, { useState, useEffect } from 'react';
// import { Routes, Route, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import Navbar from './components/Navbar';
// import Home from './pages/Home';
// import MyStories from './pages/MyStories';
// import StoryForm from './components/StoryForm';
// import EditStoryForm from './components/EditStoryForm';
// import PartForm from './components/PartForm';
// import Login from './pages/Login';

// function App() {
//   const [stories, setStories] = useState([]);
//   const [filteredStories, setFilteredStories] = useState([]);
//   const [modal, setModal] = useState({ show: false, message: '' });
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = Cookies.get('token');
//     if (token) {
//       setIsAuthenticated(true);
//       fetchStories(token);
//     } else {
//       navigate('/login');
//     }
//   }, [navigate]);

//   const fetchStories = async (token) => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/stories`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setStories(response.data);
//       setFilteredStories(response.data);
//     } catch (err) {
//       setModal({ show: true, message: 'Failed to fetch stories' });
//     }
//   };

//   const addStory = async (data) => {
//     console.log('Sending data for addStory:', data);
//     try {
//       const token = Cookies.get('token');
//       const response = await axios.post(`${import.meta.env.VITE_API_URL}/stories`, data, {
//         headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
//       });
//       const updatedStories = [...stories, response.data.story];
//       setStories(updatedStories);
//       setFilteredStories(updatedStories);
//       setModal({ show: true, message: 'Story added successfully!' });
//       setTimeout(() => setModal({ show: false, message: '' }), 2000);
//       navigate('/my-stories');
//     } catch (err) {
//       console.error('Add story error:', err.response?.data || err.message);
//       setModal({ show: true, message: 'Failed to add story' });
//     }
//   };

//   const updateStory = async (id, data) => {
//     console.log('Sending data for updateStory:', id, data);
//     try {
//       const token = Cookies.get('token');
//       for (let pair of data.entries()) {
//         console.log(`${pair[0]}: ${pair[1]}`);
//       }
//       const response = await axios.put(`${import.meta.env.VITE_API_URL}/stories/${id}`, data, {
//         headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
//       });
//       console.log('Response from updateStory:', response.data);
//       const updatedStories = stories.map((s) => (s.id === id ? response.data.story : s));
//       setStories(updatedStories);
//       setFilteredStories(updatedStories);
//       setModal({ show: true, message: 'Story updated successfully!' });
//       setTimeout(() => setModal({ show: false, message: '' }), 2000);
//       navigate('/my-stories');
//     } catch (err) {
//       console.error('Update story error:', err.response?.data || err.message);
//       setModal({ show: true, message: 'Failed to update story' });
//     }
//   };

//   const deleteStory = async (id) => {
//     try {
//       const token = Cookies.get('token');
//       await axios.delete(`${import.meta.env.VITE_API_URL}/stories/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const updatedStories = stories.filter((s) => s.id !== id);
//       setStories(updatedStories);
//       setFilteredStories(updatedStories);
//       setModal({ show: true, message: 'Story deleted successfully!' });
//       setTimeout(() => setModal({ show: false, message: '' }), 2000);
//     } catch (err) {
//       console.error('Delete story error:', err.response?.data || err.message);
//       setModal({ show: true, message: 'Failed to delete story' });
//     }
//   };

//   const addPart = async (data) => {
//     try {
//       const token = Cookies.get('token');
//       const response = await axios.post(`${import.meta.env.VITE_API_URL}/parts`, data, {
//         headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
//       });
//       const updatedStories = stories.map((s) =>
//         s.id === data.get('storyId') ? { ...s, parts: { card: s.parts.card.concat(response.data.part) } } : s
//       );
//       setStories(updatedStories);
//       setFilteredStories(updatedStories);
//       setModal({ show: true, message: response.data.message });
//       setTimeout(() => setModal({ show: false, message: '' }), 2000);
//       navigate('/my-stories');
//     } catch (err) {
//       console.error('Add part error:', err.response?.data || err.message);
//       setModal({ show: true, message: 'Failed to add part' });
//     }
//   };

//   const updatePart = async (storyName, partId, updatedPart) => {
//     const formData = new FormData();
//     const story = stories.find((s) => s.name.en === storyName);
//     formData.append('storyId', story.id);
//     formData.append('partId', partId);
//     Object.entries(updatedPart).forEach(([key, value]) => {
//       if (key !== 'part' && key !== 'thumbnailImage' && key !== 'coverImage') {
//         if (typeof value === 'object') {
//           Object.entries(value).forEach(([subKey, subValue]) =>
//             formData.append(`${key}${subKey.charAt(0).toUpperCase() + subKey.slice(1)}`, subValue)
//           );
//         } else {
//           formData.append(key, value);
//         }
//       }
//     });
//     if (updatedPart.thumbnailImage) formData.append('thumbnailImage', updatedPart.thumbnailImage);
//     if (updatedPart.coverImage) formData.append('coverImage', updatedPart.coverImage);
//     updatedPart.part.forEach((p, i) => {
//       Object.entries(p).forEach(([key, value]) => {
//         if (key !== 'image') {
//           if (typeof value === 'object') {
//             Object.entries(value).forEach(([subKey, subValue]) =>
//               formData.append(`${key}${subKey.charAt(0).toUpperCase() + subKey.slice(1)}${i}`, subValue)
//             );
//           } else {
//             formData.append(`${key}${i}`, value);
//           }
//         }
//       });
//       if (p.image) formData.append(`partImage${i}`, p.image);
//     });

//     console.log('Sending formData for updatePart:');
//     for (let pair of formData.entries()) {
//       console.log(`${pair[0]}: ${pair[1]}`);
//     }

//     try {
//       const token = Cookies.get('token');
//       const response = await axios.post(`${import.meta.env.VITE_API_URL}/parts`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
//       });
//       const updatedStories = stories.map((s) =>
//         s.id === story.id
//           ? { ...s, parts: { card: s.parts.card.map((p) => (p.id === partId ? response.data.part : p)) } }
//           : s
//       );
//       setStories(updatedStories);
//       setFilteredStories(updatedStories);
//       setModal({ show: true, message: 'Part updated successfully!' });
//       setTimeout(() => setModal({ show: false, message: '' }), 1500);
//     } catch (error) {
//       console.error('Error updating part:', error.response?.data || error.message);
//       setModal({ show: true, message: `Failed to update part: ${error.response?.data?.details || 'Unknown error'}` });
//     }
//   };

//   const deletePart = async (storyId, partId) => {
//     try {
//       const token = Cookies.get('token');
//       await axios.delete(`${import.meta.env.VITE_API_URL}/parts/${storyId}/${partId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const updatedStories = stories.map((s) =>
//         s.id === storyId ? { ...s, parts: { card: s.parts.card.filter((p) => p.id !== partId) } } : s
//       );
//       setStories(updatedStories);
//       setFilteredStories(updatedStories);
//       setModal({ show: true, message: 'Part deleted successfully!' });
//       setTimeout(() => setModal({ show: false, message: '' }), 2000);
//     } catch (err) {
//       console.error('Delete part error:', err.response?.data || err.message);
//       setModal({ show: true, message: 'Failed to delete part' });
//     }
//   };

//   const handleSearch = (selectedStory, query) => {
//     if (!query) {
//       setFilteredStories(stories);
//       return;
//     }
//     if (selectedStory) {
//       const story = stories.find((s) => s.name.en === selectedStory || s.name.te === selectedStory || s.name.hi === selectedStory);
//       const filteredParts = story.parts.card.filter((p) =>
//         (p.title.en?.toLowerCase().includes(query.toLowerCase()) ||
//          p.title.te?.toLowerCase().includes(query.toLowerCase()) ||
//          p.title.hi?.toLowerCase().includes(query.toLowerCase())) ||
//         p.part.some((subPart) =>
//           (subPart.heading.en?.toLowerCase().includes(query.toLowerCase()) ||
//            subPart.heading.te?.toLowerCase().includes(query.toLowerCase()) ||
//            subPart.heading.hi?.toLowerCase().includes(query.toLowerCase()))
//         )
//       );
//       setFilteredStories(stories.map((s) =>
//         (s.name.en === selectedStory || s.name.te === selectedStory || s.name.hi === selectedStory)
//           ? { ...s, parts: { card: filteredParts } }
//           : s
//       ));
//     } else {
//       const filtered = stories.map((s) => ({
//         ...s,
//         parts: {
//           card: s.parts.card.filter((p) =>
//             (p.title.en?.toLowerCase().includes(query.toLowerCase()) ||
//              p.title.te?.toLowerCase().includes(query.toLowerCase()) ||
//              p.title.hi?.toLowerCase().includes(query.toLowerCase())) ||
//             p.part.some((subPart) =>
//               (subPart.heading.en?.toLowerCase().includes(query.toLowerCase()) ||
//                subPart.heading.te?.toLowerCase().includes(query.toLowerCase()) ||
//                subPart.heading.hi?.toLowerCase().includes(query.toLowerCase()))
//             )
//           ),
//         },
//       })).filter((s) =>
//         s.parts.card.length > 0 ||
//         (s.name.en?.toLowerCase().includes(query.toLowerCase()) ||
//          s.name.te?.toLowerCase().includes(query.toLowerCase()) ||
//          s.name.hi?.toLowerCase().includes(query.toLowerCase()))
//       );
//       setFilteredStories(filtered);
//     }
//   };

//   if (!isAuthenticated) {
//     return <Routes><Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} /></Routes>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Navbar stories={filteredStories} onSearch={handleSearch} />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/my-stories" element={<MyStories stories={filteredStories} deleteStory={deleteStory} />} />
//         <Route path="/add-story" element={<StoryForm addStory={addStory} />} />
//         <Route path="/edit-story/:id" element={<EditStoryForm updateStory={updateStory} deleteStory={deleteStory} />} />
//         <Route path="/add-part" element={<PartForm stories={filteredStories} addPart={addPart} updatePart={updatePart} deletePart={deletePart} />} />
//       </Routes>
//       {modal.show && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded shadow-lg">
//             <p className="text-lg font-semibold">{modal.message}</p>
//             <button
//               onClick={() => setModal({ show: false, message: '' })}
//               className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


