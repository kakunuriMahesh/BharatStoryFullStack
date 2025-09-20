import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const ToddlerStories = ({ stories = [] }) => {
  const navigate = useNavigate();
  const [openStoryId, setOpenStoryId] = useState(null);

  const toddlerStories = stories.filter((s) => s.toddler?.card?.length > 0);

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
        {toddlerStories.map((story) => (
          <div key={story.id} className="bg-white rounded shadow p-4">
            {/* Story Title */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() =>
                setOpenStoryId(openStoryId === story.id ? null : story.id)
              }
            >
              <h2 className="text-lg font-semibold">
                {story.name?.en || "Untitled"}
              </h2>
              {openStoryId === story.id ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            <p className="text-sm text-gray-500">
              Languages: {story.languages?.join(", ") || "-"}
            </p>

            {/* Dropdown Parts */}
            {openStoryId === story.id && (
              <div className="mt-3 border-t pt-3 space-y-2">
                {story.parts?.card?.map((part) => (
                  <div
                    key={part.id}
                    className="flex justify-between items-center bg-gray-50 p-2 rounded"
                  >
                    <span className="text-sm font-medium">
                      {part.title?.en || part.title?.te || "Untitled Part"}
                    </span>
                    <button
                      onClick={() => navigate(`/edit-part/${part.id}`)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                ))}
                {(!story.parts?.card || story.parts?.card.length === 0) && (
                  <p className="text-sm text-gray-400">No parts available</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToddlerStories;