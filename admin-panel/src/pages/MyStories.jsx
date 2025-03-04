import React from 'react';
import { useNavigate } from 'react-router-dom';
import StoriesList from '../components/StoriesList';

const MyStories = ({ stories }) => {
  const navigate = useNavigate();
  const language = 'en';

  const handleViewAll = (storyName) => {
    navigate(`/add-part?story=${storyName}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-6">
      <h1 className="text-3xl font-bold mb-6">My Stories</h1>
      {stories.length === 0 ? (
        <p className="text-gray-500">No stories added yet.</p>
      ) : (
        stories.map((eachStory) => (
          <div key={eachStory.id}>
            <div className="flex justify-between mt-[10px]">
              <h2 className="text-[20px] font-bold">{eachStory.name[language]}</h2>
              <button
                onClick={() => handleViewAll(eachStory.name.en)}
                className="underline cursor-pointer text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
            <div className="mt-[10px] overflow-x-scroll flex gap-2 scrollbar-hide">
              {eachStory.parts.card.map((eachPart) => (
                <StoriesList
                  key={eachPart.id}
                  eachPart={eachPart}
                  eachStory={eachStory.name[language]}
                  onEdit={() => navigate(`/add-part?story=${eachStory.name.en}&partId=${eachPart.id}`)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyStories;