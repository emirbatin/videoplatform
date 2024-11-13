import React from "react";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";

const VideoGrid = ({ videos, loading, error, onReload }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(8)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg overflow-hidden animate-pulse"
            >
              <div className="w-full aspect-video bg-gray-700" />
              <div className="p-4">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onReload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300">Henüz video bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {videos.map((video) => (
        <Link
          key={video._id}
          to={`/content?v=${video._id}`}
          className="block group bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-200"
        >
          <div className="relative w-full aspect-video overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:brightness-75 transition-all"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/60 rounded-full p-4">
                <Play className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-white font-medium line-clamp-2 group-hover:text-indigo-400 transition-colors">
              {video.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
              <span>{video.views} views</span>
              <span>•</span>
              <span>{video.timestamp}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default VideoGrid;
