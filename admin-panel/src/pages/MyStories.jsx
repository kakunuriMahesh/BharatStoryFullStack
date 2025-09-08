import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit2, Trash2, Eye } from "lucide-react";

const MyStories = ({ stories, deleteStory }) => {
  const navigate = useNavigate();
  const [expandedStory, setExpandedStory] = useState(null);

  const handleDeleteStory = (id) => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      deleteStory(id);
    }
  };

  const toggleParts = (storyId) => {
    setExpandedStory(expandedStory === storyId ? null : storyId);
  };

  const handleEditPart = (storyName, partId) => {
    navigate(
      `/add-part?story=${encodeURIComponent(storyName)}&partId=${partId}`
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-6">My Stories</h1>
        <Link
          to="/notify-subscribers"
          className="text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded flex items-center gap-2"
        >
          Notify-Subscribers
        </Link>
      </div>
      {stories.length === 0 ? (
        <p className="text-gray-500">No stories available.</p>
      ) : (
        <div className="space-y-6">
          {stories.map((story) => (
            <div key={story.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {story.name.en ||
                      story.name.te ||
                      story.name.hi ||
                      "Untitled"}
                  </h2>
                  <p className="text-gray-600">
                    Languages: {story.languages.join(", ") || "None"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/edit-story/${story.id}`)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded flex items-center gap-2"
                  >
                    <Edit2 size={20} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStory(story.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center gap-2"
                  >
                    <Trash2 size={20} /> Delete
                  </button>
                  <button
                    onClick={() => toggleParts(story.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded flex items-center gap-2"
                  >
                    <Eye size={20} />{" "}
                    {expandedStory === story.id
                      ? "Hide Parts"
                      : "View All Parts"}
                  </button>
                </div>
              </div>
              {expandedStory === story.id && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Parts</h3>
                  {story.parts.card.length === 0 ? (
                    <p className="text-gray-500">No parts available.</p>
                  ) : (
                    <ul className="space-y-2 mt-2">
                      {story.parts.card.map((part) => (
                        <li
                          key={part.id}
                          className="flex justify-between items-center bg-gray-100 p-2 rounded"
                        >
                          <span>
                            {part.title.en ||
                              part.title.te ||
                              part.title.hi ||
                              "Untitled Part"}
                          </span>
                          <button
                            onClick={() =>
                              handleEditPart(story.name.en, part.id)
                            }
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded flex items-center gap-2"
                          >
                            <Edit2 size={16} /> Edit
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStories;

// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const MyStories = ({ stories, deleteStory }) => {
//   const navigate = useNavigate();

//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure? All parts will be deleted.')) {
//       deleteStory(id);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">My Stories</h1>
//       {stories.map((story) => (
//         <div key={story.id} className="border p-4 mb-4 rounded flex justify-between items-center">
//           <div>
//             <h2 className="text-xl">{story.name.en || story.name.te || story.name.hi}</h2>
//             <p>Languages: {story.languages.join(', ')}</p>
//           </div>
//           <div>
//             <button
//               onClick={() => navigate(`/edit-story/${story.id}`)}
//               className="bg-blue-500 text-white px-4 py-2 mr-2 rounded"
//             >
//               Edit
//             </button>
//             <button
//               onClick={() => handleDelete(story.id)}
//               className="bg-red-500 text-white px-4 py-2 rounded"
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default MyStories;
