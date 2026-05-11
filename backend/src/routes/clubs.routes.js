const express = require("express");
const router = express.Router();
const { getClubs, getClubById, createClub, updateClub, deleteClub, joinClub, leaveClub } = require("../controllers/clubs.controller")
const authMiddleware = require('../middleware/auth.middleware')

router.get('/', getClubs)
router.get('/:id',getClubById)
router.post('/',authMiddleware,createClub)
router.put('/:id',authMiddleware,updateClub)
router.delete('/:id',authMiddleware,deleteClub)
router.post('/:id/join', authMiddleware, joinClub)
router.post('/:id/leave', authMiddleware, leaveClub)

module.exports = router;