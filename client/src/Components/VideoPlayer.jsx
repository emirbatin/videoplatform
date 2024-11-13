import React, { useState, useRef, useEffect } from "react";
import { Play, Loader } from "lucide-react";
import VideoJS from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";

const getPlatformVideoUrl = (platform, url) => {
  switch (platform.toLowerCase()) {
    case "youtube":
      const youtubeId = url.match(
        /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\?]*)/
      )?.[1];
      return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : url;

    case "dailymotion":
      const dailymotionId = url.match(
        /^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/
      )?.[2];
      return dailymotionId
        ? `https://www.dailymotion.com/embed/video/${dailymotionId}`
        : url;

    case "gdrive":
      if (url.includes("drive.google.com")) {
        const fileId = url.match(/[-\w]{25,}/);
        return fileId
          ? `https://drive.google.com/file/d/${fileId[0]}/preview`
          : url;
      }
      return url;

    case "vimeo":
      const vimeoId = url.match(/vimeo\.com\/([0-9]+)/)?.[1];
      return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : url;

    default:
      return url;
  }
};

const VideoPlayer = ({
  selectedPlatform,
  platforms,
  onPlatformChange,
  isFullscreen,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const videoRef = useRef(null);

  const currentPlatform = platforms.find((p) => p.id === selectedPlatform);
  const selectedPlatformUrl = currentPlatform?.url;
  const processedUrl = selectedPlatformUrl
    ? getPlatformVideoUrl(currentPlatform.id, selectedPlatformUrl)
    : null;

  const isEmbeddedPlatform = [
    "youtube",
    "dailymotion",
    "gdrive",
    "vimeo",
  ].includes(currentPlatform?.id.toLowerCase());

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    if (isEmbeddedPlatform) {
      setIsLoading(false);
    }
  }, [selectedPlatform, isEmbeddedPlatform]);

  const PlatformButtons = () => (
    <div className="p-4 border-t border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">
          Alternative Sources
        </h3>
        {selectedPlatform && (
          <span className="text-xs text-gray-500">
            {currentPlatform?.quality}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => {
              onPlatformChange(platform.id);
            }}
            className={`
              px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5
              ${
                platform.id === selectedPlatform
                  ? `${platform.bgColor} text-white`
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }
            `}
          >
            {isLoading &&
            platform.id === selectedPlatform &&
            !isEmbeddedPlatform ? (
              <Loader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              platform.icon || <Play className="w-3.5 h-3.5" />
            )}
            {platform.name}
          </button>
        ))}
      </div>
    </div>
  );

  if (!selectedPlatform) {
    return (
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="relative w-full aspect-video">
          <div className="flex items-center justify-center h-full bg-gray-800 text-gray-400 text-lg">
            İzlemek için platform seçin
          </div>
        </div>
        <PlatformButtons />
      </div>
    );
  }

  if (isEmbeddedPlatform && processedUrl) {
    return (
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="relative w-full aspect-video">
          <iframe
            src={processedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
        <PlatformButtons />
      </div>
    );
  }

  const videoJsOptions = {
    autoplay: false,
    controls: !adStates.video,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: selectedPlatformUrl,
        type: "video/mp4",
      },
    ],
    playbackRates: [0.5, 1, 1.5, 2],
    controlBar: {
      children: [
        "playToggle",
        "volumePanel",
        "currentTimeDisplay",
        "timeDivider",
        "durationDisplay",
        "progressControl",
        "playbackRateMenuButton",
        "qualitySelector",
        "fullscreenToggle",
      ],
    },
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    player.on("play", () => {
      setIsPlaying(true);
      if (!adStates.video) {
        adControls.toggle.video(true);
      }
    });

    player.on("pause", () => {
      setIsPlaying(false);
    });

    player.on("loadeddata", () => {
      setIsLoading(false);
    });

    player.on("error", () => {
      setIsLoading(false);
      setError("Video yüklenirken bir hata oluştu.");
    });
  };

  useEffect(() => {
    if (!isEmbeddedPlatform && videoRef.current) {
      const player = VideoJS(videoRef.current, videoJsOptions, () => {
        handlePlayerReady(player);
      });

      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
        }
      };
    }
  }, [selectedPlatformUrl, isEmbeddedPlatform]);

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="relative w-full aspect-video">
        <div data-vjs-player>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered vjs-theme-city"
          />
        </div>

        {isLoading && !isEmbeddedPlatform && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}
      </div>
      <PlatformButtons />
    </div>
  );
};

export default VideoPlayer;
