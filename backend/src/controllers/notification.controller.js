const { Notification } = require("../models");

exports.getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 30,
    });
    res.json(notifs);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
    res.json({ message: "All notifications marked as read" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: "Notification marked as read" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Helper used by other controllers to create a notification
exports.createNotification = async (userId, title, message, type = "system", link = null) => {
  try {
    await Notification.create({ userId, title, message, type, link });
  } catch (e) { console.error("Notification error:", e.message); }
};
