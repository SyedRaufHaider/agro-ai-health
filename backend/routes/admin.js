const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Detection = require("../models/Detection");
const { protect, authorize } = require("../middleware/auth");

// All admin routes require a valid JWT + admin role
router.use(protect);
router.use(authorize("admin"));

// ─── GET /api/v1/admin/users ──────────────────────────────────────────────────
// Returns all users — id, username, role, createdAt only (no sensitive fields)
router.get("/users", async (req, res, next) => {
    try {
        const users = await User.find({})
            .select("username role createdAt")
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            count: users.length,
            data: users.map((u) => ({
                id: u._id,
                username: u.username,
                role: u.role,
                createdAt: u.createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/v1/admin/detections ────────────────────────────────────────────
// Returns all detection records (paginated, newest first)
router.get("/detections", async (req, res, next) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 20);
        const skip  = (page - 1) * limit;

        const [records, total] = await Promise.all([
            Detection.find({})
                .select("userId predictedLabel confidence status platform createdAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Detection.countDocuments(),
        ]);

        res.json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: records.map((d) => ({
                id:             d._id,
                userId:         d.userId,
                predictedLabel: d.predictedLabel || "Unknown",
                confidence:     d.confidence ?? 0,
                status:         d.status || "unknown",
                platform:       d.platform || "web",
                createdAt:      d.createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/v1/admin/stats ──────────────────────────────────────────────────
// Returns aggregate system statistics
router.get("/stats", async (req, res, next) => {
    try {
        const now       = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            totalUsers,
            totalDetections,
            todayScans,
            todayNewUsers,
            webScans,
            mobileScans,
            recentDetections,
        ] = await Promise.all([
            User.countDocuments(),
            Detection.countDocuments(),
            Detection.countDocuments({ createdAt: { $gte: todayStart } }),
            User.countDocuments({ createdAt: { $gte: todayStart } }),
            Detection.countDocuments({ platform: "web" }),
            Detection.countDocuments({ platform: "mobile" }),
            Detection.find({})
                .select("predictedLabel confidence status platform createdAt")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalDetections,
                todayScans,
                todayNewUsers,
                platformBreakdown: { web: webScans, mobile: mobileScans },
                recentDetections: recentDetections.map((d) => ({
                    id:             d._id,
                    predictedLabel: d.predictedLabel || "Unknown",
                    confidence:     d.confidence ?? 0,
                    status:         d.status || "unknown",
                    platform:       d.platform || "web",
                    createdAt:      d.createdAt,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
