import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";

const ToddlerStories = ({ stories = [], deleteAgeContent }) => {
  const navigate = useNavigate();
  const [openStoryId, setOpenStoryId] = useState(null);

  const toddlerStories = stories.filter((s) => s && s.toddler && s.toddler.card && Array.isArray(s.toddler.card) && s.toddler.card.length > 0);

  const handleEditToddler = (storyId, toddlerId) => {
    navigate(`/edit-toddler/${storyId}/${toddlerId}`);
  };

  const handleDeleteToddler = async (storyId, toddlerId) => {
    if (window.confirm("Are you sure you want to delete this toddler story?")) {
      try {
        await deleteAgeContent(storyId, toddlerId, 'toddler');
      } catch (error) {
        console.error('Error deleting toddler story:', error);
        alert('Failed to delete toddler story');
      }
    }
  };

  if (!toddlerStories || toddlerStories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>
        <div className="bg-white rounded shadow p-10">
          <p className="text-gray-600">No data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Toddler Stories</h1>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} /> Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toddlerStories.map((story) => {
          if (!story || !story.id) return null;
          
          return (
            <div key={story.id} className="bg-white rounded shadow p-4">
              {/* Story Title */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenStoryId(openStoryId === story.id ? null : story.id)
                }
              >
                <h2 className="text-lg font-semibold">
                  {story.name?.en || story.name?.te || story.name?.hi || "Untitled"}
                </h2>
                {openStoryId === story.id ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Languages: {Array.isArray(story.languages) ? story.languages.join(", ") : "-"}
              </p>

              {/* Dropdown Toddler Cards */}
              {openStoryId === story.id && (
                <div className="mt-3 border-t pt-3 space-y-2">
                  {story.toddler?.card?.map((toddler) => {
                    if (!toddler || !toddler.id) return null;
                    
                    return (
                      <div
                        key={toddler.id}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm font-medium">
                          {toddler.title?.en || toddler.title?.te || toddler.title?.hi || "Untitled Card"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditToddler(story.id, toddler.id)}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteToddler(story.id, toddler.id)}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(!story.toddler?.card || !Array.isArray(story.toddler.card) || story.toddler.card.length === 0) && (
                    <p className="text-sm text-gray-400">No cards available</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToddlerStories;