const express = require('express');
const router = express.Router();
const { getPostsByClub, createPost, deletePost } = require('../controllers/posts.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/club/:clubId', getPostsByClub);
router.post('/', authMiddleware, createPost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;