import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageModal from "../components/LanguageModal";
import { PlusCircle } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [nextPath, setNextPath] = useState("");

  const handleButtonClick = (path) => {
    setNextPath(path);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {showModal && (
        <LanguageModal
          onSelect={(selected) => {
            setShowModal(false);
            navigate(nextPath, { state: { languages: selected } }); // Pass languages
          }}
          onSkip={() => {
            setShowModal(false);
            navigate(nextPath, { state: { languages: ["en", "te"] } });
          }}
        />
      )}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Bharat Stories</h1>
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleButtonClick("/add-story")}
            className="flex items-center justify-center bg-green-400 text-white px-6 py-3 rounded mx-auto"
          >
            <PlusCircle className="mr-2" /> New Story
          </button>
          <button
            onClick={() => handleButtonClick("/add-part")}
            className="bg-blue-500 text-white px-6 py-3 rounded flex items-center justify-center mx-auto"
          >
            <PlusCircle className="mr-2" /> Add Part for Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
