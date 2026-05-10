const User = require("../models/User.model");

const getProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id).select("-password");
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const profile = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("-password");
    if (!profile) return res.status(500).json({ message: "profile not found" });
    return res.status(200).json({ profile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true },
    ).select("-password");
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {getProfile,updateProfile,updateAvatar}
