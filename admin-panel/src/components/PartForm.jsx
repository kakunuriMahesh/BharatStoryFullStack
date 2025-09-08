import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Upload,
  X,
  Languages,
  Image as ImageIcon,
  Calendar,
  Clock,
  Type,
  Trash,
  Plus,
  Minus,
} from "lucide-react";

const PartForm = ({ stories, addPart, updatePart, deletePart }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const [selectedStory, setSelectedStory] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [images, setImages] = useState({});
  const [previews, setPreviews] = useState({});
  const [parts, setParts] = useState([{ id: uuidv4() }]);
  const [partLanguages, setPartLanguages] = useState([]);
  const [removeLanguages, setRemoveLanguages] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const storyName = params.get("story");
    const partId = params.get("partId");
    if (storyName && partId) {
      setSelectedStory(storyName);
      setIsEditMode(true);
      const story = stories.find((s) => s.name.en === storyName);
      const part = story?.parts.card.find((p) => p.id === partId);
      if (part) {
        setValue("titleEn", part.title.en || "");
        setValue("titleTe", part.title.te || "");
        setValue("titleHi", part.title.hi || "");
        setValue("dateEn", part.date.en || "");
        setValue("dateTe", part.date.te || "");
        setValue("dateHi", part.date.hi || "");
        setValue("descriptionEn", part.description.en || "");
        setValue("descriptionTe", part.description.te || "");
        setValue("descriptionHi", part.description.hi || "");
        setValue("timeToReadEn", part.timeToRead.en || "");
        setValue("timeToReadTe", part.timeToRead.te || "");
        setValue("timeToReadHi", part.timeToRead.hi || "");
        setValue("storyTypeEn", part.storyType.en || "");
        setValue("storyTypeTe", part.storyType.te || "");
        setValue("storyTypeHi", part.storyType.hi || "");

        const partFields = part.part.map((p) => ({
          id: p.id,
          headingEn: p.heading.en || "",
          headingTe: p.heading.te || "",
          headingHi: p.heading.hi || "",
          quoteEn: p.quote.en || "",
          quoteTe: p.quote.te || "",
          quoteHi: p.quote.hi || "",
          textEn: p.text.en || "",
          textTe: p.text.te || "",
          textHi: p.text.hi || "",
        }));
        setParts(partFields);
        part.part.forEach((p, index) => {
          setValue(`partHeadingEn${index}`, p.heading.en || "");
          setValue(`partHeadingTe${index}`, p.heading.te || "");
          setValue(`partHeadingHi${index}`, p.heading.hi || "");
          setValue(`partQuoteEn${index}`, p.quote.en || "");
          setValue(`partQuoteTe${index}`, p.quote.te || "");
          setValue(`partQuoteHi${index}`, p.quote.hi || "");
          setValue(`partTextEn${index}`, p.text.en || "");
          setValue(`partTextTe${index}`, p.text.te || "");
          setValue(`partTextHi${index}`, p.text.hi || "");
          if (p.image) {
            setPreviews((prev) => ({
              ...prev,
              [`partImage${index}`]: p.image,
            }));
            setImages((prev) => ({
              ...prev,
              [`partImage${index}`]: p.image, // Preserve existing image
            }));
          }
        });
        if (part.thumbnailImage) {
          setPreviews((prev) => ({
            ...prev,
            thumbnailImage: part.thumbnailImage,
          }));
          setImages((prev) => ({
            ...prev,
            thumbnailImage: part.thumbnailImage, // Preserve existing image
          }));
        }
        setPartLanguages(story.languages);
      }
    } else {
      setParts([{ id: uuidv4() }]);
      setPartLanguages(location.state?.languages || ["en", "te"]);
    }
  }, [location, stories, setValue]);

  const addNewPart = () => setParts((prev) => [...prev, { id: uuidv4() }]);

  const removePart = (partId) => {
    setParts((prev) => prev.filter((p) => p.id !== partId));
    setImages((prev) => {
      const newImages = { ...prev };
      const index = parts.findIndex((p) => p.id === partId);
      delete newImages[`partImage${index}`];
      return newImages;
    });
    setPreviews((prev) => {
      const newPreviews = { ...prev };
      const index = parts.findIndex((p) => p.id === partId);
      delete newPreviews[`partImage${index}`];
      return newPreviews;
    });
    setImageErrors((prev) => {
      const newErrors = { ...prev };
      const index = parts.findIndex((p) => p.id === partId);
      delete newErrors[`partImage${index}`];
      return newErrors;
    });
  };

  const handleImageChange = (field, file) => {
    setImages((prev) => ({ ...prev, [field]: file || null }));
    setPreviews((prev) => ({
      ...prev,
      [field]: file ? URL.createObjectURL(file) : null,
    }));
    setImageErrors((prev) => ({ ...prev, [field]: file ? "" : "Image is required" }));
  };

  const removeImage = (field) => {
    setImages((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: null }));
    setImageErrors((prev) => ({ ...prev, [field]: "Image is required" }));
  };

  const validateImages = () => {
    const newErrors = {};
    if (!images.thumbnailImage && !previews.thumbnailImage) {
      newErrors.thumbnailImage = "Thumbnail Image is required";
    }
    parts.forEach((_, index) => {
      if (!images[`partImage${index}`] && !previews[`partImage${index}`]) {
        newErrors[`partImage${index}`] = `Section ${index + 1} Image is required`;
      }
    });
    setImageErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (data) => {
    if (!validateImages()) return;

    const story = stories.find((s) => s.name.en === selectedStory);
    const formData = new FormData();
    formData.append("storyId", story.id);
    if (partLanguages.includes("en")) {
      formData.append("titleEn", data.titleEn || "");
      formData.append("dateEn", data.dateEn || "");
      formData.append("descriptionEn", data.descriptionEn || "");
      formData.append("timeToReadEn", data.timeToReadEn || "");
      formData.append("storyTypeEn", data.storyTypeEn || "");
    }
    if (partLanguages.includes("te")) {
      formData.append("titleTe", data.titleTe || "");
      formData.append("dateTe", data.dateTe || "");
      formData.append("descriptionTe", data.descriptionTe || "");
      formData.append("timeToReadTe", data.timeToReadTe || "");
      formData.append("storyTypeTe", data.storyTypeTe || "");
    }
    if (partLanguages.includes("hi")) {
      formData.append("titleHi", data.titleHi || "");
      formData.append("dateHi", data.dateHi || "");
      formData.append("descriptionHi", data.descriptionHi || "");
      formData.append("timeToReadHi", data.timeToReadHi || "");
      formData.append("storyTypeHi", data.storyTypeHi || "");
    }
    if (images.thumbnailImage) {
      formData.append("thumbnailImage", images.thumbnailImage);
    } else if (previews.thumbnailImage) {
      formData.append("thumbnailImage", previews.thumbnailImage); // Existing URL
    }
    parts.forEach((part, index) => {
      if (partLanguages.includes("en")) {
        formData.append(`headingEn${index}`, data[`partHeadingEn${index}`] || "");
        formData.append(`quoteEn${index}`, data[`partQuoteEn${index}`] || "");
        formData.append(`textEn${index}`, data[`partTextEn${index}`] || "");
      }
      if (partLanguages.includes("te")) {
        formData.append(`headingTe${index}`, data[`partHeadingTe${index}`] || "");
        formData.append(`quoteTe${index}`, data[`partQuoteTe${index}`] || "");
        formData.append(`textTe${index}`, data[`partTextTe${index}`] || "");
      }
      if (partLanguages.includes("hi")) {
        formData.append(`headingHi${index}`, data[`partHeadingHi${index}`] || "");
        formData.append(`quoteHi${index}`, data[`partQuoteHi${index}`] || "");
        formData.append(`textHi${index}`, data[`partTextHi${index}`] || "");
      }
      if (images[`partImage${index}`]) {
        formData.append(`partImage${index}`, images[`partImage${index}`]);
      } else if (previews[`partImage${index}`]) {
        formData.append(`partImage${index}`, previews[`partImage${index}`]); // Existing URL
      }
      formData.append(`id${index}`, part.id);
    });
    formData.append("languages", JSON.stringify(partLanguages));

    if (removeLanguages.length > 0) {
      const confirmRemove = window.confirm(
        `Do you want to remove the following languages from this part: ${removeLanguages.join(", ")}? ` +
        "All content in these languages will be deleted from this part."
      );
      if (confirmRemove) {
        formData.append("removeLanguages", JSON.stringify(removeLanguages));
        formData.append("deleteContent", "true");
      } else {
        setPartLanguages((prev) => [...prev, ...removeLanguages]);
        setRemoveLanguages([]);
        return;
      }
    }

    if (isEditMode) {
      const partId = new URLSearchParams(location.search).get("partId");
      formData.append("partId", partId);
      updatePart(selectedStory, partId, formData);
    } else {
      addPart(formData);
    }
    reset();
    setImages({});
    setPreviews({});
    setParts([{ id: uuidv4() }]);
    setRemoveLanguages([]);
    setImageErrors({});
    navigate("/my-stories");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this part?")) {
      const partId = new URLSearchParams(location.search).get("partId");
      const story = stories.find((s) => s.name.en === selectedStory);
      deletePart(story.id, partId);
      navigate("/my-stories");
    }
  };

  const story = stories.find((s) => s.name.en === selectedStory);
  const storyLanguages = story?.languages || partLanguages;

  const togglePartLanguage = (lang) => {
    if (!storyLanguages.includes(lang)) {
      alert(
        `Cannot add part in ${lang} until the story has a title in ${lang}. Please edit the story first.`
      );
      return;
    }
    if (partLanguages.includes(lang)) {
      setRemoveLanguages((prev) => [...prev, lang]);
      setPartLanguages((prev) => prev.filter((l) => l !== lang));
    } else {
      setPartLanguages((prev) => [...prev, lang]);
      setRemoveLanguages((prev) => prev.filter((l) => l !== lang));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h2 className="text-2xl font-bold mb-4">{isEditMode ? "Edit Part" : "Add New Part"}</h2>
      <div className="mb-4">
        <label className="block font-semibold">Select Story</label>
        <select
          value={selectedStory}
          onChange={(e) => {
            setSelectedStory(e.target.value);
            const selected = stories.find((s) => s.name.en === e.target.value);
            setPartLanguages(selected?.languages || ["en", "te"]);
          }}
          className="w-full p-2 border rounded"
          disabled={isEditMode}
        >
          <option value="">Select a story</option>
          {stories.map((story) => (
            <option key={story.id} value={story.name.en}>
              {story.name.en}
            </option>
          ))}
        </select>
      </div>

      {(selectedStory || isEditMode) && (
        <>
          <div className="mb-4">
            <label className="block font-semibold">Languages for this Part:</label>
            <div className="flex space-x-4">
              <label>
                <input
                  type="checkbox"
                  checked={partLanguages.includes("en")}
                  onChange={() => togglePartLanguage("en")}
                  disabled={!storyLanguages.includes("en")}
                />
                English
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={partLanguages.includes("te")}
                  onChange={() => togglePartLanguage("te")}
                  disabled={!storyLanguages.includes("te")}
                />
                Telugu
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={partLanguages.includes("hi")}
                  onChange={() => togglePartLanguage("hi")}
                  disabled={!storyLanguages.includes("hi")}
                />
                Hindi
              </label>
            </div>
            {!storyLanguages.includes("hi") && (
              <p className="text-sm text-gray-500 mt-2">
                To add parts in Hindi, edit the story to include a Hindi title.
              </p>
            )}
          </div>
          {partLanguages.length > 0 && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <h3 className="text-xl font-semibold mb-2">Card Details</h3>
              <div className="grid grid-cols-3 gap-4">
                {partLanguages.includes("en") && (
                  <div>
                    <label className="block font-semibold">Title (English)</label>
                    <div className="relative">
                      <Languages
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register("titleEn", { required: "Title (English) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.titleEn && (
                        <p className="text-red-500 text-sm">{errors.titleEn.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Date (English)</label>
                    <div className="relative">
                      <Calendar
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        type="date"
                        {...register("dateEn", { required: "Date (English) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.dateEn && (
                        <p className="text-red-500 text-sm">{errors.dateEn.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Description (English)</label>
                    <div className="relative">
                      <Type
                        size={20}
                        className="absolute left-2 top-4 text-gray-500"
                      />
                      <textarea
                        {...register("descriptionEn", { required: "Description (English) is required" })}
                        className="w-full p-2 pl-10 border rounded h-24"
                      />
                      {errors.descriptionEn && (
                        <p className="text-red-500 text-sm">{errors.descriptionEn.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Time to Read (English)</label>
                    <div className="relative">
                      <Clock
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register("timeToReadEn", { required: "Time to Read (English) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.timeToReadEn && (
                        <p className="text-red-500 text-sm">{errors.timeToReadEn.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Story Type (English)</label>
                    <div className="relative">
                      <Type
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register("storyTypeEn", { required: "Story Type (English) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.storyTypeEn && (
                        <p className="text-red-500 text-sm">{errors.storyTypeEn.message}</p>
                      )}
                    </div>
                  </div>
                )}
                {partLanguages.includes("te") && (
                  <div>
                    <label className="block font-semibold">Title (Telugu)</label>
                    <div className="relative">
                      <Languages
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register("titleTe", { required: "Title (Telugu) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.titleTe && (
                        <p className="text-red-500 text-sm">{errors.titleTe.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Date (Telugu)</label>
                    <div className="relative">
                      <Calendar
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        type="date"
                        {...register("dateTe", { required: "Date (Telugu) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.dateTe && (
                        <p className="text-red-500 text-sm">{errors.dateTe.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Description (Telugu)</label>
                    <div className="relative">
                      <Type
                        size={20}
                        className="absolute left-2 top-4 text-gray-500"
                      />
                      <textarea
                        {...register("descriptionTe", { required: "Description (Telugu) is required" })}
                        className="w-full p-2 pl-10 border rounded h-24"
                      />
                      {errors.descriptionTe && (
                        <p className="text-red-500 text-sm">{errors.descriptionTe.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Time to Read (Telugu)</label>
                    <div className="relative">
                      <Clock
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register("timeToReadTe", { required: "Time to Read (Telugu) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.timeToReadTe && (
                        <p className="text-red-500 text-sm">{errors.timeToReadTe.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Story Type (Telugu)</label>
                    <div className="relative">
                      <Type
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register("storyTypeTe", { required: "Story Type (Telugu) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.storyTypeTe && (
                        <p className="text-red-500 text-sm">{errors.storyTypeTe.message}</p>
                      )}
                    </div>
                  </div>
                )}
                {partLanguages.includes("hi") && (
                  <div>
                    <label className="block font-semibold">Title (Hindi)</label>
                    <div className="relative">
                      <Languages
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register("titleHi", { required: "Title (Hindi) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.titleHi && (
                        <p className="text-red-500 text-sm">{errors.titleHi.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Date (Hindi)</label>
                    <div className="relative">
                      <Calendar
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        type="date"
                        {...register("dateHi", { required: "Date (Hindi) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.dateHi && (
                        <p className="text-red-500 text-sm">{errors.dateHi.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Description (Hindi)</label>
                    <div className="relative">
                      <Type
                        size={20}
                        className="absolute left-2 top-4 text-gray-500"
                      />
                      <textarea
                        {...register("descriptionHi", { required: "Description (Hindi) is required" })}
                        className="w-full p-2 pl-10 border rounded h-24"
                      />
                      {errors.descriptionHi && (
                        <p className="text-red-500 text-sm">{errors.descriptionHi.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Time to Read (Hindi)</label>
                    <div className="relative">
                      <Clock
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register("timeToReadHi", { required: "Time to Read (Hindi) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.timeToReadHi && (
                        <p className="text-red-500 text-sm">{errors.timeToReadHi.message}</p>
                      )}
                    </div>
                    <label className="block font-semibold mt-2">Story Type (Hindi)</label>
                    <div className="relative">
                      <Type
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        {...register("storyTypeHi", { required: "Story Type (Hindi) is required" })}
                        className="w-full p-2 pl-10 border rounded"
                      />
                      {errors.storyTypeHi && (
                        <p className="text-red-500 text-sm">{errors.storyTypeHi.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <label className="block font-semibold">Thumbnail Image</label>
                <div className="relative">
                  <ImageIcon
                    size={20}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange("thumbnailImage", e.target.files[0])}
                    className="w-full p-2 pl-10"
                  />
                </div>
                {previews.thumbnailImage && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={previews.thumbnailImage}
                      alt="Thumbnail Preview"
                      className="h-20 rounded"
                    />
                    <X
                      size={20}
                      className="absolute top-0 right-0 text-red-500 cursor-pointer"
                      onClick={() => removeImage("thumbnailImage")}
                    />
                  </div>
                )}
                {imageErrors.thumbnailImage && (
                  <p className="text-red-500 text-sm">{imageErrors.thumbnailImage}</p>
                )}
              </div>

              <h3 className="text-xl font-semibold mt-4 mb-2">Section Details</h3>
              {parts.map((part, index) => (
                <div key={part.id} className="relative border p-4 mb-4 rounded">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePart(part.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    {partLanguages.includes("en") && (
                      <div>
                        <label className="block font-semibold">Heading (English)</label>
                        <div className="relative">
                          <Languages
                            size={20}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          />
                          <input
                            {...register(`partHeadingEn${index}`, { required: "Heading (English) is required" })}
                            className="w-full p-2 pl-10 border rounded"
                          />
                          {errors[`partHeadingEn${index}`] && (
                            <p className="text-red-500 text-sm">{errors[`partHeadingEn${index}`].message}</p>
                          )}
                        </div>
                        <label className="block font-semibold mt-2">Quote (English) - Optional</label>
                        <div className="relative">
                          <Type
                            size={20}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          />
                          <input
                            {...register(`partQuoteEn${index}`)}
                            className="w-full p-2 pl-10 border rounded"
                          />
                        </div>
                        <label className="block font-semibold mt-2">Text (English)</label>
                        <div className="relative">
                          <Type
                            size={20}
                            className="absolute left-2 top-4 text-gray-500"
                          />
                          <textarea
                            {...register(`partTextEn${index}`, { required: "Text (English) is required" })}
                            className="w-full p-2 pl-10 border rounded h-32"
                          />
                          {errors[`partTextEn${index}`] && (
                            <p className="text-red-500 text-sm">{errors[`partTextEn${index}`].message}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {partLanguages.includes("te") && (
                      <div>
                        <label className="block font-semibold">Heading (Telugu)</label>
                        <div className="relative">
                          <Languages
                            size={20}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          />
                          <input
                            {...register(`partHeadingTe${index}`, { required: "Heading (Telugu) is required" })}
                            className="w-full p-2 pl-10 border rounded"
                          />
                          {errors[`partHeadingTe${index}`] && (
                            <p className="text-red-500 text-sm">{errors[`partHeadingTe${index}`].message}</p>
                          )}
                        </div>
                        <label className="block font-semibold mt-2">Quote (Telugu) - Optional</label>
                        <div className="relative">
                          <Type
                            size={20}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          />
                          <input
                            {...register(`partQuoteTe${index}`)}
                            className="w-full p-2 pl-10 border rounded"
                          />
                        </div>
                        <label className="block font-semibold mt-2">Text (Telugu)</label>
                        <div className="relative">
                          <Type
                            size={20}
                            className="absolute left-2 top-4 text-gray-500"
                          />
                          <textarea
                            {...register(`partTextTe${index}`, { required: "Text (Telugu) is required" })}
                            className="w-full p-2 pl-10 border rounded h-32"
                          />
                          {errors[`partTextTe${index}`] && (
                            <p className="text-red-500 text-sm">{errors[`partTextTe${index}`].message}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {partLanguages.includes("hi") && (
                      <div>
                        <label className="block font-semibold">Heading (Hindi)</label>
                        <div className="relative">
                          <Languages
                            size={20}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          />
                          <input
                            {...register(`partHeadingHi${index}`, { required: "Heading (Hindi) is required" })}
                            className="w-full p-2 pl-10 border rounded"
                          />
                          {errors[`partHeadingHi${index}`] && (
                            <p className="text-red-500 text-sm">{errors[`partHeadingHi${index}`].message}</p>
                          )}
                        </div>
                        <label className="block font-semibold mt-2">Quote (Hindi) - Optional</label>
                        <div className="relative">
                          <Type
                            size={20}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          />
                          <input
                            {...register(`partQuoteHi${index}`)}
                            className="w-full p-2 pl-10 border rounded"
                          />
                        </div>
                        <label className="block font-semibold mt-2">Text (Hindi)</label>
                        <div className="relative">
                          <Type
                            size={20}
                            className="absolute left-2 top-4 text-gray-500"
                          />
                          <textarea
                            {...register(`partTextHi${index}`, { required: "Text (Hindi) is required" })}
                            className="w-full p-2 pl-10 border rounded h-32"
                          />
                          {errors[`partTextHi${index}`] && (
                            <p className="text-red-500 text-sm">{errors[`partTextHi${index}`].message}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block font-semibold">Section Image</label>
                    <div className="relative">
                      <ImageIcon
                        size={20}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(`partImage${index}`, e.target.files[0])}
                        className="w-full p-2 pl-10"
                      />
                    </div>
                    {previews[`partImage${index}`] && (
                      <div className="mt-2 relative inline-block">
                        <img
                          src={previews[`partImage${index}`]}
                          alt="Part Preview"
                          className="h-20 rounded"
                        />
                        <X
                          size={20}
                          className="absolute top-0 right-0 text-red-500 cursor-pointer"
                          onClick={() => removeImage(`partImage${index}`)}
                        />
                      </div>
                    )}
                    {imageErrors[`partImage${index}`] && (
                      <p className="text-red-500 text-sm">{imageErrors[`partImage${index}`]}</p>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addNewPart}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={20} /> Add Section
              </button>

              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <Upload size={20} /> {isEditMode ? "Update Part" : "Add Part"}
                </button>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <Trash size={20} /> Delete Part
                  </button>
                )}
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default PartForm;

// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { v4 as uuidv4 } from 'uuid';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Upload, X, Languages, Image as ImageIcon, Calendar, Clock, Type, Trash, Plus, Minus } from 'lucide-react';

// const PartForm = ({ stories, addPart, updatePart, deletePart }) => {
//   const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
//   const [selectedStory, setSelectedStory] = useState('');
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [images, setImages] = useState({});
//   const [parts, setParts] = useState([{ id: uuidv4() }]);
//   const [partLanguages, setPartLanguages] = useState([]);
//   const [removeLanguages, setRemoveLanguages] = useState([]);
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const storyName = params.get('story');
//     const partId = params.get('partId');
//     if (storyName && partId) {
//       setSelectedStory(storyName);
//       setIsEditMode(true);
//       const story = stories.find((s) => s.name.en === storyName);
//       const part = story?.parts.card.find((p) => p.id === partId);
//       if (part) {
//         setValue('titleEn', part.title.en, { shouldValidate: true });
//         setValue('titleTe', part.title.te, { shouldValidate: true });
//         setValue('titleHi', part.title.hi || '', { shouldValidate: true });
//         setValue('dateEn', part.date.en, { shouldValidate: true });
//         setValue('dateTe', part.date.te, { shouldValidate: true });
//         setValue('dateHi', part.date.hi || '', { shouldValidate: true });
//         setValue('descEn', part.description.en, { shouldValidate: true });
//         setValue('descTe', part.description.te, { shouldValidate: true });
//         setValue('descHi', part.description.hi || '', { shouldValidate: true });
//         setValue('timeEn', part.timeToRead.en, { shouldValidate: true });
//         setValue('timeTe', part.timeToRead.te, { shouldValidate: true });
//         setValue('timeHi', part.timeToRead.hi || '', { shouldValidate: true });
//         setValue('typeEn', part.storyType.en, { shouldValidate: true });
//         setValue('typeTe', part.storyType.te, { shouldValidate: true });
//         setValue('typeHi', part.storyType.hi || '', { shouldValidate: true });

//         const partFields = part.part.map((p) => ({
//           id: p.id,
//           headingEn: p.heading.en,
//           headingTe: p.heading.te,
//           headingHi: p.heading.hi || '',
//           quoteEn: p.quote.en,
//           quoteTe: p.quote.te,
//           quoteHi: p.quote.hi || '',
//           textEn: p.text.en,
//           textTe: p.text.te,
//           textHi: p.text.hi || '',
//         }));
//         setParts(partFields);
//         part.part.forEach((p, index) => {
//           setValue(`partHeadingEn${index}`, p.heading.en, { shouldValidate: true });
//           setValue(`partHeadingTe${index}`, p.heading.te, { shouldValidate: true });
//           setValue(`partHeadingHi${index}`, p.heading.hi || '', { shouldValidate: true });
//           setValue(`partQuoteEn${index}`, p.quote.en);
//           setValue(`partQuoteTe${index}`, p.quote.te);
//           setValue(`partQuoteHi${index}`, p.quote.hi || '');
//           setValue(`partTextEn${index}`, p.text.en, { shouldValidate: true });
//           setValue(`partTextTe${index}`, p.text.te, { shouldValidate: true });
//           setValue(`partTextHi${index}`, p.text.hi || '', { shouldValidate: true });
//           if (p.image) setImages((prev) => ({ ...prev, [`partImage${index}`]: p.image }));
//         });
//         if (part.thumbnailImage) setImages((prev) => ({ ...prev, thumbnailImage: part.thumbnailImage }));
//         setPartLanguages(story.languages);
//       }
//     } else {
//       setParts([{ id: uuidv4() }]);
//       setPartLanguages(location.state?.languages || ['en', 'te']);
//     }
//   }, [location, stories, setValue]);

//   const addNewPart = () => setParts((prev) => [...prev, { id: uuidv4() }]);

//   const removePart = (partId) => {
//     setParts((prev) => prev.filter((p) => p.id !== partId));
//     setImages((prev) => {
//       const newImages = { ...prev };
//       const index = parts.findIndex((p) => p.id === partId);
//       delete newImages[`partImage${index}`];
//       return newImages;
//     });
//   };

//   const onSubmit = (data) => {
//     const story = stories.find((s) => s.name.en === selectedStory);
//     const formData = new FormData();
//     formData.append('storyId', story.id);
//     if (partLanguages.includes('en')) {
//       formData.append('titleEn', data.titleEn);
//       formData.append('dateEn', data.dateEn);
//       formData.append('descEn', data.descEn);
//       formData.append('timeEn', data.timeEn);
//       formData.append('typeEn', data.typeEn);
//     }
//     if (partLanguages.includes('te')) {
//       formData.append('titleTe', data.titleTe);
//       formData.append('dateTe', data.dateTe);
//       formData.append('descTe', data.descTe);
//       formData.append('timeTe', data.timeTe);
//       formData.append('typeTe', data.typeTe);
//     }
//     if (partLanguages.includes('hi')) {
//       formData.append('titleHi', data.titleHi);
//       formData.append('dateHi', data.dateHi);
//       formData.append('descHi', data.descHi);
//       formData.append('timeHi', data.timeHi);
//       formData.append('typeHi', data.typeHi);
//     }
//     if (images.thumbnailImage) formData.append('thumbnailImage', images.thumbnailImage);
//     parts.forEach((part, index) => {
//       if (partLanguages.includes('en')) {
//         formData.append(`headingEn${index}`, data[`partHeadingEn${index}`]);
//         formData.append(`quoteEn${index}`, data[`partQuoteEn${index}`] || '');
//         formData.append(`textEn${index}`, data[`partTextEn${index}`]);
//       }
//       if (partLanguages.includes('te')) {
//         formData.append(`headingTe${index}`, data[`partHeadingTe${index}`]);
//         formData.append(`quoteTe${index}`, data[`partQuoteTe${index}`] || '');
//         formData.append(`textTe${index}`, data[`partTextTe${index}`]);
//       }
//       if (partLanguages.includes('hi')) {
//         formData.append(`headingHi${index}`, data[`partHeadingHi${index}`]);
//         formData.append(`quoteHi${index}`, data[`partQuoteHi${index}`] || '');
//         formData.append(`textHi${index}`, data[`partTextHi${index}`]);
//       }
//       if (images[`partImage${index}`]) formData.append(`partImage${index}`, images[`partImage${index}`]);
//     });
//     formData.append('languages', JSON.stringify(partLanguages));

//     if (removeLanguages.length > 0) {
//       const confirmRemove = window.confirm(
//         `Do you want to remove the following languages from this part: ${removeLanguages.join(', ')}? ` +
//         'All content in these languages will be deleted from this part.'
//       );
//       if (confirmRemove) {
//         formData.append('removeLanguages', JSON.stringify(removeLanguages));
//         formData.append('deleteContent', 'true');
//       } else {
//         setPartLanguages((prev) => [...prev, ...removeLanguages]);
//         setRemoveLanguages([]);
//         return;
//       }
//     }

//     if (isEditMode) {
//       const partId = new URLSearchParams(location.search).get('partId');
//       formData.append('partId', partId);
//       updatePart(selectedStory, partId, formData); // Pass FormData directly
//     } else {
//       addPart(formData);
//     }
//     reset();
//     setImages({});
//     setParts([{ id: uuidv4() }]);
//     setRemoveLanguages([]);
//     navigate('/my-stories');
//   };

//   const handleDelete = () => {
//     if (window.confirm('Are you sure you want to delete this part?')) {
//       const partId = new URLSearchParams(location.search).get('partId');
//       const story = stories.find((s) => s.name.en === selectedStory);
//       deletePart(story.id, partId);
//       navigate('/my-stories');
//     }
//   };

//   const handleImageChange = (field, file) => setImages((prev) => ({ ...prev, [field]: file }));
//   const removeImage = (field) => setImages((prev) => ({ ...prev, [field]: null }));

//   const story = stories.find((s) => s.name.en === selectedStory);
//   const storyLanguages = story?.languages || partLanguages;

//   const togglePartLanguage = (lang) => {
//     if (!storyLanguages.includes(lang)) {
//       alert(`Cannot add part in ${lang} until the story has a title in ${lang}. Please edit the story first.`);
//       return;
//     }
//     if (partLanguages.includes(lang)) {
//       setRemoveLanguages((prev) => [...prev, lang]);
//       setPartLanguages((prev) => prev.filter((l) => l !== lang));
//     } else {
//       setPartLanguages((prev) => [...prev, lang]);
//       setRemoveLanguages((prev) => prev.filter((l) => l !== lang));
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded mt-6">
//       <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Part' : 'Add New Part'}</h2>
//       <div className="mb-4">
//         <label className="block font-semibold">Select Story</label>
//         <select
//           value={selectedStory}
//           onChange={(e) => {
//             setSelectedStory(e.target.value);
//             const selected = stories.find((s) => s.name.en === e.target.value);
//             setPartLanguages(selected?.languages || ['en', 'te']);
//           }}
//           className="w-full p-2 border rounded"
//           disabled={isEditMode}
//         >
//           <option value="">Select a story</option>
//           {stories.map((story) => (
//             <option key={story.id} value={story.name.en}>{story.name.en}</option>
//           ))}
//         </select>
//       </div>

//       {(selectedStory || isEditMode) && (
//         <>
//           <div className="mb-4">
//             <label className="block font-semibold">Languages for this Part:</label>
//             <div className="flex space-x-4">
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={partLanguages.includes('en')}
//                   onChange={() => togglePartLanguage('en')}
//                   disabled={!storyLanguages.includes('en')}
//                 />
//                 English
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={partLanguages.includes('te')}
//                   onChange={() => togglePartLanguage('te')}
//                   disabled={!storyLanguages.includes('te')}
//                 />
//                 Telugu
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={partLanguages.includes('hi')}
//                   onChange={() => togglePartLanguage('hi')}
//                   disabled={!storyLanguages.includes('hi')}
//                 />
//                 Hindi
//               </label>
//             </div>
//             {!storyLanguages.includes('hi') && (
//               <p className="text-sm text-gray-500 mt-2">To add parts in Hindi, edit the story to include a Hindi title.</p>
//             )}
//           </div>
//           {partLanguages.length > 0 && (
//             <form onSubmit={handleSubmit(onSubmit)}>
//               <h3 className="text-xl font-semibold mb-2">Card Details</h3>
//               <div className="grid grid-cols-3 gap-4">
//                 {partLanguages.includes('en') && (
//                   <div>
//                     <label className="block font-semibold">Title (English)</label>
//                     <div className="relative">
//                       <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         {...register('titleEn', { required: 'Title (English) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.titleEn && <p className="text-red-500 text-sm">{errors.titleEn.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Date (English)</label>
//                     <div className="relative">
//                       <Calendar size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         type="date"
//                         {...register('dateEn', { required: 'Date (English) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.dateEn && <p className="text-red-500 text-sm">{errors.dateEn.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Description (English)</label>
//                     <div className="relative">
//                       <Type size={20} className="absolute left-2 top-4 text-gray-500" />
//                       <textarea
//                         {...register('descEn', { required: 'Description (English) is required' })}
//                         className="w-full p-2 pl-10 border rounded h-24"
//                       />
//                       {errors.descEn && <p className="text-red-500 text-sm">{errors.descEn.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Time to Read (English)</label>
//                     <div className="relative">
//                       <Clock size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         {...register('timeEn', { required: 'Time to Read (English) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.timeEn && <p className="text-red-500 text-sm">{errors.timeEn.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Story Type (English)</label>
//                     <div className="relative">
//                       <Type size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         {...register('typeEn', { required: 'Story Type (English) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.typeEn && <p className="text-red-500 text-sm">{errors.typeEn.message}</p>}
//                     </div>
//                   </div>
//                 )}
//                 {partLanguages.includes('te') && (
//                   <div>
//                     <label className="block font-semibold">Title (Telugu)</label>
//                     <div className="relative">
//                       <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         {...register('titleTe', { required: 'Title (Telugu) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.titleTe && <p className="text-red-500 text-sm">{errors.titleTe.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Date (Telugu)</label>
//                     <div className="relative">
//                       <Calendar size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         type="date"
//                         {...register('dateTe', { required: 'Date (Telugu) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.dateTe && <p className="text-red-500 text-sm">{errors.dateTe.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Description (Telugu)</label>
//                     <div className="relative">
//                       <Type size={20} className="absolute left-2 top-4 text-gray-500" />
//                       <textarea
//                         {...register('descTe', { required: 'Description (Telugu) is required' })}
//                         className="w-full p-2 pl-10 border rounded h-24"
//                       />
//                       {errors.descTe && <p className="text-red-500 text-sm">{errors.descTe.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Time to Read (Telugu)</label>
//                     <div className="relative">
//                       <Clock size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         {...register('timeTe', { required: 'Time to Read (Telugu) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.timeTe && <p className="text-red-500 text-sm">{errors.timeTe.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Story Type (Telugu)</label>
//                     <div className="relative">
//                       <Type size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         {...register('typeTe', { required: 'Story Type (Telugu) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.typeTe && <p className="text-red-500 text-sm">{errors.typeTe.message}</p>}
//                     </div>
//                   </div>
//                 )}
//                 {partLanguages.includes('hi') && (
//                   <div>
//                     <label className="block font-semibold">Title (Hindi)</label>
//                     <div className="relative">
//                       <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         {...register('titleHi', { required: 'Title (Hindi) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.titleHi && <p className="text-red-500 text-sm">{errors.titleHi.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Date (Hindi)</label>
//                     <div className="relative">
//                       <Calendar size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         type="date"
//                         {...register('dateHi', { required: 'Date (Hindi) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.dateHi && <p className="text-red-500 text-sm">{errors.dateHi.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Description (Hindi)</label>
//                     <div className="relative">
//                       <Type size={20} className="absolute left-2 top-4 text-gray-500" />
//                       <textarea
//                         {...register('descHi', { required: 'Description (Hindi) is required' })}
//                         className="w-full p-2 pl-10 border rounded h-24"
//                       />
//                       {errors.descHi && <p className="text-red-500 text-sm">{errors.descHi.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Time to Read (Hindi)</label>
//                     <div className="relative">
//                       <Clock size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         {...register('timeHi', { required: 'Time to Read (Hindi) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.timeHi && <p className="text-red-500 text-sm">{errors.timeHi.message}</p>}
//                     </div>
//                     <label className="block font-semibold mt-2">Story Type (Hindi)</label>
//                     <div className="relative">
//                       <Type size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         {...register('typeHi', { required: 'Story Type (Hindi) is required' })}
//                         className="w-full p-2 pl-10 border rounded"
//                       />
//                       {errors.typeHi && <p className="text-red-500 text-sm">{errors.typeHi.message}</p>}
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="mt-4">
//                 <label className="block font-semibold">Thumbnail Image</label>
//                 <div className="relative">
//                   <ImageIcon size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => handleImageChange('thumbnailImage', e.target.files[0])}
//                     className="w-full p-2 pl-10"
//                   />
//                 </div>
//                 {images.thumbnailImage && (
//                   <div className="mt-2 relative inline-block">
//                     <img
//                       src={typeof images.thumbnailImage === 'string' ? images.thumbnailImage : URL.createObjectURL(images.thumbnailImage)}
//                       alt="Thumbnail Preview"
//                       className="h-20 rounded"
//                     />
//                     <X size={20} className="absolute top-0 right-0 text-red-500 cursor-pointer" onClick={() => removeImage('thumbnailImage')} />
//                   </div>
//                 )}
//               </div>

//               <h3 className="text-xl font-semibold mt-4 mb-2">Part Details</h3>
//               {parts.map((part, index) => (
//                 <div key={part.id} className="relative border p-4 mb-4 rounded">
//                   {index > 0 && (
//                     <button
//                       type="button"
//                       onClick={() => removePart(part.id)}
//                       className="absolute top-2 right-2 text-red-500 hover:text-red-700"
//                     >
//                       <Minus size={20} />
//                     </button>
//                   )}
//                   <div className="grid grid-cols-3 gap-4">
//                     {partLanguages.includes('en') && (
//                       <div>
//                         <label className="block font-semibold">Heading (English)</label>
//                         <div className="relative">
//                           <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                           <input
//                             {...register(`partHeadingEn${index}`, { required: 'Heading (English) is required' })}
//                             className="w-full p-2 pl-10 border rounded"
//                           />
//                           {errors[`partHeadingEn${index}`] && (
//                             <p className="text-red-500 text-sm">{errors[`partHeadingEn${index}`].message}</p>
//                           )}
//                         </div>
//                         <label className="block font-semibold mt-2">Quote (English) - Optional</label>
//                         <div className="relative">
//                           <Type size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                           <input
//                             {...register(`partQuoteEn${index}`)}
//                             className="w-full p-2 pl-10 border rounded"
//                           />
//                         </div>
//                         <label className="block font-semibold mt-2">Text (English)</label>
//                         <div className="relative">
//                           <Type size={20} className="absolute left-2 top-4 text-gray-500" />
//                           <textarea
//                             {...register(`partTextEn${index}`, { required: 'Text (English) is required' })}
//                             className="w-full p-2 pl-10 border rounded h-32"
//                           />
//                           {errors[`partTextEn${index}`] && (
//                             <p className="text-red-500 text-sm">{errors[`partTextEn${index}`].message}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                     {partLanguages.includes('te') && (
//                       <div>
//                         <label className="block font-semibold">Heading (Telugu)</label>
//                         <div className="relative">
//                           <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                           <input
//                             {...register(`partHeadingTe${index}`, { required: 'Heading (Telugu) is required' })}
//                             className="w-full p-2 pl-10 border rounded"
//                           />
//                           {errors[`partHeadingTe${index}`] && (
//                             <p className="text-red-500 text-sm">{errors[`partHeadingTe${index}`].message}</p>
//                           )}
//                         </div>
//                         <label className="block font-semibold mt-2">Quote (Telugu) - Optional</label>
//                         <div className="relative">
//                           <Type size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                           <input
//                             {...register(`partQuoteTe${index}`)}
//                             className="w-full p-2 pl-10 border rounded"
//                           />
//                         </div>
//                         <label className="block font-semibold mt-2">Text (Telugu)</label>
//                         <div className="relative">
//                           <Type size={20} className="absolute left-2 top-4 text-gray-500" />
//                           <textarea
//                             {...register(`partTextTe${index}`, { required: 'Text (Telugu) is required' })}
//                             className="w-full p-2 pl-10 border rounded h-32"
//                           />
//                           {errors[`partTextTe${index}`] && (
//                             <p className="text-red-500 text-sm">{errors[`partTextTe${index}`].message}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                     {partLanguages.includes('hi') && (
//                       <div>
//                         <label className="block font-semibold">Heading (Hindi)</label>
//                         <div className="relative">
//                           <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                           <input
//                             {...register(`partHeadingHi${index}`, { required: 'Heading (Hindi) is required' })}
//                             className="w-full p-2 pl-10 border rounded"
//                           />
//                           {errors[`partHeadingHi${index}`] && (
//                             <p className="text-red-500 text-sm">{errors[`partHeadingHi${index}`].message}</p>
//                           )}
//                         </div>
//                         <label className="block font-semibold mt-2">Quote (Hindi) - Optional</label>
//                         <div className="relative">
//                           <Type size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                           <input
//                             {...register(`partQuoteHi${index}`)}
//                             className="w-full p-2 pl-10 border rounded"
//                           />
//                         </div>
//                         <label className="block font-semibold mt-2">Text (Hindi)</label>
//                         <div className="relative">
//                           <Type size={20} className="absolute left-2 top-4 text-gray-500" />
//                           <textarea
//                             {...register(`partTextHi${index}`, { required: 'Text (Hindi) is required' })}
//                             className="w-full p-2 pl-10 border rounded h-32"
//                           />
//                           {errors[`partTextHi${index}`] && (
//                             <p className="text-red-500 text-sm">{errors[`partTextHi${index}`].message}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   <div className="mt-4">
//                     <label className="block font-semibold">Part Image</label>
//                     <div className="relative">
//                       <ImageIcon size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => handleImageChange(`partImage${index}`, e.target.files[0])}
//                         className="w-full p-2 pl-10"
//                       />
//                     </div>
//                     {images[`partImage${index}`] && (
//                       <div className="mt-2 relative inline-block">
//                         <img
//                           src={typeof images[`partImage${index}`] === 'string' ? images[`partImage${index}`] : URL.createObjectURL(images[`partImage${index}`])}
//                           alt="Part Preview"
//                           className="h-20 rounded"
//                         />
//                         <X size={20} className="absolute top-0 right-0 text-red-500 cursor-pointer" onClick={() => removeImage(`partImage${index}`)} />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 onClick={addNewPart}
//                 className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
//               >
//                 <Plus size={20} /> Add Another Part
//               </button>

//               <div className="mt-6 flex gap-4">
//                 <button
//                   type="submit"
//                   className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
//                 >
//                   <Upload size={20} /> {isEditMode ? 'Update Part' : 'Add Part'}
//                 </button>
//                 {isEditMode && (
//                   <button
//                     type="button"
//                     onClick={handleDelete}
//                     className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
//                   >
//                     <Trash size={20} /> Delete Part
//                   </button>
//                 )}
//               </div>
//             </form>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default PartForm;
