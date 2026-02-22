const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: [true, "Comment content is required"],
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
    },
    {
        timestamps: true,
    }
);

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
            index: true,
        },
        title: {
            type: String,
            required: [true, "Post title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        content: {
            type: String,
            required: [true, "Post content is required"],
        },
        images: {
            type: [String], // Cloudinary URLs
            default: [],
        },
        tags: {
            type: [String],
            default: [],
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [CommentSchema],
        isFlagged: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Text index for searching posts
PostSchema.index({ title: "text", content: "text", tags: "text" });

// Virtual for like count
PostSchema.virtual("likeCount").get(function () {
    return this.likes.length;
});

// Virtual for comment count
PostSchema.virtual("commentCount").get(function () {
    return this.comments.length;
});

// Ensure virtuals are serialized
PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", PostSchema);
