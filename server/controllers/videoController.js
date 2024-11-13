const Video = require("../models/videoModel");
const ViewHistory = require("../models/videoHistoryModel");
const generateSlug = require("../utils/generateSlug");
const categoryController = require("./categoryController");

const videoController = {
  getAllVideos: async (req, res) => {
    const { page = 1, limit = 8, category } = req.query;
    try {
      const query = category ? { "category.id": category } : {};

      const videos = await Video.find(query)
        .select("title thumbnail views createdAt category")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      const totalVideos = await Video.countDocuments(query);

      const formattedVideos = videos.map((video) => ({
        ...video,
        views: formatViews(video.views),
        timestamp: getTimeAgo(video.createdAt),
      }));

      res.json({
        videos: formattedVideos,
        totalPages: Math.ceil(totalVideos / limit),
        currentPage: parseInt(page),
        totalVideos,
      });
    } catch (error) {
      console.error("Error in getAllVideos:", error);
      res.status(500).json({
        message: "Videolar listelenirken hata oluştu.",
        error: error.message,
      });
    }
  },

  getVideoById: async (req, res) => {
    try {
      const videoId = req.query.v || req.params.id;
      if (!videoId) {
        return res.status(400).json({ message: "Video ID gerekli." });
      }

      const video = await Video.findById(videoId).lean();

      if (!video) {
        return res.status(404).json({ message: "Video bulunamadı." });
      }

      if (video.category && video.category.id) {
        await categoryController.incrementCategoryView(video.category.id);
      }

      const formattedVideo = {
        ...video,
        views: formatViews(video.views),
        timestamp: getTimeAgo(video.createdAt),
      };

      res.json(formattedVideo);
    } catch (error) {
      console.error("Error in getVideoById:", error);
      res.status(500).json({
        message: "Video getirilirken hata oluştu.",
        error: error.message,
      });
    }
  },

  createVideo: async (req, res) => {
    try {
      const {
        title,
        description,
        thumbnail,
        category,
        platforms,
        downloadLinks,
        images,
      } = req.body;

      const parsedCategory =
        Array.isArray(category) && category.length > 0
          ? category.map((item) =>
              typeof item === "string" ? JSON.parse(item) : item
            )
          : [];

      const parsedPlatforms =
        typeof platforms === "string" ? JSON.parse(platforms) : platforms || [];
      const parsedDownloadLinks =
        typeof downloadLinks === "string"
          ? JSON.parse(downloadLinks)
          : downloadLinks || [];
      const parsedImages =
        typeof images === "string" ? JSON.parse(images) : images || [];

      if (!title || !description || !thumbnail) {
        return res.status(400).json({
          message: "Başlık, açıklama ve thumbnail zorunludur.",
        });
      }

      const video = new Video({
        title,
        description,
        thumbnail,
        category: parsedCategory,
        platforms: parsedPlatforms,
        images: parsedImages,
        downloadLinks: parsedDownloadLinks,
        slug: generateSlug(title),
        views: 0,
        statistics: {
          likes: 0,
          shares: 0,
          downloads: 0,
        },
      });

      await video.save();
      res.status(201).json(video);
    } catch (error) {
      console.error("Error in createVideo:", error);
      res.status(500).json({
        message: "Video eklenirken hata oluştu.",
        error: error.message,
      });
    }
  },

  updateVideo: async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        platforms,
        downloadLinks,
        thumbnail,
        images,
      } = req.body;

      let updates = {};

      if (title) {
        updates.title = title;
        updates.slug = generateSlug(title);
      }
      if (description) updates.description = description;

      if (category) {
        updates.category =
          typeof category === "string" ? JSON.parse(category) : category;

        if (!Array.isArray(updates.category)) {
          updates.category = [updates.category];
        }

        updates.category = updates.category.map((cat) => ({
          id: cat.id,
          name: cat.name,
          active: cat.active ?? true,
        }));
      }

      if (platforms) {
        updates.platforms =
          typeof platforms === "string" ? JSON.parse(platforms) : platforms;
      }

      if (downloadLinks) {
        updates.downloadLinks =
          typeof downloadLinks === "string"
            ? JSON.parse(downloadLinks)
            : downloadLinks;
      }

      if (thumbnail) {
        updates.thumbnail = thumbnail;
      }

      if (images) {
        updates.images =
          typeof images === "string" ? JSON.parse(images) : images;
      }

      const video = await Video.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });

      if (!video) {
        return res.status(404).json({ message: "Video bulunamadı." });
      }

      res.json(video);
    } catch (error) {
      console.error("Error in updateVideo:", error);
      res.status(500).json({
        message: "Video güncellenirken hata oluştu.",
        error: error.message,
      });
    }
  },

  deleteVideo: async (req, res) => {
    console.log("Request Params: ", req.params);
    console.log("Deleting video with ID:", req.params.id);
    try {
      const video = await Video.findById(req.params.id);

      if (!video) {
        return res.status(404).json({ message: "Video bulunamadı." });
      }

      const categoryInfo = video.category;

      await video.deleteOne();

      if (categoryInfo && categoryInfo.id) {
        await categoryController.updateCategoryStats(
          categoryInfo.id,
          categoryInfo.name
        );
      }

      res.json({ message: "Video başarıyla silindi." });
    } catch (error) {
      console.error("Error in deleteVideo:", error);
      res.status(500).json({
        message: "Video silinirken hata oluştu.",
        error: error.message,
      });
    }
  },

  getFeaturedVideo: async (req, res) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const featuredVideo = await Video.findOne({
        createdAt: { $gte: sevenDaysAgo },
      })
        .sort({ views: -1 })
        .select("title description thumbnail views createdAt")
        .lean();

      if (!featuredVideo) {
        const allTimeFeatured = await Video.findOne()
          .sort({ views: -1 })
          .select("title description thumbnail views createdAt")
          .lean();

        if (!allTimeFeatured) {
          return res
            .status(404)
            .json({ message: "Öne çıkan video bulunamadı." });
        }

        return res.json({
          ...allTimeFeatured,
          views: formatViews(allTimeFeatured.views),
          timestamp: getTimeAgo(allTimeFeatured.createdAt),
        });
      }

      res.json({
        ...featuredVideo,
        views: formatViews(featuredVideo.views),
        timestamp: getTimeAgo(featuredVideo.createdAt),
      });
    } catch (error) {
      console.error("Error in getFeaturedVideo:", error);
      res.status(500).json({
        message: "Öne çıkan video getirilirken hata oluştu.",
        error: error.message,
      });
    }
  },

  incrementView: async (req, res) => {
    try {
      const videoId = req.params.id;
      const ip = req.ip || req.connection.remoteAddress;
      const userId = req.user?._id || null;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video bulunamadı." });
      }

      const isNewView = await video.addView(ip, userId);

      if (!isNewView) {
        return res.json({
          message: "Video zaten izlenmiş.",
          views: video.formattedViews,
          timestamp: video.timestamp,
        });
      }

      if (video.category?.length > 0) {
        for (const cat of video.category) {
          if (cat.active) {
            await categoryController.updateCategoryStats(cat.id, cat.name);
          }
        }
      }

      res.json({
        message: "İzlenme sayısı artırıldı.",
        views: video.formattedViews,
        timestamp: video.timestamp,
      });
    } catch (error) {
      console.error("Error in incrementView:", error);
      res.status(500).json({
        message: "İzlenme sayısı artırılırken hata oluştu.",
        error: error.message,
      });
    }
  },

  searchVideos: async (req, res) => {
    try {
      const {
        q,
        page = 1,
        limit = 8,
        sortBy = "date",
        category,
        platform,
        quality,
        timeRange,
      } = req.query;

      let query = {};

      if (q) {
        const normalizedQuery = normalizeSearchTerm(q);

        const words = normalizedQuery
          .split(/\s+/)
          .filter((word) => word.length > 2);

        const searchPatterns = [];

        searchPatterns.push(
          { title: { $regex: normalizedQuery, $options: "i" } },
          { description: { $regex: normalizedQuery, $options: "i" } }
        );

        words.forEach((word) => {
          const variations = generateSimilarPatterns(word);

          variations.forEach((variant) => {
            searchPatterns.push(
              { title: { $regex: variant, $options: "i" } },
              { description: { $regex: variant, $options: "i" } }
            );
          });
        });

        query.$or = searchPatterns;
      }

      if (category) {
        query["category"] = {
          $elemMatch: {
            id: category,
            active: true,
          },
        };
      }

      if (platform) {
        query["platforms.name"] = platform;
      }

      if (quality) {
        query["platforms.quality"] = quality;
      }

      if (timeRange) {
        const now = new Date();
        switch (timeRange) {
          case "today":
            query.createdAt = {
              $gte: new Date(now.setDate(now.getDate() - 1)),
            };
            break;
          case "week":
            query.createdAt = {
              $gte: new Date(now.setDate(now.getDate() - 7)),
            };
            break;
          case "month":
            query.createdAt = {
              $gte: new Date(now.setMonth(now.getMonth() - 1)),
            };
            break;
          case "year":
            query.createdAt = {
              $gte: new Date(now.setFullYear(now.getFullYear() - 1)),
            };
            break;
        }
      }

      let sortOptions = {};
      switch (sortBy) {
        case "views":
          sortOptions = { views: -1 };
          break;
        case "likes":
          sortOptions = { "statistics.likes": -1 };
          break;
        case "downloads":
          sortOptions = { "statistics.downloads": -1 };
          break;
        case "oldest":
          sortOptions = { createdAt: 1 };
          break;
        case "date":
        default:
          sortOptions = { createdAt: -1 };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNumber = parseInt(limit);

      const [videos, totalVideos, filters] = await Promise.all([
        Video.find(query)
          .select(
            "title thumbnail views createdAt category platforms statistics description"
          )
          .sort(sortOptions)
          .limit(limitNumber)
          .skip(skip)
          .lean(),

        Video.countDocuments(query),

        getSearchFilters(q),
      ]);

      const formattedVideos = videos.map((video) => ({
        ...video,
        views: formatViews(video.views),
        timestamp: getTimeAgo(video.createdAt),
        platforms: video.platforms?.map((p) => ({
          ...p,
          qualityBadgeColor: getQualityBadgeColor(p.quality),
        })),
      }));

      const stats = {
        totalResults: totalVideos,
        availablePlatforms: filters.platforms.length,
        availableQualities: filters.qualities.length,
        resultsInThisPage: videos.length,
        searchTerm: q ? normalizeSearchTerm(q) : null,
        appliedFilters: {
          category: category || null,
          platform: platform || null,
          quality: quality || null,
          timeRange: timeRange || null,
          sortBy: sortBy || "date",
        },
      };

      res.json({
        videos: formattedVideos,
        totalPages: Math.ceil(totalVideos / limit),
        currentPage: parseInt(page),
        totalVideos,
        filters,
        stats,
        pagination: {
          hasNextPage: skip + videos.length < totalVideos,
          hasPreviousPage: page > 1,
          totalPages: Math.ceil(totalVideos / limit),
          currentPage: parseInt(page),
          pageSize: limitNumber,
          totalResults: totalVideos,
        },
      });
    } catch (error) {
      console.error("Error in searchVideos:", error);
      res.status(500).json({
        success: false,
        message: "Video arama sırasında hata oluştu.",
        error: error.message,
      });
    }
  },

  getVideosByCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 8 } = req.query;

      const query = { "category.id": id };

      const videos = await Video.find(query)
        .select("title thumbnail views timestamp category")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      const totalVideos = await Video.countDocuments(query);

      const formattedVideos = videos.map((video) => ({
        ...video,
        views: formatViews(video.views),
        timestamp: getTimeAgo(video.createdAt),
      }));

      res.json({
        videos: formattedVideos,
        totalPages: Math.ceil(totalVideos / limit),
        currentPage: parseInt(page),
        totalVideos: totalVideos,
      });
    } catch (error) {
      console.error("Error in getVideosByCategory:", error);
      res.status(500).json({
        message: "Kategoriye göre videolar listelenirken hata oluştu.",
        error: error.message,
      });
    }
  },

  incrementLike: async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);

      if (!video) {
        return res.status(404).json({ message: "Video bulunamadı." });
      }

      if (!video.statistics) {
        video.statistics = { likes: 0, shares: 0, downloads: 0 };
      }
      video.statistics.likes += 1;
      await video.save();

      res.json({
        message: "Beğeni sayısı artırıldı.",
        likes: video.statistics.likes,
      });
    } catch (error) {
      console.error("Error in incrementLike:", error);
      res.status(500).json({
        message: "Beğeni sayısı artırılırken hata oluştu.",
        error: error.message,
      });
    }
  },

  incrementShare: async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);

      if (!video) {
        return res.status(404).json({ message: "Video bulunamadı." });
      }

      if (!video.statistics) {
        video.statistics = { likes: 0, shares: 0, downloads: 0 };
      }
      video.statistics.shares += 1;
      await video.save();

      res.json({
        message: "Paylaşım sayısı artırıldı.",
        shares: video.statistics.shares,
      });
    } catch (error) {
      console.error("Error in incrementShare:", error);
      res.status(500).json({
        message: "Paylaşım sayısı artırılırken hata oluştu.",
        error: error.message,
      });
    }
  },

  getVideoViewStats: async (req, res) => {
    try {
      const videoId = req.params.id;
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const viewStats = await ViewHistory.aggregate([
        {
          $match: {
            videoId: mongoose.Types.ObjectId(videoId),
            createdAt: { $gte: last24Hours },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d %H:00",
                date: "$createdAt",
              },
            },
            views: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.json({
        viewStats,
        totalViews: await ViewHistory.countDocuments({
          videoId: mongoose.Types.ObjectId(videoId),
          createdAt: { $gte: last24Hours },
        }),
      });
    } catch (error) {
      console.error("Error in getVideoViewStats:", error);
      res.status(500).json({
        message: "Video istatistikleri alınırken hata oluştu.",
        error: error.message,
      });
    }
  },

  clearViewHistory: async (req, res) => {
    try {
      const videoId = req.params.id;
      await ViewHistory.deleteMany({
        videoId: mongoose.Types.ObjectId(videoId),
      });

      res.json({
        message: "İzlenme geçmişi temizlendi.",
      });
    } catch (error) {
      console.error("Error in clearViewHistory:", error);
      res.status(500).json({
        message: "İzlenme geçmişi temizlenirken hata oluştu.",
        error: error.message,
      });
    }
  },
};

const formatViews = (views) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} year ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} month ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} day ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} hour ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} minute ago`;
  }

  return "Just now ";
};

const normalizeSearchTerm = (term) => {
  if (!term) return "";
  return term
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const generateSimilarPatterns = (word) => {
  const turkishChars = {
    i: ["ı", "i", "İ", "I"],
    o: ["o", "ö", "O", "Ö"],
    u: ["u", "ü", "U", "Ü"],
    s: ["s", "ş", "S", "Ş"],
    c: ["c", "ç", "C", "Ç"],
    g: ["g", "ğ", "G", "Ğ"],
    a: ["a", "â", "A", "Â"],
    e: ["e", "ê", "E", "Ê"],
  };

  let patterns = [word];

  [...word].forEach((char, index) => {
    const similarChars = turkishChars[char.toLowerCase()];
    if (similarChars) {
      const newPatterns = [];
      patterns.forEach((pattern) => {
        similarChars.forEach((similarChar) => {
          newPatterns.push(
            pattern.slice(0, index) + similarChar + pattern.slice(index + 1)
          );
        });
      });
      patterns = [...patterns, ...newPatterns];
    }
  });

  return [...new Set(patterns)];
};

const getQualityBadgeColor = (quality) => {
  const colors = {
    "4K": "bg-purple-500",
    "1080p": "bg-green-500",
    "720p": "bg-blue-500",
    "480p": "bg-yellow-500",
    "360p": "bg-red-500",
  };
  return colors[quality] || "bg-gray-500";
};

const getSearchFilters = async (searchTerm) => {
  let query = {};
  if (searchTerm) {
    const normalizedTerm = normalizeSearchTerm(searchTerm);
    query.$or = [
      { title: { $regex: normalizedTerm, $options: "i" } },
      { description: { $regex: normalizedTerm, $options: "i" } },
      { "category.name": { $regex: normalizedTerm, $options: "i" } },
    ];
  }

  const [categoriesRaw, platformsRaw, qualities] = await Promise.all([
    Video.distinct("category.name", query),
    Video.distinct("platforms.name", query),
    Video.distinct("platforms.quality", query),
  ]);

  const categories = categoriesRaw.filter(Boolean);
  const platforms = platformsRaw.filter(Boolean);

  return {
    categories,
    platforms,
    qualities,
    sortOptions: [
      { value: "date", label: "En Yeni" },
      { value: "oldest", label: "En Eski" },
      { value: "views", label: "En Çok İzlenen" },
      { value: "likes", label: "En Çok Beğenilen" },
      { value: "downloads", label: "En Çok İndirilen" },
    ],
    timeRanges: [
      { value: "today", label: "Bugün" },
      { value: "week", label: "Bu Hafta" },
      { value: "month", label: "Bu Ay" },
      { value: "year", label: "Bu Yıl" },
    ],
  };
};

module.exports = videoController;
