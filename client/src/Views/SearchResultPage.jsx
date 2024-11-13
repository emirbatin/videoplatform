import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Loader2, SlidersHorizontal } from "lucide-react";
import {
  searchVideos,
  SORT_OPTIONS,
  TIME_RANGES,
  QUALITY_OPTIONS,
} from "../Services/api";
import Navbar from "../Components/Navbar";
import Pagination from "../Components/Pagination";
import VideoGrid from "../Components/VideoGrid";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get("q");
  const currentPage = parseInt(searchParams.get("page") || "1");
  const sortBy = searchParams.get("sortBy") || "date";
  const timeRange = searchParams.get("timeRange") || "";
  const quality = searchParams.get("quality") || "";
  const platform = searchParams.get("platform") || "";

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      setLoading(true);
      setError(null);

      try {
        const response = await searchVideos({
          q: query,
          page: currentPage,
          limit: 8,
          sortBy,
          timeRange,
          quality,
          platform,
        });

        setVideos(response.data.videos);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Search error:", error);
        setError("An error occurred while loading search results.");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage, sortBy, timeRange, quality, platform]);

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      return prev;
    });
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (filterType, value) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(filterType, value);
      } else {
        prev.delete(filterType);
      }
      prev.set("page", "1");
      return prev;
    });
  };

  // Filter Section
  const FilterSection = () => (
    <div
      className={`mb-6 bg-gray-800 p-4 rounded-lg ${
        showFilters ? "block" : "hidden"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Sorting */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
          >
            {Object.entries(SORT_OPTIONS).map(([key, value]) => (
              <option key={value} value={value}>
                {key === "DATE"
                  ? "Newest"
                  : key === "OLDEST"
                  ? "Oldest"
                  : key === "VIEWS"
                  ? "Most Viewed"
                  : key === "LIKES"
                  ? "Most Liked"
                  : "Most Downloaded"}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => handleFilterChange("timeRange", e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
          >
            <option value="">All Time</option>
            {Object.entries(TIME_RANGES).map(([key, value]) => (
              <option key={value} value={value}>
                {key === "TODAY"
                  ? "Today"
                  : key === "WEEK"
                  ? "This Week"
                  : key === "MONTH"
                  ? "This Month"
                  : "This Year"}
              </option>
            ))}
          </select>
        </div>

        {/* Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Quality
          </label>
          <select
            value={quality}
            onChange={(e) => handleFilterChange("quality", e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
          >
            <option value="">All Qualities</option>
            {Object.entries(QUALITY_OPTIONS).map(([key, value]) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar showSearchBar={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-200">
              Enter a term to search
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar showSearchBar={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center border-b border-gray-700 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Search results for "{query}"
            </h1>
            {!loading && videos.length > 0 && (
              <p className="mt-2 text-sm text-gray-400">
                A total of {videos.length} results found
              </p>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <FilterSection />

        <VideoGrid
          videos={videos}
          loading={loading}
          error={error}
          onReload={() => window.location.reload()}
        />

        {totalPages > 1 && (
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
};

export default SearchPage;
