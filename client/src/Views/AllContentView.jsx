import React, { useState, useEffect } from "react";
import { getVideos } from "../Services/api";
import Navbar from "../Components/Navbar";
import VideoGrid from "../Components/VideoGrid";
import Pagination from "../Components/Pagination";

export default function AllContentView() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);

  const itemsPerPage = 12;

  useEffect(() => {
    fetchVideos(currentPage);
  }, [currentPage]);

  const fetchVideos = async (page) => {
    try {
      setLoading(true);
      const response = await getVideos(page, itemsPerPage);
      setVideos(response.data.videos);
      setTotalPages(response.data.totalPages);
      setTotalVideos(response.data.totalVideos);
      setError(null);
    } catch (err) {
      setError("An error occurred while loading videos.");
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">All Videos</h1>
            <p className="text-gray-400">Total {totalVideos} videos</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 mb-8">
            {error}
          </div>
        )}

        {/* Video Grid */}
        <VideoGrid videos={videos} />

        {/* Pagination */}
        {!loading && !error && videos.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
