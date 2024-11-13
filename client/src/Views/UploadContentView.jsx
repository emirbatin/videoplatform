import React, { useState } from "react";
import {
  Link as LinkIcon,
  Video,
  Plus,
  X,
  Save,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import { addVideo } from "../Services/api";
import {
  platformOptions,
  qualityOptions,
  initialFormData,
  generateId,
  handleTagOperations,
  handlePlatformOperations,
  handleImageOperations,
  handleDownloadLinkOperations,
  handleFormDataChange,
  prepareVideoData,
} from "../Utils/videoFormUtils";

export default function UploadContentView() {
  const [formData, setFormData] = useState(initialFormData);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (handleTagOperations.add(tagInput, formData, setFormData)) {
        setTagInput("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.title || !formData.thumbnail) {
        throw new Error("Title and thumbnail are required");
      }

      const videoData = prepareVideoData(formData);
      await addVideo(videoData);
      setSuccess(true);
      setFormData(initialFormData);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Video upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar showSearchBar={false} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500">
            Video successfully added!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-white">Upload Content</h1>
              <button
                onClick={() => navigate("/admin")}
                className="px-4 py-2 text-red-500 hover:text-white hover:bg-red-800 rounded-lg transition-colors"
              >
                Exit
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-semibold text-white">
                Basic Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    handleFormDataChange(
                      "title",
                      e.target.value,
                      formData,
                      setFormData
                    )
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleFormDataChange(
                      "description",
                      e.target.value,
                      formData,
                      setFormData
                    )
                  }
                  rows={4}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter video description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tags
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyPress={handleTagInputKeyPress}
                    className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Use Enter or comma to add tags"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleTagOperations.add(tagInput, formData, setFormData)
                    }
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.category.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-indigo-500 text-white px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() =>
                          handleTagOperations.remove(tag, formData, setFormData)
                        }
                        className="text-white hover:text-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-gray-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-semibold text-white">Thumbnail</h2>
            </div>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) =>
                handleFormDataChange(
                  "thumbnail",
                  e.target.value,
                  formData,
                  setFormData
                )
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter thumbnail URL"
              required
            />
          </div>

          {/* Images */}
          <div className="bg-gray-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-semibold text-white">Images</h2>
            </div>
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center gap-4 mb-2">
                <input
                  type="url"
                  value={image.url}
                  onChange={(e) =>
                    handleImageOperations.change(
                      index,
                      e.target.value,
                      formData,
                      setFormData
                    )
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter image URL"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    handleImageOperations.remove(index, formData, setFormData)
                  }
                  className="p-2.5 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleImageOperations.add(formData, setFormData)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Image
            </button>
          </div>

          {/* Platform Links */}
          <div className="bg-gray-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-semibold text-white">
                  Platform Links
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  handlePlatformOperations.add(formData, setFormData)
                }
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Platform
              </button>
            </div>

            <div className="space-y-4">
              {formData.platforms.map((platform, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <select
                    value={platform.id}
                    onChange={(e) =>
                      handlePlatformOperations.change(
                        index,
                        "id",
                        e.target.value,
                        formData,
                        setFormData
                      )
                    }
                    className="bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select Platform</option>
                    {platformOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={platform.quality}
                    onChange={(e) =>
                      handlePlatformOperations.change(
                        index,
                        "quality",
                        e.target.value,
                        formData,
                        setFormData
                      )
                    }
                    className="bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {qualityOptions.map((quality) => (
                      <option key={quality} value={quality}>
                        {quality}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={platform.url}
                      onChange={(e) =>
                        handlePlatformOperations.change(
                          index,
                          "url",
                          e.target.value,
                          formData,
                          setFormData
                        )
                      }
                      className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder={
                        platformOptions.find((p) => p.id === platform.id)
                          ?.placeholderText || "Video URL"
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handlePlatformOperations.remove(
                          index,
                          formData,
                          setFormData
                        )
                      }
                      className="p-2.5 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download Links */}
          <div className="bg-gray-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-semibold text-white">
                  Download Links
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleDownloadLinkOperations.add(formData, setFormData)
                }
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Link
              </button>
            </div>

            <div className="space-y-4">
              {formData.downloadLinks.map((link, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) =>
                      handleDownloadLinkOperations.change(
                        index,
                        "title",
                        e.target.value,
                        formData,
                        setFormData
                      )
                    }
                    className="bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Link Title"
                    required
                  />

                  <input
                    type="text"
                    value={link.quality}
                    onChange={(e) =>
                      handleDownloadLinkOperations.change(
                        index,
                        "quality",
                        e.target.value,
                        formData,
                        setFormData
                      )
                    }
                    className="bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Quality Information"
                    required
                  />

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        handleDownloadLinkOperations.change(
                          index,
                          "url",
                          e.target.value,
                          formData,
                          setFormData
                        )
                      }
                      className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Download URL"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadLinkOperations.remove(
                          index,
                          formData,
                          setFormData
                        )
                      }
                      className="p-2.5 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                loading
                  ? "bg-indigo-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } transition-colors flex items-center gap-2`}
            >
              <Save className="w-5 h-5" />
              {loading ? "Loading..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
