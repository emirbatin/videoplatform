const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const protect = require("../middlewares/authMiddleware");

router.get("/search", videoController.searchVideos);
router.get("/featured", videoController.getFeaturedVideo); 
router.get("/category/:id", videoController.getVideosByCategory); 

// Main
router.get("/", videoController.getAllVideos); 

// Video details
router.get("/watch", videoController.getVideoById); 

// Admin 
router.post("/create", protect, videoController.createVideo); 
router.put("/update/:id", protect, videoController.updateVideo);
router.delete("/delete/:id", protect, videoController.deleteVideo);
router.get("/:id/views/stats", videoController.getVideoViewStats);
router.delete("/:id/views", protect, videoController.clearViewHistory); 

// Stats
router.post("/:id/view", videoController.incrementView);
router.post("/:id/like", videoController.incrementLike);
router.post("/:id/share", videoController.incrementShare);

router.get("/:id", videoController.getVideoById); 

module.exports = router;
