import React, { useState, useEffect } from "react";
import { Link as LinkIcon, ChevronLeft, ChevronRight } from "lucide-react";

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-xl overflow-hidden">
        <img
          src={images[currentIndex].url}
          alt={`Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 -4 right-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === 0 ? images.length - 1 : prev - 1
            )
          }
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === images.length - 1 ? 0 : prev + 1
            )
          }
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto py-2">
        {images.map((image, idx) => (
          <button
            key={image.id}
            onClick={() => setCurrentIndex(idx)}
            className={`
                relative flex-shrink-0 w-20 aspect-video rounded-lg overflow-hidden
                ${
                  currentIndex === idx
                    ? "ring-2 ring-blue-500"
                    : "opacity-60 hover:opacity-100"
                }
              `}
          >
            <img
              src={image.thumbnail}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
