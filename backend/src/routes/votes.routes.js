const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth.middleware')
const {vote,getResults, getMyVote} = require('../controllers/votes.controller')

router.post('/', authMiddleware, vote)  
router.get('/results', getResults)
router.get('/current', getResults);
router.get('/my', authMiddleware, getMyVote);

module.exports = router;