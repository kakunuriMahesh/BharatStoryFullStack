import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";

const KidsStories = ({ stories = [], deleteAgeContent }) => {
  const navigate = useNavigate();
  const [openStoryId, setOpenStoryId] = useState(null);

  // Filter stories that have kids.card
  const kidsStories = stories.filter((s) => s && s.kids && s.kids.card && Array.isArray(s.kids.card) && s.kids.card.length > 0);
  console.log("Kids Stories:", stories, kidsStories);

  const handleEditKid = (storyId, kidId) => {
    navigate(`/edit-kid/${storyId}/${kidId}`);
  };

  const handleDeleteKid = async (storyId, kidId) => {
    if (window.confirm("Are you sure you want to delete this kids story?")) {
      try {
        await deleteAgeContent(storyId, kidId, 'kids');
      } catch (error) {
        console.error('Error deleting kids story:', error);
        alert('Failed to delete kids story');
      }
    }
  };

  if (!kidsStories || kidsStories.length === 0) {
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
        <h1 className="text-2xl font-bold">Kids Stories</h1>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} /> Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kidsStories.map((story) => {
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

              {/* Dropdown Kids Cards */}
              {openStoryId === story.id && (
                <div className="mt-3 border-t pt-3 space-y-2">
                  {story.kids?.card?.map((kid) => {
                    if (!kid || !kid.id) return null;
                    
                    return (
                      <div
                        key={kid.id}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm font-medium">
                          {kid.title?.en || kid.title?.te || kid.title?.hi || "Untitled Card"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditKid(story.id, kid.id)}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteKid(story.id, kid.id)}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(!story.kids?.card || !Array.isArray(story.kids.card) || story.kids.card.length === 0) && (
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

export default KidsStories;

