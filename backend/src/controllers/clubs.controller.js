const Club = require("../models/Club.model");

//-----------------------------------------
const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find();
    return res.status(200).json(clubs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//------------------------------------------
const getClubById = async (req, res) => {
  try {
    const clubId = req.params.id;
    const club = await Club.findById(clubId)
        .populate('members', 'username avatar')
        .populate('creatorId', 'username')
        .populate('pinnedMovies', 'title poster year');
    if (!club) return res.status(404).json({ message: "Not Found" });
    return res.status(200).json(club);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//-----------------------------------------------
const createClub = async (req, res) => {
  try {
    const { name, description, theme, coverUrl } = req.body;
    const creatorId = req.user.id;
    const club = await Club.create({
      name, description, theme, coverUrl,
      creatorId,
      members: [creatorId],
    });
    return res.status(201).json({ club });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//-----------------------------------------------------------
const updateClub = async (req, res) => {
  try {
    const id = req.params.id;
    if (req.body.pinnedMovies && req.body.pinnedMovies.length > 3) {
      return res.status(400).json({ message: "Max 3 pinned films" });
    }
    const club = await Club.findByIdAndUpdate(id, req.body, { new: true })
        .populate('members', 'username avatar')
        .populate('creatorId', 'username')
        .populate('pinnedMovies', 'title poster year');
    if (!club) return res.status(404).json({ message: "Club not found" });
    return res.status(200).json(club);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//------------------------------------------------------------
const deleteClub = async (req, res) => {
  try {
    const id = req.params.id;
    const club = await Club.findByIdAndDelete(id);
    return res.status(200).json({ message: "Club deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//---------------------------------------------------------------
const joinClub = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const club = await Club.findByIdAndUpdate(
        id,
        { $addToSet: { members: userId } },
        { new: true }
    ).populate('members', 'username avatar')
        .populate('creatorId', 'username')
        .populate('pinnedMovies', 'title poster year');

    if (!club) return res.status(404).json({ message: "Club not found" });
    return res.status(200).json({ message: "Joined successfully", club });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//----------------------------------------------------------------
const leaveClub = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const existing = await Club.findById(id);
    if (!existing) return res.status(404).json({ message: "Club not found" });

    if (String(existing.creatorId) === userId) {
      return res.status(403).json({ message: "Creator cannot leave their own club" });
    }

    const club = await Club.findByIdAndUpdate(
        id,
        { $pull: { members: userId } },
        { new: true }
    ).populate('members', 'username avatar')
        .populate('creatorId', 'username')
        .populate('pinnedMovies', 'title poster year');

    return res.status(200).json({ message: "Left successfully", club });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//-----------------------------------------------------------------
module.exports = {
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
};