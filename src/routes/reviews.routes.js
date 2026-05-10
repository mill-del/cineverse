const express = require('express')
const router = express.Router()
const {getReviewsByMovie, createReview, updateReview, deleteReview} =  require('../controllers/reviews.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/:movieId/reviews', getReviewsByMovie)
router.post('/:movieId/reviews', authMiddleware,createReview)
router.put('/:id',authMiddleware,updateReview)
router.delete('/:id',authMiddleware, deleteReview )

module.exports = router;