import React from 'react';

const StoriesList = ({ eachPart, eachStory, onEdit }) => {
  const language = 'en';

  return (
    <div className="min-w-[200px] bg-white shadow rounded p-4">
      <h3 className="font-semibold">{eachPart.title[language]}</h3>
      <p className="text-sm text-gray-600">{eachPart.description[language]}</p>
      <button
        onClick={onEdit}
        className="mt-2 text-blue-500 hover:text-blue-700 underline"
      >
        Edit
      </button>
    </div>
  );
};

export default StoriesList;