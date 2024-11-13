import React, { useState, useEffect } from "react";
import {
  LinkIcon,
  Video,
  Plus,
  X,
  Save,
  Info,
  ImageIcon,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  ThumbsUp,
  Share2,
  Loader,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import { getVideos, deleteVideo } from "../Services/api";
import { useNavigate } from "react-router-dom";

export default function AdminView() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, [page]);

  const fetchVideos = async () => {
    try {
      const response = await getVideos(page, 10);
      const newVideos = response.data.videos;
      setVideos((prev) => (page === 1 ? newVideos : [...prev, ...newVideos]));
      setHasMore(newVideos.length === 10);
      setError(null);
    } catch (err) {
      setError("An error occurred while loading videos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteVideo(_id);
        setVideos((prev) => prev.filter((video) => video._id !== _id));
        setSuccess("Video successfully deleted");
        setTimeout(() => setSuccess(null), 5000);
      } catch (err) {
        setError("An error occurred while deleting the video");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar showSearchBar={false} />

      <main className="relative pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Video Management</h1>
            <button
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              onClick={() => {
                router("/admin/video/upload");
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Content
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
              <p className="text-green-200">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Videos List */}
          <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      Thumbnail
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      Statistics
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {videos.map((video) => (
                    <tr
                      key={video._id}
                      className="hover:bg-gray-700/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="w-40 h-24 rounded-lg overflow-hidden bg-gray-700">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <h3 className="text-white font-medium">
                          {video.title}
                        </h3>
                        <div className="flex items-center mt-1 text-gray-400 text-sm">
                          <Video className="w-4 h-4 mr-1" />
                          <span>{video.duration}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            <span>{video.views}</span>
                          </div>
                          <div className="flex items-center">
                            <Share2 className="w-4 h-4 mr-1" />
                            <span>{video.shares}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(video.createdAt).toLocaleDateString("en-US")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end space-x-3">
                          <button
                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors duration-200"
                            title="Edit"
                            onClick={() => {
                              router(`/admin/video/edit/${video._id}`);
                            }}
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-200"
                            title="Delete"
                            onClick={() => handleDelete(video._id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Loading & Load More */}
            <div className="px-6 py-4 border-t border-gray-700">
              {loading ? (
                <div className="flex justify-center">
                  <Loader className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              ) : (
                hasMore && (
                  <button
                    className="w-full py-2 text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Load More
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
