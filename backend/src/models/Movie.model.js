const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
    },
    genres: [String],

    year: {
      type: Number,
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  },
);

const movie = mongoose.model("Movie", movieSchema);
module.exports = movie;
