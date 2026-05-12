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
        .populate('creatorId', 'username');
    if (!club) return res.status(404).json({ message: "Not Found" });
    return res.status(200).json(club);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//-----------------------------------------------
const createClub = async (req, res) => {
  try {
    const { name, description } = req.body;
    const creatorId = req.user.id;
    const members = [creatorId];
    const club = await Club.create({
      name,
      description,
      creatorId,
      members,
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
    const club = await Club.findByIdAndUpdate(id, req.body, { new: true });
    if (!club) return res.status(404).json({ message: "Club not found" });
    return res.status(201).json(club);
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
      { new: true },
    );
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
    const club = await Club.findByIdAndUpdate(
      id,
      { $pull: { members: userId } },
      { new: true },
    );
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
