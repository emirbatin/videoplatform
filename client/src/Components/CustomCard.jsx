import React from "react";

const CustomCard = ({ title, text, link, buttonText, imageUrl }) => {
  return (
    <div className="relative max-w-sm overflow-hidden rounded-xl bg-white">
      <div className="relative h-64">
        <img
          src={imageUrl || "/api/placeholder/400/300"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="p-5 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>

        <p className="text-sm text-gray-500 line-clamp-2">{text}</p>

        <a
          href={link}
          className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-700 group"
        >
          {buttonText}
          <svg
            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default CustomCard;
