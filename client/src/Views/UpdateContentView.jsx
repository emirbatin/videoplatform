import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVideoById, updateVideo } from "../Services/api";
import {
  Info,
  X,
  Save,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Upload,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import {
  platformOptions,
  qualityOptions,
  initialFormData,
  handleTagOperations,
  handlePlatformOperations,
  handleImageOperations,
  handleDownloadLinkOperations,
  handleFormDataChange,
  prepareVideoData,
} from "../Utils/videoFormUtils";

export default function UpdateContentView() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const response = await getVideoById(videoId);
      const videoData = response.data;
      setFormData({
        title: videoData.title,
        description: videoData.description || "",
        thumbnail: videoData.thumbnail,
        category: videoData.category || [],
        platforms: videoData.platforms?.length
          ? videoData.platforms
          : initialFormData.platforms,
        images: videoData.images?.length
          ? videoData.images
          : initialFormData.images,
        downloadLinks: videoData.downloadLinks?.length
          ? videoData.downloadLinks
          : initialFormData.downloadLinks,
      });
      setError(null);
    } catch (err) {
      setError("An error occurred while fetching the video.");
    }
  };

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
        throw new Error("Title and thumbnail are required fields.");
      }

      const videoData = prepareVideoData(formData);
      await updateVideo(videoId, videoData);
      setSuccess("Successfully updated the video!");

      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Video update error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar showSearchBar={false} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Update Content</h1>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 text-red-500 hover:text-white hover:bg-red-800 rounded-lg transition-colors"
          >
            Exit
          </button>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <div className="flex gap-8">
          {/* Left - Form */}
          <div className="flex-1 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Info */}
              <div className="bg-gray-800 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-xl font-semibold text-white">Info</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Content Title
                      <span className="text-red-500 ml-1">*</span>
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
                      placeholder="Please enter the title of the video"
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
                      placeholder="Please enter a description for the video"
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
                        placeholder=" Add tags (press Enter or press ,)"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleTagOperations.add(
                            tagInput,
                            formData,
                            setFormData
                          )
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
                              handleTagOperations.remove(
                                tag,
                                formData,
                                setFormData
                              )
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
                      className="bg-gray-700/50 rounded-lg p-4 space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <option value="">Choose Platform</option>
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
                          <option value="">Quality</option>
                          {qualityOptions.map((quality) => (
                            <option key={quality} value={quality}>
                              {quality}
                            </option>
                          ))}
                        </select>
                      </div>

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
                          placeholder="Video URL"
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
                      className="bg-gray-700/50 rounded-lg p-4 space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          placeholder="Link Title (ex: 1080p Versiyon)"
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
                          placeholder="Quality Info (ex: 1920x1080 • 2.1GB)"
                        />
                      </div>

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
                  className={`
                    px-6 py-3 rounded-lg text-white font-medium
                    ${
                      loading
                        ? "bg-indigo-500 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }
                    transition-colors flex items-center gap-2
                  `}
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>

          {/* Right - Preview */}
          <div className="w-96">
            <div className="sticky top-8 space-y-8">
              {/* Thumbnail */}
              <div className="bg-gray-800 rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-semibold text-white">
                      Thumbnail
                      <span className="text-red-500 ml-1">*</span>
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.thumbnail ? (
                    <div className="relative group">
                      <img
                        src={formData.thumbnail}
                        alt="Thumbnail Preview"
                        className="w-full aspect-video object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, thumbnail: "" }))
                          }
                          className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p>No Thumbnail</p>
                      </div>
                    </div>
                  )}

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
                    placeholder="Enter the URL of the thumbnail"
                    required
                  />
                </div>
              </div>

              {/* Pictures */}
              <div className="bg-gray-800 rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-semibold text-white">
                      Pictures
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleImageOperations.add(formData, setFormData)
                    }
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-600">
                  {formData.images.map((image, index) => (
                    <div key={index} className="space-y-2">
                      {image.url ? (
                        <div className="relative group">
                          <img
                            src={image.url}
                            alt={`Görsel ${index + 1}`}
                            className="w-full aspect-video object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleImageOperations.remove(
                                  index,
                                  formData,
                                  setFormData
                                )
                              }
                              className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Upload className="w-8 h-8 mx-auto mb-2" />
                            <p>No Picture</p>
                          </div>
                        </div>
                      )}

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
                        placeholder="Enter the URL of the picture"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
