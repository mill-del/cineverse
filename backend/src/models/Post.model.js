const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        clubId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Club",
            required: true,
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
    },
    { timestamps: true }
);

const PostModel = mongoose.model("PostModel", postSchema);
module.exports = PostModel;