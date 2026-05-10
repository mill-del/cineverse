const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth.middleware')
const {vote,getResults} = require('../controllers/votes.controller')

router.post('/', authMiddleware, vote)  
router.get('/results', getResults)   

module.exports = router;