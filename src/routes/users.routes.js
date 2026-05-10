const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth.middleware')
const {getProfile,updateProfile,updateAvatar}  = require('../controllers/users.controller')

router.get('/me',authMiddleware, getProfile)   
router.put('/me',authMiddleware,updateProfile)
router.put('/me/avatar',authMiddleware,updateAvatar)

module.exports = router;