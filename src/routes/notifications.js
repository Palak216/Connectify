const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/authmiddleware");
const validate = require("../middlewares/validate");
const { notificationIdParamSchema } = require("../validations/schemas");
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

// Get notifications (paginated, own notifications only)
router.get("/", isLoggedIn, getNotifications);

// Mark single notification as read (recipient only)
router.patch(
  "/:id/read",
  isLoggedIn,
  validate(notificationIdParamSchema),
  markNotificationRead
);

// Mark all notifications as read
router.patch("/read-all", isLoggedIn, markAllNotificationsRead);

module.exports = router;
