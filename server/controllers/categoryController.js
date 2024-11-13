const Category = require("../models/category");
const Video = require("../models/videoModel");

const categoryController = {
  getPopularCategories: async (req, res) => {
    try {
      const videosByCategory = await Video.aggregate([
        { $unwind: "$category" },
        {
          $match: {
            "category.id": { $exists: true, $ne: null },
            "category.name": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: "$category.name",
            categoryId: { $first: "$category.id" },
            totalViews: { $sum: "$views" },
            videoCount: { $sum: 1 },
            lastVideoDate: { $max: "$createdAt" },
          },
        },
        {
          $sort: {
            totalViews: -1,
            videoCount: -1,
            lastVideoDate: -1,
          },
        },
        { $limit: 10 },
        {
          $project: {
            id: "$categoryId",
            name: "$_id",
            views: "$totalViews",
            videoCount: "$videoCount",
            _id: 0,
          },
        },
      ]);

      const allCategories = [{ id: null, name: "All" }, ...videosByCategory];
      res.json(allCategories);
    } catch (error) {
      console.error("Error in getPopularCategories:", error);
      res.status(500).json({
        message: "Kategoriler listelenirken hata oluştu.",
        error: error.message,
      });
    }
  },

  findOrCreateCategory: async (categories) => {
    try {
      if (
        !categories ||
        (Array.isArray(categories) && categories.length === 0)
      ) {
        throw new Error("Kategori verisi gerekli");
      }

      const categoryArray = Array.isArray(categories)
        ? categories
        : [categories];

      const results = await Promise.all(
        categoryArray.map(async (categoryData) => {
          if (!categoryData || !categoryData.id || !categoryData.name) {
            throw new Error(
              "Geçersiz kategori verisi: id ve name alanları zorunludur"
            );
          }

          let category = await Category.findOne({ id: categoryData.id });

          if (!category) {
            category = new Category({
              id: categoryData.id,
              name: categoryData.name,
              views: 0,
              videoCount: 0,
              totalViews: 0,
            });
            await category.save();
          } else if (category.name !== categoryData.name) {
            category.name = categoryData.name;
            await category.save();
          }

          return {
            id: category.id,
            name: category.name,
            active: categoryData.active || false,
          };
        })
      );

      return results;
    } catch (error) {
      console.error("Error in findOrCreateCategory:", error);
      throw error;
    }
  },

  updateCategoryStats: async (categories) => {
    try {
      if (!Array.isArray(categories) || categories.length === 0) return;

      for (const category of categories) {
        if (!category.id) continue;

        const stats = await Video.aggregate([
          {
            $match: {
              category: {
                $elemMatch: {
                  id: category.id,
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              totalViews: { $sum: "$views" },
              videoCount: { $sum: 1 },
            },
          },
        ]);

        if (stats.length > 0) {
          await Category.findOneAndUpdate(
            { id: category.id },
            {
              totalViews: stats[0].totalViews,
              videoCount: stats[0].videoCount,
            },
            { new: true }
          );
        }
      }
    } catch (error) {
      console.error("Error updating category stats:", error);
      throw error;
    }
  },

  incrementCategoryView: async (categories) => {
    try {
      if (!Array.isArray(categories) || categories.length === 0) return;

      await Promise.all(
        categories.map(async (category) => {
          if (!category.id) return;

          const cat = await Category.findOne({ id: category.id });
          if (cat) {
            cat.views = (cat.views || 0) + 1;
            await cat.save();
          }
        })
      );

      await categoryController.updateCategoryStats(categories);
    } catch (error) {
      console.error("Error incrementing category view:", error);
      throw error;
    }
  },
};

module.exports = categoryController;
