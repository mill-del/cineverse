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
    if (existing)
      return res.status(400).json({ message: "Already voted this week" });

    const newVote = await Vote.create({ movieId, userId, week, year });
    await broadcastResults();
    return res.status(201).json(newVote);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    const week = getCurrentWeek();
    const year = getCurrentYear();
    const votes = await Vote.find({ week, year });
    return res.status(200).json(votes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { vote, getResults };
