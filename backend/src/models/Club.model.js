const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pinnedMovie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie"
    },
  },
  {
    timestamps: true,
  },
);

const Club = mongoose.model("Club", clubSchema);
module.exports = Club;
