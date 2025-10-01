import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import axios from "axios";
import Cookies from "js-cookie";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MyStories from "./pages/MyStories";
import ToddlerStories from "./pages/ToddlerStories";
import KidsStories from "./pages/KidsStories";
import StoryForm from "./components/StoryForm";
import EditStoryForm from "./components/EditStoryForm";
import EditKidForm from "./components/EditKidForm";
import EditToddlerForm from "./components/EditToddlerForm";
import PartForm from "./components/PartForm";
import Login from "./pages/Login";
import NotifySubscribers from "./pages/notifySubscribers";
import Agent from "./components/Agent";
import { LoadingProvider, useLoading } from "./contexts/LoadingContext";
import Loader, { PageLoader } from "./components/Loader";
import ErrorBoundary from "./components/ErrorBoundary";
import { useStories } from "./hooks/useStories";

function AppContent() {
  const [modal, setModal] = useState({ show: false, message: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { setLoading, isLoading, getLoadingMessage } = useLoading();

  // Use Redux hook for stories management
  const {
    stories,
    filteredStories,
    loading: storiesLoading,
    error: storiesError,
    smartFetchStories,
    addStory: addStoryAction,
    updateStory: updateStoryAction,
    deleteStory: deleteStoryAction,
    searchStories,
    clearStories: clearStoriesAction,
  } = useStories();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsAuthenticated(true);
      smartFetchStories(); // Use smart fetch instead of always fetching
    } else {
      navigate("/login");
    }
  }, [navigate, smartFetchStories]);

  const addStory = async (data) => {
    try {
      setLoading("addStory", true, "Adding story...");
      const result = await addStoryAction(data);
      if (result.type.endsWith("/fulfilled")) {
        setModal({ show: true, message: "Story added successfully!" });
        setTimeout(() => setModal({ show: false, message: "" }), 2000);
        navigate("/my-stories");
      } else {
        setModal({ show: true, message: "Failed to add story" });
      }
    } catch (err) {
      console.error("Add story error:", err);
      setModal({ show: true, message: "Failed to add story" });
    } finally {
      setLoading("addStory", false);
    }
  };

  const updateStory = async (id, data) => {
    try {
      setLoading("updateStory", true, "Updating story...");
      const result = await updateStoryAction(id, data);
      if (result.type.endsWith("/fulfilled")) {
        setModal({ show: true, message: "Story updated successfully!" });
        setTimeout(() => setModal({ show: false, message: "" }), 2000);
        navigate("/my-stories");
      } else {
        setModal({ show: true, message: "Failed to update story" });
      }
    } catch (err) {
      console.error("Update story error:", err);
      setModal({ show: true, message: "Failed to update story" });
    } finally {
      setLoading("updateStory", false);
    }
  };

  const deleteStory = async (id) => {
    try {
      setLoading("deleteStory", true, "Deleting story...");
      const result = await deleteStoryAction(id);
      if (result.type.endsWith("/fulfilled")) {
        setModal({ show: true, message: "Story deleted successfully!" });
        setTimeout(() => setModal({ show: false, message: "" }), 2000);
      } else {
        setModal({ show: true, message: "Failed to delete story" });
      }
    } catch (err) {
      console.error("Delete story error:", err);
      setModal({ show: true, message: "Failed to delete story" });
    } finally {
      setLoading("deleteStory", false);
    }
  };

  const addPart = async (data, options = {}) => {
    const { skipUIUpdates = false } = options;
    
    console.log("Sending data for addPart:", data);
    if (!skipUIUpdates) {
      setModal({ show: true, message: "Failed to add part" });
    }

    try {
      if (!skipUIUpdates) {
        setLoading("addPart", true, "Adding part...");
      }
      const token = Cookies.get("token");
      // TODO:
      let response;
      // if (data && data.__agePayload) {
      //   const { storyId, group, card } = data;
      //   response = await axios.post(
      //     `${import.meta.env.VITE_API_URL}/stories/${storyId}/age-content`,
      //     { group, card },
      //     { headers: { Authorization: `Bearer ${token}` } }
      //   );
      // }
      if (data && data.__agePayload) {
        const { storyId, group, card } = data;

        const formData = new FormData();
        formData.append("group", group);
        formData.append("card", JSON.stringify(card));

        // ✅ append files if they exist
        if (card.thumbnailImage instanceof File) {
          formData.append("thumbnailImage", card.thumbnailImage);
        }
        if (card.coverImage instanceof File) {
          formData.append("coverImage", card.coverImage);
        }

        console.log("addPart: Sending as FormData", [...formData.entries()]);

        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/stories/${storyId}/age-content`,
          formData, // ✅ actually send FormData
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        console.log("addPart: Sending as multipart/form-data", data);
        
        // Use separate endpoints for different age groups
        const contentType = data.get('contentType');
        let endpoint = `${import.meta.env.VITE_API_URL}/parts`; // Default for Adult
        
        if (contentType === 'child') {
          endpoint = `${import.meta.env.VITE_API_URL}/child-parts`;
        } else if (contentType === 'teen') {
          endpoint = `${import.meta.env.VITE_API_URL}/teen-parts`;
        }
        
        console.log('Making request to:', endpoint);
        console.log('Request data contentType:', contentType);
        
        response = await axios.post(
          endpoint,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Check if response is successful (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        // Refresh stories to get updated data
        if (!skipUIUpdates) {
          smartFetchStories();
          setModal({
            show: true,
            message: response.data.message || "Content added successfully!",
          });
          setTimeout(() => setModal({ show: false, message: "" }), 2000);
          navigate("/my-stories");
        } else {
          // For sequential submissions, just refresh stories without UI updates
          smartFetchStories();
        }
        return response; // Return response for sequential processing
      } else {
        if (!skipUIUpdates) {
          setModal({ show: true, message: "Failed to add part" });
        }
        throw new Error("Failed to add part"); // Throw error for sequential processing
      }
    } catch (err) {
      console.error("Add part error:", err.response?.data || err.message);
      if (!skipUIUpdates) {
        setModal({ show: true, message: "Failed to add part" });
      }
      throw err; // Re-throw error for sequential processing in Preview.jsx
    } finally {
      if (!skipUIUpdates) {
        setLoading("addPart", false);
      }
    }
  };

  // src/App.jsx (only showing relevant changes)
  const updatePart = async (storyName, partId, updatedPart) => {
    const formData =
      updatedPart instanceof FormData ? updatedPart : new FormData();
    if (!(updatedPart instanceof FormData)) {
      const story = stories.find((s) => s.name.en === storyName);
      formData.append("storyId", story.id);
      formData.append("partId", partId);
      Object.entries(updatedPart).forEach(([key, value]) => {
        if (key === "thumbnailImage" && value) {
          formData.append("thumbnailImage", value);
        } else if (key === "part" && Array.isArray(value)) {
          value.forEach((p, i) => {
            Object.entries(p).forEach(([subKey, subValue]) => {
              if (subKey === "image" && subValue) {
                formData.append(`partImage${i}`, subValue);
              } else if (typeof subValue === "object") {
                Object.entries(subValue).forEach(([lang, langValue]) => {
                  if (langValue)
                    formData.append(
                      `${subKey}${
                        lang.charAt(0).toUpperCase() + lang.slice(1)
                      }${i}`,
                      langValue
                    );
                });
              }
            });
          });
        } else if (typeof value === "object") {
          Object.entries(value).forEach(([lang, langValue]) => {
            if (langValue)
              formData.append(
                `${key}${lang.charAt(0).toUpperCase() + lang.slice(1)}`,
                langValue
              );
          });
        }
      });
    }

    console.log("Sending formData for updatePart:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      setLoading("updatePart", true, "Updating part...");
      const token = Cookies.get("token");
      
      // Use separate endpoints for different age groups
      const contentType = formData.get('contentType');
      let endpoint = `${import.meta.env.VITE_API_URL}/parts`; // Default for Adult
      
      if (contentType === 'child') {
        endpoint = `${import.meta.env.VITE_API_URL}/child-parts`;
      } else if (contentType === 'teen') {
        endpoint = `${import.meta.env.VITE_API_URL}/teen-parts`;
      }
      
      const response = await axios.post(
        endpoint,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if response is successful (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        // Refresh stories to get updated data
        smartFetchStories();
        setModal({
          show: true,
          message: response.data.message || "Part updated successfully!",
        });
        setTimeout(() => setModal({ show: false, message: "" }), 1500);
      } else {
        setModal({ show: true, message: "Failed to update part" });
      }
    } catch (error) {
      console.error(
        "Error updating part:",
        error.response?.data || error.message
      );
      setModal({
        show: true,
        message: `Failed to update part: ${
          error.response?.data?.error ||
          error.response?.data?.details ||
          error.message
        }`,
      });
    } finally {
      setLoading("updatePart", false);
    }
  };

  const deletePart = async (storyId, partId, contentType = 'adult') => {
    try {
      setLoading("deletePart", true, "Deleting part...");
      const token = Cookies.get("token");
      
      // Use separate endpoints for different age groups
      let endpoint = `${import.meta.env.VITE_API_URL}/parts/${storyId}/${partId}`; // Default for Adult
      
      if (contentType === 'child') {
        endpoint = `${import.meta.env.VITE_API_URL}/child-parts/${storyId}/${partId}`;
      } else if (contentType === 'teen') {
        endpoint = `${import.meta.env.VITE_API_URL}/teen-parts/${storyId}/${partId}`;
      }
      
      await axios.delete(
        endpoint,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedStories = stories.map((s) =>
        s.id === storyId
          ? {
              ...s,
              parts: { card: s.parts.card.filter((p) => p.id !== partId) },
            }
          : s
      );
      setStories(updatedStories);
      setFilteredStories(updatedStories);
      setModal({ show: true, message: "Part deleted successfully!" });
      setTimeout(() => setModal({ show: false, message: "" }), 2000);
    } catch (err) {
      console.error("Delete part error:", err.response?.data || err.message);
      setModal({ show: true, message: "Failed to delete part" });
    } finally {
      setLoading("deletePart", false);
    }
  };

  const deleteAgeContent = async (storyId, cardId, group) => {
    try {
      setLoading("deleteAgeContent", true, `Deleting ${group} content...`);
      const token = Cookies.get("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/stories/${storyId}/age-content/${cardId}?group=${group}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh stories to get updated data
      smartFetchStories();
      setModal({ show: true, message: `${group} content deleted successfully!` });
      setTimeout(() => setModal({ show: false, message: "" }), 2000);
    } catch (err) {
      console.error("Delete age content error:", err.response?.data || err.message);
      setModal({ show: true, message: `Failed to delete ${group} content` });
    } finally {
      setLoading("deleteAgeContent", false);
    }
  };

  const updateAgeContent = async (storyId, cardId, group, data) => {
    try {
      setLoading("updateAgeContent", true, `Updating ${group} content...`);
      const token = Cookies.get("token");
      
      const formData = new FormData();
      formData.append("group", group);
      formData.append("card", JSON.stringify(data.card));

      // Append files if they exist
      if (data.card.thumbnailImage instanceof File) {
        formData.append("thumbnailImage", data.card.thumbnailImage);
      }
      if (data.card.coverImage instanceof File) {
        formData.append("coverImage", data.card.coverImage);
      }

      // Append part content images
      if (data.card.partContent) {
        data.card.partContent.forEach((part, index) => {
          if (part.imageUrl instanceof File) {
            formData.append(`partImage${index}`, part.imageUrl);
          }
        });
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/stories/${storyId}/age-content/${cardId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        // Refresh stories to get updated data
        smartFetchStories();
        setModal({ show: true, message: `${group} content updated successfully!` });
        setTimeout(() => setModal({ show: false, message: "" }), 2000);
        navigate("/my-stories");
      } else {
        setModal({ show: true, message: `Failed to update ${group} content` });
      }
    } catch (err) {
      console.error("Update age content error:", err.response?.data || err.message);
      setModal({ show: true, message: `Failed to update ${group} content` });
    } finally {
      setLoading("updateAgeContent", false);
    }
  };

  const handleSearch = (selectedStory, query) => {
    searchStories(selectedStory, query);
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar stories={filteredStories} onSearch={handleSearch} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/my-stories"
          element={
            <MyStories stories={filteredStories} deleteStory={deleteStory} />
          }
        />
        <Route
          path="/stories/toddler"
          element={
            <ErrorBoundary>
              <ToddlerStories stories={filteredStories} deleteAgeContent={deleteAgeContent} />
            </ErrorBoundary>
          }
        />
        <Route
          path="/stories/kids"
          element={
            <ErrorBoundary>
              <KidsStories stories={filteredStories} deleteAgeContent={deleteAgeContent} />
            </ErrorBoundary>
          }
        />
        <Route path="/add-story" element={<StoryForm addStory={addStory} />} />
        <Route
          path="/edit-story/:id"
          element={
            <EditStoryForm
              updateStory={updateStory}
              deleteStory={deleteStory}
            />
          }
        />
        <Route
          path="/edit-kid/:storyId/:cardId"
          element={
            <EditKidForm
              updateAgeContent={updateAgeContent}
              deleteAgeContent={deleteAgeContent}
            />
          }
        />
        <Route
          path="/edit-toddler/:storyId/:cardId"
          element={
            <EditToddlerForm
              updateAgeContent={updateAgeContent}
              deleteAgeContent={deleteAgeContent}
            />
          }
        />
        <Route
          path="/add-part"
          element={
            <PartForm
              stories={filteredStories}
              addPart={addPart}
              updatePart={updatePart}
              deletePart={deletePart}
            />
          }
        />
        <Route path="/notify-subscribers" element={<NotifySubscribers />} />
        <Route
          path="/ai"
          element={
            <Agent
              stories={filteredStories}
              addStory={addStory}
              addPart={addPart}
            />
          }
        />
      </Routes>
      {modal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg font-semibold">{modal.message}</p>
            <button
              onClick={() => setModal({ show: false, message: "" })}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {/* Global Loading Overlay */}
      {(storiesLoading ||
        isLoading("addStory") ||
        isLoading("updateStory") ||
        isLoading("deleteStory") ||
        isLoading("addPart") ||
        isLoading("updatePart") ||
        isLoading("deletePart") ||
        isLoading("deleteAgeContent") ||
        isLoading("updateAgeContent")) && (
        <Loader
          overlay={true}
          text={
            storiesLoading
              ? "Loading stories..."
              : getLoadingMessage("addStory") ||
                getLoadingMessage("updateStory") ||
                getLoadingMessage("deleteStory") ||
                getLoadingMessage("addPart") ||
                getLoadingMessage("updatePart") ||
                getLoadingMessage("deletePart") ||
                getLoadingMessage("deleteAgeContent") ||
                getLoadingMessage("updateAgeContent")
          }
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </Provider>
  );
}

export default App;
