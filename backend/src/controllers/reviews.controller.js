const Review = require("../models/Review.model");

//--------------------------------------------------
const getReviewsByMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId;

    const review = await Review.find({ movieId })
        .populate('userId', 'username avatar')

    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.status(200).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//---------------------------------------------------

const createReview = async (req, res) => {
  try {
    const { text, score } = req.body;
    const userId = req.user.id;
    const movieId = req.params.movieId;
    const review = await Review.create({
      text,
      score,
      userId,
      movieId,
    });

    const populated = await review.populate('userId', 'username avatar');
    return res.status(201).json(populated);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//--------------------------------------------------

const updateReview = async (req, res) => {
  try {
    const id = req.params.id;
    const review = await Review.findByIdAndUpdate(id, req.body, { new: true });
    if (!review) return res.status(500).json({ message: "Review not found" });
    return res.status(200).json({ review });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//----------------------------------------------------

const deleteReview = async (req, res) => {
  try {
    const id = req.params.id
    const review = await  Review.findByIdAndDelete(id)
    return res.status(200).json({message: 'Review deleted'})
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getReviewsByMovie, createReview, updateReview, deleteReview};
