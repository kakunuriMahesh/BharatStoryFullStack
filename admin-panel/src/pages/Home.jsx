import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-6 mt-6 text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to Bharat Story</h1>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate('/add-story')}
          className="bg-green-500 bg-opacity-85 hover:bg-green-600 text-white px-6 py-3 rounded"
        >
          New Story +
        </button>
        <button
          onClick={() => navigate('/add-part')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
        >
          Add New Part
        </button>
      </div>
    </div>
  );
};

export default Home;