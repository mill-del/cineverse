const Vote = require("../models/Vote.model");
const { getCurrentWeek, getCurrentYear } = require("../utils/getCurrentWeek");
const { broadcastResults } = require("../websocket/voteSocket");

const vote = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.id;
    const week = getCurrentWeek();
    const year = getCurrentYear();

    const existing = await Vote.findOne({ userId, week, year });
    if (existing) {
      if (String(existing.movieId) === movieId) {
        return res.status(400).json({ message: "Already voted for this film" });
      }
      existing.movieId = movieId;
      await existing.save();
    } else {
      await Vote.create({ movieId, userId, week, year });
    }

    await broadcastResults();
    return res.status(201).json({ message: "Voted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyVote = async (req, res) => {
  try {
    const week = getCurrentWeek();
    const year = getCurrentYear();
    const vote = await Vote.findOne({ userId: req.user.id, week, year });
    return res.status(200).json({ movieId: vote?.movieId || null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    const week = getCurrentWeek();
    const year = getCurrentYear();

    const votes = await Vote.find({ week, year })
        .populate('movieId', 'title poster year');

    const map = new Map();
    votes.forEach(v => {
      const id = String(v.movieId?._id || v.movieId);
      if (!map.has(id)) {
        map.set(id, { movieId: v.movieId, count: 0 });
      }
      map.get(id).count++;
    });

    const results = Array.from(map.values())
        .sort((a, b) => b.count - a.count);

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { vote, getResults, getMyVote };