// src/controllers/notifications.controller.js
const NotificationsService = require("../services/notifications.service");

async function list(req, res) {
  const userId = req.user.id;
  const { limit, cursor } = req.query;

  const data = await NotificationsService.list({ userId, limit, cursor });
  return res.status(200).json(data);
}

async function markRead(req, res) {
  const userId = req.user.id;
  const notificationId = req.params.notificationId;

  const data = await NotificationsService.markRead({ userId, notificationId });
  return res.status(200).json(data);
}

async function markAllRead(req, res) {
  const userId = req.user.id;
  const data = await NotificationsService.markAllRead({ userId });
  return res.status(200).json(data);
}

async function unreadCount(req, res) {
  const data = await NotificationsService.getUnreadCount({ userId: req.user.id });
  return res.status(200).json(data);
}

async function deleteAll(req, res) {
  const data = await NotificationsService.deleteAll({ userId: req.user.id });
  return res.status(200).json(data);
}

module.exports = { list, markRead, markAllRead, unreadCount, deleteAll };
