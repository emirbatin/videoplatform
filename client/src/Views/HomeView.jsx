import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, TrendingUp } from "lucide-react";

//Components
import Pagination from "../Components/Pagination";
import Navbar from "../Components/Navbar";
import VideoGrid from "../Components/VideoGrid";

//Services
import {
  getVideos,
  getPopularCategories,
  getFeaturedVideo,
} from "../Services/api";

const HomeView = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const itemsPerPage = 8;


  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await getVideos(
          currentPage,
          itemsPerPage,
          selectedCategory
        );
        setVideos(response.data.videos);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getPopularCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchFeaturedVideo = async () => {
      setFeaturedLoading(true);
      try {
        const response = await getFeaturedVideo();
        setFeaturedVideo(response.data);
      } catch (error) {
        console.error("Error fetching featured video:", error);
        setFeaturedVideo({
          title: "Video not found",
          description: "Currently, there is no featured video.",
          thumbnail: {
            url: "https://cdn.pixabay.com/photo/2022/12/01/04/40/backpacker-7628303_1280.jpg",
          },
        });
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeaturedVideo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar showSearchBar={true} />

      <main className="relative top-[-10vh]">
        <div className="relative h-[70vh] overflow-hidden">
          {featuredLoading ? (
            <div className="w-full h-full bg-gray-800 animate-pulse" />
          ) : (
            <>
              <img
                src={featuredVideo?.thumbnail?.url || featuredVideo?.thumbnail}
                alt={featuredVideo?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-4">
                      {featuredVideo?.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-300 mb-4">
                      <span>{featuredVideo?.views} views</span>
                      <span>•</span>
                      <span>{featuredVideo?.timestamp}</span>
                    </div>
                    <p className="text-xl text-gray-200 mb-6 max-w-3xl">
                      {featuredVideo?.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/content?v=${featuredVideo?._id}`}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Play className="w-5 h-5" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 pb-2">
            {categories.map((category) => (
              <button
                key={category.id || "all"}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content with Side Ad */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  All Content
                </h2>

                <Link
                  to="/videos"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  See All
                </Link>
              </div>

              <VideoGrid videos={videos} loading={loading} error={error} />

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
        </div>
      </main>
    </div>
  );
};

export default HomeView;
