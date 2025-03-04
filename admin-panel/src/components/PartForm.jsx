import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
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

const PartForm = ({ stories, setStories }) => {
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
  const [parts, setParts] = useState([{ id: uuidv4() }]);
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
        setValue("titleEn", part.title.en);
        setValue("titleTe", part.title.te);
        setValue("dateEn", part.date.en);
        setValue("dateTe", part.date.te);
        setValue("descEn", part.description.en);
        setValue("descTe", part.description.te);
        setValue("timeEn", part.timeToRead.en);
        setValue("timeTe", part.timeToRead.te);
        setValue("typeEn", part.storyType.en);
        setValue("typeTe", part.storyType.te);

        const partFields = part.part.map((p, index) => ({
          id: p.id,
          headingEn: p.heading.en,
          headingTe: p.heading.te,
          quoteEn: p.quote.en,
          quoteTe: p.quote.te,
          textEn: p.text.en,
          textTe: p.text.te,
        }));
        setParts(partFields);
        part.part.forEach((p, index) => {
          setValue(`partHeadingEn${index}`, p.heading.en);
          setValue(`partHeadingTe${index}`, p.heading.te);
          setValue(`partQuoteEn${index}`, p.quote.en);
          setValue(`partQuoteTe${index}`, p.quote.te);
          setValue(`partTextEn${index}`, p.text.en);
          setValue(`partTextTe${index}`, p.text.te);
          if (p.image) {
            setImages((prev) => ({ ...prev, [`partImage${index}`]: p.image }));
          }
        });

        if (part.thumbnailImage) {
          setImages((prev) => ({ ...prev, thumbnailImage: part.thumbnailImage }));
        }
        if (part.coverImage) {
          setImages((prev) => ({ ...prev, coverImage: part.coverImage }));
        }
      }
    } else {
      setParts([{ id: uuidv4() }]);
    }
  }, [location, stories, setValue]);

  const addPart = async (storyName, newPart) => {
    const formData = new FormData();
    formData.append('storyId', stories.find((s) => s.name.en === storyName).id);
    formData.append('id', newPart.id);
    formData.append('titleEn', newPart.title.en || '');
    formData.append('titleTe', newPart.title.te || '');
    formData.append('dateEn', newPart.date.en || '');
    formData.append('dateTe', newPart.date.te || '');
    formData.append('descriptionEn', newPart.description.en || '');
    formData.append('descriptionTe', newPart.description.te || '');
    formData.append('timeToReadEn', newPart.timeToRead.en || '');
    formData.append('timeToReadTe', newPart.timeToRead.te || '');
    formData.append('storyTypeEn', newPart.storyType.en || '');
    formData.append('storyTypeTe', newPart.storyType.te || '');

    if (newPart.thumbnailImage && typeof newPart.thumbnailImage !== 'string') {
      formData.append('thumbnailImage', newPart.thumbnailImage);
    }
    if (newPart.coverImage && typeof newPart.coverImage !== 'string') {
      formData.append('coverImage', newPart.coverImage);
    }

    newPart.part.forEach((p, index) => {
      formData.append(`id${index}`, p.id);
      formData.append(`partHeadingEn${index}`, p.heading.en || '');
      formData.append(`partHeadingTe${index}`, p.heading.te || '');
      formData.append(`partQuoteEn${index}`, p.quote.en || '');
      formData.append(`partQuoteTe${index}`, p.quote.te || '');
      formData.append(`partTextEn${index}`, p.text.en || '');
      formData.append(`partTextTe${index}`, p.text.te || '');
      if (p.image && typeof p.image !== 'string') {
        formData.append(`partImage${index}`, p.image);
      }
    });

    try {
      const response = await axios.post('https://api.bharatstorybooks.com/api/parts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedStories = stories.map((s) =>
        s.name.en === storyName
          ? { ...s, parts: { card: [...s.parts.card, response.data.part] } }
          : s
      );
      setStories(updatedStories);
    } catch (error) {
      console.error("Error adding part:", error);
    }
  };

  const updatePart = async (storyName, partId, updatedPart) => {
    const formData = new FormData();
    formData.append('storyId', stories.find((s) => s.name.en === storyName).id);
    formData.append('partId', partId);
    formData.append('titleEn', updatedPart.title.en || '');
    formData.append('titleTe', updatedPart.title.te || '');
    formData.append('dateEn', updatedPart.date.en || '');
    formData.append('dateTe', updatedPart.date.te || '');
    formData.append('descriptionEn', updatedPart.description.en || '');
    formData.append('descriptionTe', updatedPart.description.te || '');
    formData.append('timeToReadEn', updatedPart.timeToRead.en || '');
    formData.append('timeToReadTe', updatedPart.timeToRead.te || '');
    formData.append('storyTypeEn', updatedPart.storyType.en || '');
    formData.append('storyTypeTe', updatedPart.storyType.te || '');

    if (updatedPart.thumbnailImage && typeof updatedPart.thumbnailImage !== 'string') {
      formData.append('thumbnailImage', updatedPart.thumbnailImage);
    } else if (updatedPart.thumbnailImage) {
      formData.append('thumbnailImage', updatedPart.thumbnailImage);
    }
    if (updatedPart.coverImage && typeof updatedPart.coverImage !== 'string') {
      formData.append('coverImage', updatedPart.coverImage);
    } else if (updatedPart.coverImage) {
      formData.append('coverImage', updatedPart.coverImage);
    }

    updatedPart.part.forEach((p, index) => {
      formData.append(`id${index}`, p.id);
      formData.append(`partHeadingEn${index}`, p.heading.en || '');
      formData.append(`partHeadingTe${index}`, p.heading.te || '');
      formData.append(`partQuoteEn${index}`, p.quote.en || '');
      formData.append(`partQuoteTe${index}`, p.quote.te || '');
      formData.append(`partTextEn${index}`, p.text.en || '');
      formData.append(`partTextTe${index}`, p.text.te || '');
      if (p.image && typeof p.image !== 'string') {
        formData.append(`partImage${index}`, p.image);
      } else if (p.image) {
        formData.append(`partImage${index}`, p.image);
      }
    });

    try {
      const response = await axios.post('https://api.bharatstorybooks.com/api/parts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedStories = stories.map((s) =>
        s.name.en === storyName
          ? {
              ...s,
              parts: {
                card: s.parts.card.map((p) =>
                  p.id === partId ? response.data.part : p
                ),
              },
            }
          : s
      );
      setStories(updatedStories);
    } catch (error) {
      console.error("Error updating part:", error);
    }
  };

  const deletePart = async (storyName, partId) => {
    try {
      await axios.delete(
        `https://api.bharatstorybooks.com/api/parts/${stories.find((s) => s.name.en === storyName).id}/${partId}`
      );
      const updatedStories = stories.map((s) =>
        s.name.en === storyName
          ? {
              ...s,
              parts: { card: s.parts.card.filter((p) => p.id !== partId) },
            }
          : s
      );
      setStories(updatedStories);
    } catch (error) {
      console.error("Error deleting part:", error);
    }
  };

  const onSubmit = (data) => {
    const newPart = {
      id: isEditMode ? new URLSearchParams(location.search).get('partId') : uuidv4(),
      title: { en: data.titleEn, te: data.titleTe },
      date: { en: data.dateEn, te: data.dateTe },
      thumbnailImage: images.thumbnailImage,
      coverImage: images.coverImage,
      description: { en: data.descEn, te: data.descTe },
      timeToRead: { en: data.timeEn, te: data.timeTe },
      storyType: { en: data.typeEn, te: data.typeTe },
      part: parts.map((p, index) => ({
        id: p.id,
        heading: { en: data[`partHeadingEn${index}`], te: data[`partHeadingTe${index}`] },
        quote: { en: data[`partQuoteEn${index}`] || '', te: data[`partQuoteTe${index}`] || '' },
        image: images[`partImage${index}`],
        text: { en: data[`partTextEn${index}`], te: data[`partTextTe${index}`] },
      })),
    };

    if (isEditMode) {
      updatePart(selectedStory, newPart.id, newPart);
    } else {
      addPart(selectedStory, newPart);
    }
    reset();
    setImages({});
    setParts([{ id: uuidv4() }]);
    navigate('/my-stories');
  };

  const addNewPart = () => {
    setParts((prev) => [...prev, { id: uuidv4() }]);
  };

  const removePart = (partId) => {
    setParts((prev) => prev.filter((p) => p.id !== partId));
    setImages((prev) => {
      const newImages = { ...prev };
      const index = parts.findIndex((p) => p.id === partId);
      delete newImages[`partImage${index}`];
      return newImages;
    });
  };

  const handleDelete = () => {
    const partId = new URLSearchParams(location.search).get("partId");
    deletePart(selectedStory, partId);
    navigate("/my-stories");
  };

  const handleImageChange = (field, file) => {
    setImages((prev) => ({ ...prev, [field]: file }));
  };

  const removeImage = (field) => {
    setImages((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? "Edit Part" : "Add New Part"}
      </h2>
      <div className="mb-4">
        <label className="block font-semibold">Select Story</label>
        <select
          value={selectedStory}
          onChange={(e) => setSelectedStory(e.target.value)}
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

      {selectedStory || isEditMode ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 className="text-xl font-semibold mb-2">Card Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block font-semibold">Title (English)</label>
              <div className="relative">
                <Languages
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  {...register("titleEn")}
                  className="w-full p-2 pl-10 border rounded"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block font-semibold">Title (Telugu)</label>
              <div className="relative">
                <Languages
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  {...register("titleTe")}
                  className="w-full p-2 pl-10 border rounded"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block font-semibold">Date (English)</label>
              <div className="relative">
                <Calendar
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  type="date"
                  {...register("dateEn")}
                  className="w-full p-2 pl-10 border rounded"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block font-semibold">Date (Telugu)</label>
              <div className="relative">
                <Calendar
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  type="date"
                  {...register("dateTe")}
                  className="w-full p-2 pl-10 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold">Thumbnail Image</label>
              <div className="relative">
                <ImageIcon
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange("thumbnailImage", e.target.files[0])
                  }
                  className="w-full p-2 pl-10"
                />
              </div>
              {images.thumbnailImage && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={
                      typeof images.thumbnailImage === 'string'
                        ? images.thumbnailImage
                        : URL.createObjectURL(images.thumbnailImage)
                    }
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
            </div>
            <div>
              <label className="block font-semibold">Cover Image</label>
              <div className="relative">
                <ImageIcon
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange("coverImage", e.target.files[0])
                  }
                  className="w-full p-2 pl-10"
                />
              </div>
              {images.coverImage && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={
                      typeof images.coverImage === 'string'
                        ? images.coverImage
                        : URL.createObjectURL(images.coverImage)
                    }
                    alt="Cover Preview"
                    className="h-20 rounded"
                  />
                  <X
                    size={20}
                    className="absolute top-0 right-0 text-red-500 cursor-pointer"
                    onClick={() => removeImage("coverImage")}
                  />
                </div>
              )}
            </div>
            <div className="relative">
              <label className="block font-semibold">Description (English)</label>
              <div className="relative">
                <Type size={20} className="absolute left-2 top-4 text-gray-500" />
                <textarea
                  {...register("descEn")}
                  className="w-full p-2 pl-10 border rounded h-24"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block font-semibold">Description (Telugu)</label>
              <div className="relative">
                <Type size={20} className="absolute left-2 top-4 text-gray-500" />
                <textarea
                  {...register("descTe")}
                  className="w-full p-2 pl-10 border rounded h-24"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block font-semibold">Time to Read (English)</label>
              <div className="relative">
                <Clock
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  {...register("timeEn")}
                  className="w-full p-2 pl-10 border rounded"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block font-semibold">Time to Read (Telugu)</label>
              <div className="relative">
                <Clock
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  {...register("timeTe")}
                  className="w-full p-2 pl-10 border rounded"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block font-semibold">Story Type (English)</label>
              <div className="relative">
                <Type
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  {...register("typeEn")}
                  className="w-full p-2 pl-10 border rounded"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block font-semibold">Story Type (Telugu)</label>
              <div className="relative">
                <Type
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  {...register("typeTe")}
                  className="w-full p-2 pl-10 border rounded"
                />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-4 mb-2">Part Details</h3>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block font-semibold">Heading (English)</label>
                  <div className="relative">
                    <Languages
                      size={20}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    />
                    <input
                      {...register(`partHeadingEn${index}`)}
                      className="w-full p-2 pl-10 border rounded"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block font-semibold">Heading (Telugu)</label>
                  <div className="relative">
                    <Languages
                      size={20}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    />
                    <input
                      {...register(`partHeadingTe${index}`)}
                      className="w-full p-2 pl-10 border rounded"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block font-semibold">Quote (English) - Optional</label>
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
                </div>
                <div className="relative">
                  <label className="block font-semibold">Quote (Telugu) - Optional</label>
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
                </div>
                <div>
                  <label className="block font-semibold">Image</label>
                  <div className="relative">
                    <ImageIcon
                      size={20}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageChange(`partImage${index}`, e.target.files[0])
                      }
                      className="w-full p-2 pl-10"
                    />
                  </div>
                  {images[`partImage${index}`] && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={
                          typeof images[`partImage${index}`] === 'string'
                            ? images[`partImage${index}`]
                            : URL.createObjectURL(images[`partImage${index}`])
                        }
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
                </div>
                <div></div>
                <div className="relative">
                  <label className="block font-semibold">Text (English)</label>
                  <div className="relative">
                    <Type
                      size={20}
                      className="absolute left-2 top-4 text-gray-500"
                    />
                    <textarea
                      {...register(`partTextEn${index}`)}
                      className="w-full p-2 pl-10 border rounded h-32"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block font-semibold">Text (Telugu)</label>
                  <div className="relative">
                    <Type
                      size={20}
                      className="absolute left-2 top-4 text-gray-500"
                    />
                    <textarea
                      {...register(`partTextTe${index}`)}
                      className="w-full p-2 pl-10 border rounded h-32"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addNewPart}
            className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Another Part
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
      ) : (
        <p className="text-gray-500">Please select a story to add a part.</p>
      )}
    </div>
  );
};

export default PartForm;