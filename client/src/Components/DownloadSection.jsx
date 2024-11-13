import React, { useState, useEffect } from "react";
import {
  Download,
  Link as LinkIcon,
  Play,
} from "lucide-react";

const DownloadSection = ({ downloadLinks }) => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Download className="w-5 h-5" />
        Download Links
      </h2>
      <div className="grid gap-3">
        {downloadLinks.map((link, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-700/50 backdrop-blur p-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">{link.title}</h3>
                <p className="text-sm text-gray-400">{link.quality}</p>
              </div>
            </div>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );

export default DownloadSection