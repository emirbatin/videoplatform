import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Link as LinkIcon,
  Eye,
  Clock,
  Share2,
  Info,
  Image,
} from "lucide-react";
import VideoPlayer from "../Components/VideoPlayer";
import Navbar from "../Components/Navbar";
import ImageGallery from "../Components/ImageGallery";
import DownloadSection from "../Components/DownloadSection";
import { getVideoById, incrementView } from "../Services/api";

const ContentView = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  const [copied, setCopied] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const videoId = new URLSearchParams(location.search).get("v");

  const hasValidPlatforms = (platforms) => {
    return platforms && platforms.length > 0 && platforms.some((p) => p.url);
  };

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) {
        navigate("/");
        return;
      }

      setLoading(true);
      try {
        const response = await getVideoById(videoId);
        setVideo(response.data);

        if (hasValidPlatforms(response.data.platforms)) {
          setSelectedPlatform(response.data.platforms[0].id);
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        setError("An error occurred while loading the video.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId, navigate]);

  useEffect(() => {
    const incrementViewCount = async () => {
      if (video && !hasIncrementedView) {
        try {
          const viewResponse = await incrementView(videoId);
          if (viewResponse.views) {
            setVideo((prev) => ({
              ...prev,
              views: viewResponse.views,
              timestamp: viewResponse.timestamp,
            }));
          }
          setHasIncrementedView(true);
        } catch (error) {
          console.error("Error incrementing view:", error);
        }
      }
    };

    incrementViewCount();
  }, [video, videoId, hasIncrementedView]);

  const handlePlatformChange = (platformId) => {
    setSelectedPlatform(platformId);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <main className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
          <div className="animate-pulse space-y-6">
            {/* Title skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-700 rounded w-2/3"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-700 rounded w-24"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            {/* Video player skeleton */}
            <div className="aspect-video bg-gray-700 rounded"></div>
            {/* Description skeleton */}
            <div className="space-y-4 bg-gray-800/50 p-6 rounded-xl">
              <div className="h-6 bg-gray-700 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-4/5"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-900">
        <main className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error || "Video not found"}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Return to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar showSearchBar={true} />
      <main className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <div className="w-full">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Video Title and Stats */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-white">{video.title}</h1>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {video.views}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {video.timestamp}
                </span>
              </div>
            </div>

            {/* Video Player - Only show if valid platforms exist */}
            {hasValidPlatforms(video.platforms) && (
              <VideoPlayer
                selectedPlatform={selectedPlatform}
                platforms={video.platforms}
                onPlatformChange={handlePlatformChange}
                isFullscreen={false}
              />
            )}

            {/* Content Section */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 space-y-6">
              {/* Description - Only show if video exists */}
              {video.platforms && video.platforms.length > 0
                ? video.description &&
                  video.description.trim() !== "" && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Description
                      </h2>
                      <p className="text-gray-300 leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                  )
                : null}

              {/* Images - Show at the top if there is no video */}
              {video.images && video.images.length > 0 && (
                <div
                  className={`space-y-4 ${
                    !hasValidPlatforms(video.platforms) ? "order-first" : ""
                  }`}
                >
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Images
                  </h2>
                  <ImageGallery images={video.images} />
                </div>
              )}

              {/* Download Links */}
              {video.downloadLinks && video.downloadLinks.length > 0 && (
                <DownloadSection downloadLinks={video.downloadLinks} />
              )}

              {/* Share */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContentView;
