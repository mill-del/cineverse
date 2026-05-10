const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  week: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
},{
    timestamps: true,
  }
);

const Vote = mongoose.model("Vote", voteSchema);
module.exports = Vote;