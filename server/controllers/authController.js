const User = require("../models/user");
const generateToken = require("../utils/generateToken");

const authController = {
  registerUser: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          message: "Tüm alanları doldurunuz.",
        });
      }

      const userExists = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (userExists) {
        return res.status(400).json({
          message:
            userExists.email === email
              ? "Bu e-posta zaten kayıtlı."
              : "Bu kullanıcı adı zaten alınmış.",
        });
      }

      const user = await User.create({
        username,
        email,
        password,
      });

      res.status(201).json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        message: "An error occurred while registering.",
        error: error.message,
      });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required.",
        });
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
          message: "Geçersiz email veya şifre.",
        });
      }

      user.lastLogin = Date.now();
      await user.save();

      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Giriş sırasında bir hata oluştu.",
        error: error.message,
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          message: "Kullanıcı bulunamadı.",
        });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: "Profil bilgileri alınırken hata oluştu.",
        error: error.message,
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          message: "Kullanıcı bulunamadı.",
        });
      }

      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } catch (error) {
      res.status(500).json({
        message: "Profil güncellenirken hata oluştu.",
        error: error.message,
      });
    }
  },
};

module.exports = authController;
