const mongoose = require("mongoose");
const Notification = require("../models/notification");

// ================= GET NOTIFICATIONS (PAGINATED, OWN ONLY) =================
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [totalNotifications, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, read: false }),
      Notification.find({ recipient: userId })
        .populate("actor", "username")
        .populate("post", "content imageUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.json({
      notifications,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(totalNotifications / limit),
      totalNotifications,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error.message);
    return res.status(500).json({ message: "Error fetching notifications" });
  }
};

// ================= MARK NOTIFICATION AS READ (RECIPIENT ONLY) =================
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (String(notification.recipient) !== String(userId)) {
      return res.status(403).json({
        message: "Not authorized to access this notification",
      });
    }

    notification.read = true;
    await notification.save();

    return res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("MARK READ ERROR:", error.message);
    return res.status(500).json({ message: "Error updating notification" });
  }
};

// ================= MARK ALL NOTIFICATIONS AS READ =================
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );

    return res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error.message);
    return res.status(500).json({ message: "Error updating notifications" });
  }
};
