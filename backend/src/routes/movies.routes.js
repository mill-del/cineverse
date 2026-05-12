const express = require("express");
const router = express.Router();
const { getMovies, getMovieById, createMovie, deleteMovie,updateMovie, toggleList } = require("../controllers/movies.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", getMovies);
router.post("/", authMiddleware, createMovie);
router.get("/:id", getMovieById)
router.put("/:id",authMiddleware,updateMovie)
router.delete("/:id",authMiddleware,deleteMovie )
router.patch("/:id/lists", authMiddleware, toggleList);


module.exports = router;
