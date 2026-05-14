const Post = require("../models/Post.model");
const { broadcastToClub } = require("../websocket/voteSocket");

const getPostsByClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const posts = await Post.find({ clubId })
            .populate('authorId', 'username avatar')
            .sort({ createdAt: -1 });
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { text, clubId } = req.body;
        const authorId = req.user.id;
        const post = await Post.create({ text, clubId, authorId });
        const populated = await post.populate('authorId', 'username avatar');

        broadcastToClub(clubId, { type: 'new_post', post: populated });

        return res.status(201).json(populated);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (String(post.authorId) !== req.user.id) {
            return res.status(403).json({ message: "Not your post" });
        }
        await Post.findByIdAndDelete(id);
        broadcastToClub(post.clubId, { type: 'delete_post', postId: id });
        return res.status(200).json({ message: "Deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getPostsByClub, createPost, deletePost };