const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { protect } = require("../middleware/auth");

// @route   GET /api/v1/posts
// @desc    Get all posts (with pagination)
// @access  Public
router.get("/", async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const { search, tag } = req.query;

        const filter = {};
        if (search) filter.$text = { $search: search };
        if (tag) filter.tags = tag;

        const posts = await Post.find(filter)
            .populate("userId", "username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments(filter);

        res.json({
            success: true,
            count: posts.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: posts,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/posts
// @desc    Create a new post
// @access  Private
router.post("/", protect, async (req, res, next) => {
    try {
        const post = await Post.create({
            ...req.body,
            userId: req.user._id,
        });

        const populated = await post.populate("userId", "username profilePicture");

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/posts/:id
// @desc    Get single post
// @access  Public
router.get("/:id", async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("userId", "username profilePicture")
            .populate("comments.userId", "username profilePicture");

        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" });
        }

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post("/:id/comment", protect, async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" });
        }

        post.comments.push({
            userId: req.user._id,
            content: req.body.content,
        });

        await post.save();

        const populated = await Post.findById(post._id)
            .populate("userId", "username profilePicture")
            .populate("comments.userId", "username profilePicture");

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/posts/:id/like
// @desc    Like / Unlike a post
// @access  Private
router.put("/:id/like", protect, async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" });
        }

        const index = post.likes.indexOf(req.user._id);
        if (index === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json({ success: true, liked: index === -1, likeCount: post.likes.length });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
