const Movie = require("../models/Movie.model");
const User = require("../models/User.model");

//----------------------------------------
const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    return res.status(200).json(movies);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//--------------------------------------
const getMovieById = async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.status(200).json(movie);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//----------------------------------------
const createMovie = async (req, res) => {
  try {
    const { title, description, genres, year, director, poster, rating } =
      req.body;
    const movie = await Movie.create({
      title,
      description,
      genres,
      year,
      director,
      poster,
      rating,
    });
    return res.status(201).json(movie);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//------------------------------------------
const updateMovie = async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    return res.status(200).json(movie);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//------------------------------------------
const deleteMovie = async (req, res) => {
  try {
    const id = req.params.id;
    await Movie.findByIdAndDelete(id);
    return res.status(200).json({ message: "Movie deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const toggleList = async (req, res) => {
  try {
    const { list, action } = req.body;
    const movieId = req.params.id;
    const userId = req.user.id;

    if (!['watched', 'watchlist', 'favorites'].includes(list)) {
      return res.status(400).json({ message: 'Invalid list' });
    }

    const update = action === 'add'
        ? { $addToSet: { [list]: movieId } }
        : { $pull:     { [list]: movieId } };

    const user = await User.findByIdAndUpdate(userId, update, { new: true })
        .select('-password')
        .populate('watched',   'title year poster')
        .populate('watchlist', 'title year poster')
        .populate('favorites', 'title year poster');

    return res.status(200).json({
      watched:   user.watched,
      watchlist: user.watchlist,
      favorites: user.favorites
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getMovies, getMovieById, createMovie, deleteMovie,updateMovie, toggleList };
