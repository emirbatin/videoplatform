const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: [
      {
        id: String,
        name: String,
        active: {
          type: Boolean,
          default: false,
        },
      },
    ],
    platforms: [
      {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        quality: {
          type: String,
          required: true,
        },
        bgColor: {
          type: String,
          default: "bg-gray-500",
        },
      },
    ],
    images: [
      {
        id: Number,
        url: String,
        thumbnail: String,
      },
    ],
    downloadLinks: [
      {
        title: String,
        quality: String,
        url: String,
      },
    ],
    statistics: {
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

videoSchema.index({ views: -1 });
videoSchema.index({ slug: 1 });
videoSchema.index({ "category.id": 1 });

videoSchema.virtual("formattedViews").get(function () {
  if (this.views >= 1000000) {
    return (this.views / 1000000).toFixed(1) + "M";
  } else if (this.views >= 1000) {
    return (this.views / 1000).toFixed(1) + "K";
  }
  return this.views.toString();
});

videoSchema.virtual("timestamp").get(function () {
  const seconds = Math.floor((new Date() - this.createdAt) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute ago`;
  return "Just now";
});

videoSchema.methods.hasBeenViewedBy = async function (ip) {
  const ViewHistory = mongoose.model("ViewHistory");
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const viewExists = await ViewHistory.findOne({
    videoId: this._id,
    ip: ip,
    createdAt: { $gt: twentyFourHoursAgo },
  });

  return !!viewExists;
};

videoSchema.methods.addView = async function (ip, userId = null) {
  const ViewHistory = mongoose.model("ViewHistory");

  const hasViewed = await this.hasBeenViewedBy(ip);
  if (!hasViewed) {
    await ViewHistory.create({
      videoId: this._id,
      ip: ip,
      userId: userId,
    });

    this.views += 1;
    await this.save();
    return true;
  }
  return false;
};

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);
module.exports = Video;
