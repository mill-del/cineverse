const User = require("../models/User.model");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
        .select('-password')
        .populate('watched',   'title year poster')
        .populate('watchlist', 'title year poster')
        .populate('favorites', 'title year poster');

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, bio, favoriteGenres } = req.body; // ← только нужные поля
    const profile = await User.findByIdAndUpdate(
        req.user.id,
        { username, bio, favoriteGenres },
        { new: true }
    ).select('-password');
    if (!profile) return res.status(404).json({ message: 'User not found' });
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
