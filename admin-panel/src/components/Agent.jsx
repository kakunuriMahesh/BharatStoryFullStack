import React, { useState, useEffect } from "react";
import axios from "axios";
import SRCImage from "../assets/SRC.jpg";
import Preview from "./Preview";
import StoryForm from './StoryForm';
import Modal from "./Modal";
import { useForm } from "react-hook-form";
import { Languages, Calendar, Clock, Type, Image as ImageIcon, X } from "lucide-react";

const Agent = ({addStory, stories }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [formData, setFormData] = useState({
    storyContent: "",
    targetAgeGroup: "", // values: '3-5' | '6-8' | '9-12' | '13-18' | '18+'
    outputFormat: {
      includeImageSuggestions: false,
      includeHeadings: false,
      includeQuotes: false,
      splitSections: false,
      oneLineText: false,
    },
    title: { en: "", te: "", hi: "" },
    date: { en: "", te: "", hi: "" },
    description: { en: "", te: "", hi: "" },
    timeToRead: { en: "", te: "", hi: "" },
    storyType: { en: "", te: "", hi: "" },
  });
  const [selectedStory, setSelectedStory] = useState("");
  const [partLanguages, setPartLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showDraftConfirm, setShowDraftConfirm] = useState(false);
  const [pendingDraftData, setPendingDraftData] = useState(null);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailError, setThumbnailError] = useState("");

  // Load drafts on component mount and cleanup old ones
  useEffect(() => {
    loadDrafts();
    cleanupOldDrafts();
  }, []);

  // Load drafts from localStorage
  const loadDrafts = () => {
    try {
      const savedDrafts = localStorage.getItem("storyDrafts");
      if (savedDrafts) {
        const parsedDrafts = JSON.parse(savedDrafts);
        setDrafts(parsedDrafts);
      }
    } catch (error) {
      console.error("Error loading drafts:", error);
    }
  };

  // Save current sections as draft
  const saveDraft = (formData, sectionsData) => {
    if (sectionsData.length === 0) return;

    const newDraft = {
      id: Date.now(),
      title:
        formData.storyContent.substring(0, 50) +
        (formData.storyContent.length > 50 ? "..." : ""),
      formData: formData,
      sections: sectionsData,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    const updatedDrafts = [newDraft, ...drafts.slice(0, 9)]; // Keep only 10 most recent drafts
    setDrafts(updatedDrafts);

    try {
      localStorage.setItem("storyDrafts", JSON.stringify(updatedDrafts));
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  // Handle draft confirmation
  const handleDraftConfirm = (shouldSave) => {
    if (shouldSave && pendingDraftData) {
      saveDraft(pendingDraftData.formData, pendingDraftData.sections);
    }

    // Clear pending data and close confirmation
    setPendingDraftData(null);
    setShowDraftConfirm(false);

    // Continue with AI agent call
    proceedWithAIAgent();
  };

  // Proceed with AI agent call after draft handling
  const proceedWithAIAgent = async (data) => {
    setLoading(true);
    setError("");
    setSections([]);
    const payload = {
      ...formData,
      storyContent: data.storyContent || formData.storyContent,
      targetAgeGroup: data.targetAgeGroup || formData.targetAgeGroup,
      title: {
        en: data.titleEn || "",
        te: data.titleTe || "",
        hi: data.titleHi || "",
      },
      date: {
        en: data.dateEn || "",
        te: data.dateTe || "",
        hi: data.dateHi || "",
      },
      description: {
        en: data.descriptionEn || "",
        te: data.descriptionTe || "",
        hi: data.descriptionHi || "",
      },
      timeToRead: {
        en: data.timeToReadEn || "",
        te: data.timeToReadTe || "",
        hi: data.timeToReadHi || "",
      },
      storyType: {
        en: data.storyTypeEn || "",
        te: data.storyTypeTe || "",
        hi: data.storyTypeHi || "",
      },
      thumbnailImage: thumbnailImage ? URL.createObjectURL(thumbnailImage) : thumbnailPreview || "",
      partLanguages: partLanguages,
    };
    try {
      const response = await axios.post(
        "http://localhost:5678/webhook-test/84106ff3-afc7-4746-a04b-e3d380e637b7",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("response webhook", response);
      console.log("response.data type:", typeof response.data);
      console.log("response.data:", response.data);

      // Handle the response structure from n8n
      if (response.data) {
        let extractedSections = [];

        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          extractedSections = response.data
            .map((item, index) => {
              if (
                item.data &&
                Array.isArray(item.data) &&
                item.data.length > 0
              ) {
                const section = item.data[0];
                return {
                  sectionNumber: section.sectionNumber,
                  heading: section.heading || { en: "", te: "", hi: "" },
                  quote: section.quote || { en: "", te: "", hi: "" },
                  sectionText: section.sectionText || { en: "", te: "", hi: "" },
                  oneLineText: section.oneLineText || { en: "", te: "", hi: "" },
                  targetAgeGroup:
                    section.targetAgeGroup || formData.targetAgeGroup || "",
                  image_gen:
                    section.imageUrl ||
                    section.fileName ||
                    section.image_prompt ||
                    section.prompt ||
                    "",
                };
              }
              return null;
            })
            .filter((section) => section !== null);
        }
        // Check if response.data is an object with data property
        else if (response.data.data && Array.isArray(response.data.data)) {
          extractedSections = response.data.data
            .map((item, index) => {
              if (
                item.data &&
                Array.isArray(item.data) &&
                item.data.length > 0
              ) {
                const section = item.data[0];
                return {
                  sectionNumber: section.sectionNumber,
                  heading: section.heading || { en: "", te: "", hi: "" },
                  quote: section.quote || { en: "", te: "", hi: "" },
                  sectionText: section.sectionText || { en: "", te: "", hi: "" },
                  oneLineText: section.oneLineText || { en: "", te: "", hi: "" },
                  targetAgeGroup:
                    section.targetAgeGroup || formData.targetAgeGroup || "",
                  image_gen:
                    section.imageUrl ||
                    section.fileName ||
                    section.image_prompt ||
                    section.prompt ||
                    "",
                };
              }
              return null;
            })
            .filter((section) => section !== null);
        }

        console.log("Extracted sections:", extractedSections);

        if (extractedSections.length > 0) {
          setSections(extractedSections);
        } else {
          setError("No valid sections found in AI agent response");
        }
      } else {
        setError("Invalid response format from AI agent");
      }
    } catch (err) {
      console.error("Error calling AI agent:", err);
      setError(
        "Failed to connect to AI agent. Please check your n8n webhook URL and try again."
      );

      // For demo purposes, let's show sample data
      setSections([
        {
          sectionNumber: 1,
          heading: { en: "The Beginning of a Legend", te: "", hi: "" },
          quote: { en: "In the realm of ancient wisdom, every story holds a deeper truth.", te: "", hi: "" },
          sectionText: { en: "Once upon a time, in a land where magic and reality intertwined, there lived a young hero whose destiny was written in the stars.", te: "", hi: "" },
          oneLineText: { en: "", te: "", hi: "" },
          image_gen: SRCImage,
        },
        {
          sectionNumber: 2,
          heading: { en: "The Call to Adventure", te: "", hi: "" },
          quote: { en: "Destiny calls to those who are ready to answer.", te: "", hi: "" },
          sectionText: { en: "As the seasons changed and the winds whispered ancient secrets, the young hero felt an inexplicable pull toward the unknown.", te: "", hi: "" },
          oneLineText: { en: "", te: "", hi: "" },
          image_gen: SRCImage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load a draft
  const loadDraft = (draft) => {
    setFormData(draft.formData);
    setSections(draft.sections);
    setShowDrafts(false);
    // Set form values for card details
    setValue("titleEn", draft.formData.title.en || "");
    setValue("titleTe", draft.formData.title.te || "");
    setValue("titleHi", draft.formData.title.hi || "");
    setValue("dateEn", draft.formData.date.en || "");
    setValue("dateTe", draft.formData.date.te || "");
    setValue("dateHi", draft.formData.date.hi || "");
    setValue("descriptionEn", draft.formData.description.en || "");
    setValue("descriptionTe", draft.formData.description.te || "");
    setValue("descriptionHi", draft.formData.description.hi || "");
    setValue("timeToReadEn", draft.formData.timeToRead.en || "");
    setValue("timeToReadTe", draft.formData.timeToRead.te || "");
    setValue("timeToReadHi", draft.formData.timeToRead.hi || "");
    setValue("storyTypeEn", draft.formData.storyType.en || "");
    setValue("storyTypeTe", draft.formData.storyType.te || "");
    setValue("storyTypeHi", draft.formData.storyType.hi || "");
    if (draft.formData.thumbnailImage) {
      setThumbnailPreview(draft.formData.thumbnailImage);
    }
  };

  // Delete a draft
  const deleteDraft = (draftId) => {
    const updatedDrafts = drafts.filter((draft) => draft.id !== draftId);
    setDrafts(updatedDrafts);

    try {
      localStorage.setItem("storyDrafts", JSON.stringify(updatedDrafts));
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  };

  // Cleanup drafts older than 2 weeks
  const cleanupOldDrafts = () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const filteredDrafts = drafts.filter((draft) => {
      const draftDate = new Date(draft.createdAt);
      return draftDate > twoWeeksAgo;
    });

    if (filteredDrafts.length !== drafts.length) {
      setDrafts(filteredDrafts);
      try {
        localStorage.setItem("storyDrafts", JSON.stringify(filteredDrafts));
      } catch (error) {
        console.error("Error cleaning up drafts:", error);
      }
    }
  };

  // Open image modal
  const openImageModal = (imageUrl) => {
    if (
      imageUrl &&
      (imageUrl.startsWith("http") || imageUrl.startsWith("data:image"))
    ) {
      setSelectedImage(imageUrl);
      setShowImageModal(true);
    } else {
      console.error("Invalid image URL:", imageUrl);
      setError("Cannot open image: Invalid URL");
    }
  };

  // Close image modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage("");
  };

  // Handle form input changes
  const handleInputChange = (e, field, nestedField = null) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (nestedField) {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nestedField]: value,
        },
      }));
      return;
    }

    // If changing targetAgeGroup, also auto-update outputFormat mapping
    if (field === "targetAgeGroup") {
      const nextOutput = mapOutputFormatByAge(value);
      setFormData((prev) => ({
        ...prev,
        targetAgeGroup: value,
        outputFormat: nextOutput,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle thumbnail image change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailImage(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setThumbnailError("");
    } else {
      setThumbnailError("Thumbnail Image is required");
    }
  };

  // Remove thumbnail image
  const removeThumbnail = () => {
    setThumbnailImage(null);
    setThumbnailPreview(null);
    setThumbnailError("Thumbnail Image is required");
  };

  // Map output format based on target age group
  const mapOutputFormatByAge = (ageGroup) => {
    // Defaults: everything off
    const base = {
      includeImageSuggestions: false,
      includeHeadings: false,
      includeQuotes: false,
      splitSections: false,
      oneLineText: false,
    };
    switch (ageGroup) {
      case "3-5":
        return {
          ...base,
          includeImageSuggestions: true,
          oneLineText: true,
          splitSections: true,
        };
      case "6-8":
        return {
          ...base,
          includeImageSuggestions: true,
          includeHeadings: true,
          splitSections: true,
        };
      case "9-12":
        return {
          ...base,
          includeImageSuggestions: true,
          includeHeadings: true,
          includeQuotes: true,
          splitSections: true,
        };
      case "13-18":
        return {
          ...base,
          includeImageSuggestions: true,
          includeHeadings: true,
          includeQuotes: true,
          splitSections: true,
        };
      case "18+":
        return {
          ...base,
          includeImageSuggestions: true,
          includeHeadings: true,
          includeQuotes: true,
          splitSections: true,
        };
      default:
        return base;
    }
  };

  // Function to call the n8n AI agent
  const triggerAIAgent = async (data) => {
    if (!data.storyContent.trim()) {
      setError("Please enter some story content first.");
      return;
    }
    if (!thumbnailImage && !thumbnailPreview) {
      setThumbnailError("Thumbnail Image is required");
      return;
    }

    // Check if there are existing sections to save as draft
    if (sections.length > 0) {
      setPendingDraftData({
        formData: { ...formData, ...data, thumbnailImage: thumbnailPreview },
        sections: sections,
      });
      setShowDraftConfirm(true);
      return;
    }

    // If no existing sections, proceed directly
    await proceedWithAIAgent(data);
  };

  // Function to update section content
  const updateSection = (index, field, value) => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: typeof value === "object" 
        ? { ...updatedSections[index][field], [selectedLanguage]: value[selectedLanguage] } 
        : { ...updatedSections[index][field], [selectedLanguage]: value },
    };
    setSections(updatedSections);
  };

  // Function to add a new section
  const addNewSection = () => {
    const newSectionNumber = sections.length + 1;
    const newSection = {
      sectionNumber: newSectionNumber,
      heading: { en: "", te: "", hi: "" },
      quote: { en: "", te: "", hi: "" },
      sectionText: { en: "", te: "", hi: "" },
      oneLineText: { en: "", te: "", hi: "" },
      image_gen: "",
    };
    setSections([...sections, newSection]);
  };

  // Function to delete a section
  const deleteSection = (index) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    const renumberedSections = updatedSections.map((section, i) => ({
      ...section,
      sectionNumber: i + 1,
    }));
    setSections(renumberedSections);
  };

  // Function to open preview
  const openPreview = () => {
    setShowPreview(true);
  };

  // Function to close preview
  const closePreview = () => {
    setShowPreview(false);
  };

  // Function to download image
  const downloadImage = async (imageUrl, sectionNumber) => {
    try {
      let blob;
      if (imageUrl.startsWith("data:image")) {
        // Handle data URL
        const response = await fetch(imageUrl);
        blob = await response.blob();
      } else {
        // Handle remote URL with CORS support
        const response = await fetch(imageUrl, { mode: "cors" });
        if (!response.ok) throw new Error("Failed to fetch image");
        blob = await response.blob();
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `section-${sectionNumber}-image.${
        blob.type.split("/")[1] || "jpg"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading image:", err);
      setError("Failed to download image. Please check the image URL.");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Handle story selection
  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedStory(value);

    if (value === "addNewStory") {
      setIsModalOpen(true);
    } else {
      const selected = stories.find((s) => s.name.en === value);
      setPartLanguages(selected?.languages || ["en", "te"]);
      setSelectedLanguage("en");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStory(""); // Reset selection after closing modal
  };

  const handleAddStory = (formData) => {
    addStory(formData);
    handleModalClose();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">AI Story Craft</h1>
          <p className="text-lg text-gray-300">
            Craft your story and let AI bring it to life
          </p>
        </header>

        <form onSubmit={handleSubmit(triggerAIAgent)}>
          <div className="mb-4">
            <label className="block font-semibold">Select Story</label>
            <select
              value={selectedStory}
              onChange={handleSelectChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Name of Story</option>
              <option value="addNewStory">Add new Story +</option>
              {stories.map((story) => (
                <option key={story.id} value={story.name.en}>
                  {story.name.en}
                </option>
              ))}
            </select>
          </div>

          {/* Modal for Story Form */}
          {isModalOpen && (
            <Modal onClose={handleModalClose}>
              <StoryForm addStory={handleAddStory} />
            </Modal>
          )}

          {selectedStory && partLanguages.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mb-4 text-white">Card Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {partLanguages.includes("en") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title (English)</label>
                    <div className="relative">
                      <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("titleEn", { required: "Title (English) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "title", "en")}
                      />
                      {errors.titleEn && (
                        <p className="text-red-400 text-sm mt-1">{errors.titleEn.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Date (English)</label>
                    <div className="relative">
                      <Calendar size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        {...register("dateEn", { required: "Date (English) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "date", "en")}
                      />
                      {errors.dateEn && (
                        <p className="text-red-400 text-sm mt-1">{errors.dateEn.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Description (English)</label>
                    <div className="relative">
                      <Type size={20} className="absolute left-2 top-4 text-gray-400" />
                      <textarea
                        {...register("descriptionEn", { required: "Description (English) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                        onChange={(e) => handleInputChange(e, "description", "en")}
                      />
                      {errors.descriptionEn && (
                        <p className="text-red-400 text-sm mt-1">{errors.descriptionEn.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Time to Read (English)</label>
                    <div className="relative">
                      <Clock size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("timeToReadEn", { required: "Time to Read (English) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "timeToRead", "en")}
                      />
                      {errors.timeToReadEn && (
                        <p className="text-red-400 text-sm mt-1">{errors.timeToReadEn.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Story Type (English)</label>
                    <div className="relative">
                      <Type size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("storyTypeEn", { required: "Story Type (English) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "storyType", "en")}
                      />
                      {errors.storyTypeEn && (
                        <p className="text-red-400 text-sm mt-1">{errors.storyTypeEn.message}</p>
                      )}
                    </div>
                  </div>
                )}
                {partLanguages.includes("te") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title (Telugu)</label>
                    <div className="relative">
                      <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("titleTe", { required: "Title (Telugu) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "title", "te")}
                      />
                      {errors.titleTe && (
                        <p className="text-red-400 text-sm mt-1">{errors.titleTe.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Date (Telugu)</label>
                    <div className="relative">
                      <Calendar size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        {...register("dateTe", { required: "Date (Telugu) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "date", "te")}
                      />
                      {errors.dateTe && (
                        <p className="text-red-400 text-sm mt-1">{errors.dateTe.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Description (Telugu)</label>
                    <div className="relative">
                      <Type size={20} className="absolute left-2 top-4 text-gray-400" />
                      <textarea
                        {...register("descriptionTe", { required: "Description (Telugu) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                        onChange={(e) => handleInputChange(e, "description", "te")}
                      />
                      {errors.descriptionTe && (
                        <p className="text-red-400 text-sm mt-1">{errors.descriptionTe.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Time to Read (Telugu)</label>
                    <div className="relative">
                      <Clock size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("timeToReadTe", { required: "Time to Read (Telugu) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "timeToRead", "te")}
                      />
                      {errors.timeToReadTe && (
                        <p className="text-red-400 text-sm mt-1">{errors.timeToReadTe.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Story Type (Telugu)</label>
                    <div className="relative">
                      <Type size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("storyTypeTe", { required: "Story Type (Telugu) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "storyType", "te")}
                      />
                      {errors.storyTypeTe && (
                        <p className="text-red-400 text-sm mt-1">{errors.storyTypeTe.message}</p>
                      )}
                    </div>
                  </div>
                )}
                {partLanguages.includes("hi") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title (Hindi)</label>
                    <div className="relative">
                      <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("titleHi", { required: "Title (Hindi) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "title", "hi")}
                      />
                      {errors.titleHi && (
                        <p className="text-red-400 text-sm mt-1">{errors.titleHi.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Date (Hindi)</label>
                    <div className="relative">
                      <Calendar size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        {...register("dateHi", { required: "Date (Hindi) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "date", "hi")}
                      />
                      {errors.dateHi && (
                        <p className="text-red-400 text-sm mt-1">{errors.dateHi.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Description (Hindi)</label>
                    <div className="relative">
                      <Type size={20} className="absolute left-2 top-4 text-gray-400" />
                      <textarea
                        {...register("descriptionHi", { required: "Description (Hindi) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                        onChange={(e) => handleInputChange(e, "description", "hi")}
                      />
                      {errors.descriptionHi && (
                        <p className="text-red-400 text-sm mt-1">{errors.descriptionHi.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Time to Read (Hindi)</label>
                    <div className="relative">
                      <Clock size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("timeToReadHi", { required: "Time to Read (Hindi) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "timeToRead", "hi")}
                      />
                      {errors.timeToReadHi && (
                        <p className="text-red-400 text-sm mt-1">{errors.timeToReadHi.message}</p>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">Story Type (Hindi)</label>
                    <div className="relative">
                      <Type size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("storyTypeHi", { required: "Story Type (Hindi) is required" })}
                        className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => handleInputChange(e, "storyType", "hi")}
                      />
                      {errors.storyTypeHi && (
                        <p className="text-red-400 text-sm mt-1">{errors.storyTypeHi.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">Thumbnail Image</label>
                <div className="relative">
                  <ImageIcon size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="w-full p-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                {thumbnailPreview && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="h-20 rounded"
                    />
                    <X
                      size={20}
                      className="absolute top-0 right-0 text-red-400 cursor-pointer"
                      onClick={removeThumbnail}
                    />
                  </div>
                )}
                {thumbnailError && (
                  <p className="text-red-400 text-sm mt-1">{thumbnailError}</p>
                )}
              </div>
            </>
          )}

          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-8">
            <div className="field-group mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Story Content:
              </label>
              <textarea
                {...register("storyContent", { required: "Story Content is required" })}
                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your story content here..."
                value={formData.storyContent}
                onChange={(e) => handleInputChange(e, "storyContent")}
                rows={6}
              />
              {errors.storyContent && (
                <p className="text-red-400 text-sm mt-1">{errors.storyContent.message}</p>
              )}
            </div>

            <div className="field-group mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Age Group:
              </label>
              <select
                {...register("targetAgeGroup", { required: "Target Age Group is required" })}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.targetAgeGroup}
                onChange={(e) => handleInputChange(e, "targetAgeGroup")}
              >
                <option value="">Select Age Group</option>
                <option value="3-5">Toddler/3-5 years</option>
                <option value="6-8">Kids/6-8 years</option>
                <option value="9-12">Child/9-12 years</option>
                <option value="13-18">Teenager/13-18 years</option>
                <option value="18+">Adult/18+ years</option>
              </select>
              {errors.targetAgeGroup && (
                <p className="text-red-400 text-sm mt-1">{errors.targetAgeGroup.message}</p>
              )}
            </div>

            <div className="field-group mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Output Format (auto-set by age group):
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "includeImageSuggestions", label: "Include Image" },
                  { key: "oneLineText", label: "One Line Text" },
                  { key: "includeHeadings", label: "Heading" },
                  { key: "includeQuotes", label: "Quote" },
                  { key: "splitSections", label: "Split Sections" },
                ].map(({ key, label }) => (
                  <span
                    key={key}
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                      formData.outputFormat[key]
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    <span>{formData.outputFormat[key] ? "✓" : "✕"}</span> {label}
                  </span>
                ))}
              </div>
              <small className="text-xs text-gray-400 mt-2 block">
                These options are configured automatically based on the selected
                age group.
              </small>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit Story"}
              </button>
              <button
                type="button"
                className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-white transition-colors duration-200"
                onClick={() => setShowDrafts(!showDrafts)}
              >
                📁 Drafts ({drafts.length})
              </button>
            </div>
          </div>
        </form>

        {sections.length > 0 && (
          <div className="mb-4">
            <label className="block font-semibold text-gray-300 mb-2">Display Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {partLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === "en" ? "English" : lang === "te" ? "Telugu" : "Hindi"}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-300 text-lg animate-pulse">
            Generating content with AI agent...
          </div>
        )}
        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {/* Drafts Modal */}
        {showDrafts && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDrafts(false)}
          >
            <div
              className="bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Saved Drafts</h3>
                <button
                  className="text-gray-400 hover:text-white text-2xl"
                  onClick={() => setShowDrafts(false)}
                >
                  ×
                </button>
              </div>
              <div>
                {drafts.length === 0 ? (
                  <p className="text-gray-400">No drafts saved yet.</p>
                ) : (
                  drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="border-b border-gray-700 py-4"
                    >
                      <div className="mb-2">
                        <h4 className="text-white font-semibold">
                          {draft.title}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Created: {formatDate(draft.createdAt)}
                        </p>
                        <p className="text-sm text-gray-400">
                          Modified: {formatDate(draft.lastModified)}
                        </p>
                        <p className="text-sm text-gray-400">
                          Sections: {draft.sections.length}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                          onClick={() => loadDraft(draft)}
                        >
                          Load
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                          onClick={() => deleteDraft(draft.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {sections.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Generated Sections ({sections.length})
              </h2>
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:bg-gray-600"
                  onClick={openPreview}
                  disabled={sections.length === 0}
                >
                  👁️ Preview Story
                </button>
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  onClick={addNewSection}
                >
                  + Add New Section
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded-lg p-4 shadow-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-indigo-400">
                      Section {section.sectionNumber}
                    </span>
                    <button
                      className="text-red-400 hover:text-red-500 text-xl"
                      onClick={() => deleteSection(index)}
                      title="Delete this section"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.outputFormat.includeHeadings && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Heading:
                        </label>
                        <input
                          type="text"
                          value={section.heading[selectedLanguage] || ""}
                          onChange={(e) =>
                            updateSection(index, "heading", e.target.value)
                          }
                          placeholder="Enter section heading..."
                          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}

                    {formData.outputFormat.includeQuotes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Quote:
                        </label>
                        <textarea
                          value={section.quote[selectedLanguage] || ""}
                          onChange={(e) =>
                            updateSection(index, "quote", e.target.value)
                          }
                          placeholder="Enter a meaningful quote..."
                          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={2}
                        />
                      </div>
                    )}

                    {!formData.outputFormat.oneLineText && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Section Text:
                        </label>
                        <textarea
                          value={section.sectionText[selectedLanguage] || ""}
                          onChange={(e) =>
                            updateSection(index, "sectionText", { [selectedLanguage]: e.target.value })
                          }
                          placeholder="Enter the main content for this section..."
                          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={4}
                        />
                      </div>
                    )}
                    {formData.outputFormat.oneLineText && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          One Line:
                        </label>
                        <input
                          type="text"
                          value={section.oneLineText[selectedLanguage] || ""}
                          onChange={(e) =>
                            updateSection(index, "oneLineText", { [selectedLanguage]: e.target.value })
                          }
                          placeholder="Enter one-line text..."
                          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Image URL:
                      </label>
                      <input
                        type="url"
                        value={section.image_gen}
                        onChange={(e) =>
                          updateSection(index, "image_gen", e.target.value)
                        }
                        placeholder="Enter image URL..."
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {section.image_gen && (
                      <div className="relative">
                        <img
                          src={section.image_gen}
                          alt={`Illustration for ${section.heading[selectedLanguage] || "Section"}`}
                          onClick={() => openImageModal(section.image_gen)}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity z-10"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x300/cccccc/666666?text=Image+Not+Available";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg pointer-events-none">
                          <span className="text-white text-sm">
                            Click to view full size
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2 z-20 relative">
                          <button
                            className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(
                                section.image_gen,
                                section.sectionNumber
                              );
                            }}
                          >
                            ⬇️ Download
                          </button>
                          <button
                            className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateSection(index, "image_gen", "");
                            }}
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    )}
                    {!section.image_gen && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Upload Image:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              updateSection(
                                index,
                                "image_gen",
                                ev.target.result
                              );
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showPreview && (
          <Preview
            sections={sections}
            onClose={closePreview}
            outputFormat={formData.outputFormat}
            language={selectedLanguage}
          />
        )}

        {/* Draft Confirmation Modal */}
        {showDraftConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">Save as Draft?</h3>
              </div>
              <div>
                <p className="text-gray-300 mb-4">
                  Do you want to save the previous response as a draft?
                </p>
                <div className="flex gap-4">
                  <button
                    className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                    onClick={() => handleDraftConfirm(true)}
                  >
                    Yes, Save Draft
                  </button>
                  <button
                    className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                    onClick={() => handleDraftConfirm(false)}
                  >
                    No, Don't Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeImageModal}
          >
            <div
              className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Image Preview</h3>
                <button
                  className="text-gray-400 hover:text-white text-2xl"
                  onClick={closeImageModal}
                >
                  ×
                </button>
              </div>
              <div>
                <img
                  src={selectedImage}
                  alt="Full size preview"
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300/cccccc/666666?text=Image+Not+Available";
                    setError("Failed to load image for preview");
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agent;
