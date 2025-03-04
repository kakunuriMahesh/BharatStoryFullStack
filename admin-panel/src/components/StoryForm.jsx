import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Languages, Image as ImageIcon } from 'lucide-react';

const StoryForm = ({ addStory }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [images, setImages] = useState({ storyCoverImage: null, bannerImge: null });
  const navigate = useNavigate();

  // const onSubmit = (data) => {
  //   const newStory = {
  //     id: uuidv4(),
  //     name: { en: data.nameEn, te: data.nameTe },
  //     storyCoverImage: images.storyCoverImage ? URL.createObjectURL(images.storyCoverImage) : '',
  //     bannerImge: images.bannerImge ? URL.createObjectURL(images.bannerImge) : '',
  //     parts: { card: [] },
  //   };
  //   addStory(newStory);
  // };

  // const handleImageChange = (field, file) => {
  //   setImages((prev) => ({ ...prev, [field]: file }));
  // };


  const onSubmit = (data) => {
    const newStory = {
      name: { en: data.nameEn, te: data.nameTe },
      storyCoverImage: images.storyCoverImage,
      bannerImge: images.bannerImge,
    };
    addStory(newStory);
  };
  
  const handleImageChange = (field, file) => {
    setImages((prev) => ({ ...prev, [field]: file }));
  };


  const removeImage = (field) => {
    setImages((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h2 className="text-2xl font-bold mb-4">Add New Story</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block font-semibold">Name (English)</label>
          <div className="relative">
            <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              {...register('nameEn', {
                required: 'This field is required',
                pattern: { value: /^[A-Za-z\s]+$/, message: 'Only English letters allowed' },
              })}
              className="w-full p-2 pl-10 border rounded"
            />
          </div>
          {errors.nameEn && <p className="text-red-500 text-sm">{errors.nameEn.message}</p>}
        </div>
        <div className="relative">
          <label className="block font-semibold">Name (Telugu)</label>
          <div className="relative">
            <Languages size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              {...register('nameTe', {
                required: 'This field is required',
                pattern: { value: /^[\u0C00-\u0C7F\s0-9A-Za-z]+$/, message: 'Only Telugu characters, numbers, and English letters allowed' },
              })}
              className="w-full p-2 pl-10 border rounded"
            />
          </div>
          {errors.nameTe && <p className="text-red-500 text-sm">{errors.nameTe.message}</p>}
        </div>
        <div>
          <label className="block font-semibold">Story Cover Image</label>
          <div className="relative">
            <ImageIcon size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="file"
              {...register('storyCoverImage')}
              accept="image/*"
              onChange={(e) => handleImageChange('storyCoverImage', e.target.files[0])}
              className="w-full p-2 pl-10"
            />
          </div>
          {images.storyCoverImage && (
            <div className="mt-2 relative inline-block">
              <img src={URL.createObjectURL(images.storyCoverImage)} alt="Preview" className="h-20 rounded" />
              <X
                size={20}
                className="absolute top-0 right-0 text-red-500 cursor-pointer"
                onClick={() => removeImage('storyCoverImage')}
              />
            </div>
          )}
        </div>
        <div>
          <label className="block font-semibold">Banner Image</label>
          <div className="relative">
            <ImageIcon size={20} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="file"
              {...register('bannerImge')}
              accept="image/*"
              onChange={(e) => handleImageChange('bannerImge', e.target.files[0])}
              className="w-full p-2 pl-10"
            />
          </div>
          {images.bannerImge && (
            <div className="mt-2 relative inline-block">
              <img src={URL.createObjectURL(images.bannerImge)} alt="Preview" className="h-20 rounded" />
              <X
                size={20}
                className="absolute top-0 right-0 text-red-500 cursor-pointer"
                onClick={() => removeImage('bannerImge')}
              />
            </div>
          )}
        </div>
      </div>
      <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
        <Upload size={20} /> Add Story & Proceed
      </button>
    </form>
  );
};

export default StoryForm;


