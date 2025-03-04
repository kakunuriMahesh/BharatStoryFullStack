// import React, { useState } from 'react';
// import { Routes, Route, useNavigate } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Home from './pages/Home';
// import MyStories from './pages/MyStories';
// import StoryForm from './components/StoryForm';
// import PartForm from './components/PartForm';

// function App() {
//   const [stories, setStories] = useState([]);
//   const [modal, setModal] = useState({ show: false, message: '' });
//   const navigate = useNavigate();

//   const addStory = (newStory) => {
//     setStories((prev) => [...prev, newStory]);
//     setModal({ show: true, message: 'Story added successfully!' });
//     setTimeout(() => {
//       setModal({ show: false, message: '' });
//       navigate('/add-part');
//     }, 1500);
//   };

//   const addPart = (storyName, newPart) => {
//     setStories((prev) =>
//       prev.map((story) =>
//         story.name.en === storyName
//           ? { ...story, parts: { card: [...story.parts.card, newPart] } }
//           : story
//       )
//     );
//     setModal({ show: true, message: 'Part added successfully!' });
//     setTimeout(() => setModal({ show: false, message: '' }), 1500);
//   };

//   const updatePart = (storyName, partId, updatedPart) => {
//     setStories((prev) =>
//       prev.map((story) =>
//         story.name.en === storyName
//           ? {
//               ...story,
//               parts: {
//                 card: story.parts.card.map((part) =>
//                   part.id === partId ? updatedPart : part
//                 ),
//               },
//             }
//           : story
//       )
//     );
//     setModal({ show: true, message: 'Part updated successfully!' });
//     setTimeout(() => setModal({ show: false, message: '' }), 1500);
//   };

//   const deletePart = (storyName, partId) => {
//     setStories((prev) =>
//       prev.map((story) =>
//         story.name.en === storyName
//           ? {
//               ...story,
//               parts: { card: story.parts.card.filter((part) => part.id !== partId) },
//             }
//           : story
//       )
//     );
//     setModal({ show: true, message: 'Part deleted successfully!' });
//     setTimeout(() => setModal({ show: false, message: '' }), 1500);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Navbar stories={stories} />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/my-stories" element={<MyStories stories={stories} />} />
//         <Route path="/add-story" element={<StoryForm addStory={addStory} />} />
//         <Route
//           path="/add-part"
//           element={<PartForm stories={stories} addPart={addPart} updatePart={updatePart} deletePart={deletePart} />}
//         />
//       </Routes>
//       {modal.show && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded shadow-lg">
//             <p className="text-lg font-semibold">{modal.message}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;



import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MyStories from './pages/MyStories';
import StoryForm from './components/StoryForm';
import PartForm from './components/PartForm';

function App() {
  const [stories, setStories] = useState([]);
  const [modal, setModal] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      const response = await axios.get('http://localhost:3000/api/stories');
      setStories(response.data);
    };
    fetchStories();
  }, []);

  const addStory = async (newStory) => {
    const formData = new FormData();
    formData.append('nameEn', newStory.name.en);
    formData.append('nameTe', newStory.name.te);
    if (newStory.storyCoverImage) formData.append('storyCoverImage', newStory.storyCoverImage);
    if (newStory.bannerImge) formData.append('bannerImge', newStory.bannerImge);

    const response = await axios.post('http://localhost:3000/api/stories', formData);
    setStories((prev) => [...prev, response.data.story]);
    setModal({ show: true, message: 'Story added successfully!' });
    setTimeout(() => {
      setModal({ show: false, message: '' });
      navigate('/add-part');
    }, 1500);
  };

  const addPart = async (storyName, newPart) => {
    const formData = new FormData();
    const story = stories.find((s) => s.name.en === storyName);
    formData.append('storyId', story.id);
    Object.entries(newPart).forEach(([key, value]) => {
      if (key !== 'part' && key !== 'thumbnailImage' && key !== 'coverImage') {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => formData.append(`${key}${subKey.charAt(0).toUpperCase() + subKey.slice(1)}`, subValue));
        } else {
          formData.append(key, value);
        }
      }
    });
    if (newPart.thumbnailImage) formData.append('thumbnailImage', newPart.thumbnailImage);
    if (newPart.coverImage) formData.append('coverImage', newPart.coverImage);
    newPart.part.forEach((p, i) => {
      Object.entries(p).forEach(([key, value]) => {
        if (key !== 'image') {
          if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => formData.append(`${key}${subKey.charAt(0).toUpperCase() + subKey.slice(1)}${i}`, subValue));
          } else {
            formData.append(`${key}${i}`, value);
          }
        }
      });
      if (p.image) formData.append(`partImage${i}`, p.image);
    });
  
    console.log('Sending formData for addPart:');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  
    const response = await axios.post('http://localhost:3000/api/parts', formData);
    setStories((prev) =>
      prev.map((s) =>
        s.id === story.id ? { ...s, parts: { card: [...s.parts.card, response.data.part] } } : s
      )
    );
    setModal({ show: true, message: 'Part added successfully!' });
    setTimeout(() => setModal({ show: false, message: '' }), 1500);
  };
  
  const updatePart = async (storyName, partId, updatedPart) => {
    const formData = new FormData();
    const story = stories.find((s) => s.name.en === storyName);
    formData.append('storyId', story.id);
    formData.append('partId', partId);
    Object.entries(updatedPart).forEach(([key, value]) => {
      if (key !== 'part' && key !== 'thumbnailImage' && key !== 'coverImage') {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => formData.append(`${key}${subKey.charAt(0).toUpperCase() + subKey.slice(1)}`, subValue));
        } else {
          formData.append(key, value);
        }
      }
    });
    if (updatedPart.thumbnailImage) formData.append('thumbnailImage', updatedPart.thumbnailImage);
    if (updatedPart.coverImage) formData.append('coverImage', updatedPart.coverImage);
    updatedPart.part.forEach((p, i) => {
      Object.entries(p).forEach(([key, value]) => {
        if (key !== 'image') {
          if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => formData.append(`${key}${subKey.charAt(0).toUpperCase() + subKey.slice(1)}${i}`, subValue));
          } else {
            formData.append(`${key}${i}`, value);
          }
        }
      });
      if (p.image) formData.append(`partImage${i}`, p.image);
    });
  
    console.log('Sending formData for updatePart:');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  
    const response = await axios.post('http://localhost:3000/api/parts', formData);
    setStories((prev) =>
      prev.map((s) =>
        s.id === story.id
          ? {
              ...s,
              parts: { card: s.parts.card.map((p) => (p.id === partId ? response.data.part : p)) },
            }
          : s
      )
    );
    setModal({ show: true, message: 'Part updated successfully!' });
    setTimeout(() => setModal({ show: false, message: '' }), 1500);
  };

  const deletePart = async (storyName, partId) => {
    const story = stories.find((s) => s.name.en === storyName);
    await axios.delete(`http://localhost:3000/api/parts/${story.id}/${partId}`);
    setStories((prev) =>
      prev.map((s) =>
        s.id === story.id
          ? { ...s, parts: { card: s.parts.card.filter((p) => p.id !== partId) } }
          : s
      )
    );
    setModal({ show: true, message: 'Part deleted successfully!' });
    setTimeout(() => setModal({ show: false, message: '' }), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar stories={stories} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-stories" element={<MyStories stories={stories} />} />
        <Route path="/add-story" element={<StoryForm addStory={addStory} />} />
        <Route
          path="/add-part"
          element={<PartForm stories={stories} addPart={addPart} updatePart={updatePart} deletePart={deletePart} />}
        />
      </Routes>
      {modal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg font-semibold">{modal.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
