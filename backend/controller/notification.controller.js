import Notification from "../models/notification.model.js";

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  QUEUE_FAIL: "QUEUE_FAIL",
};

export const createNotification = async ({
  userId,
  bookingId = null,
  type,
  title,
  message,
  metadata = {},
}) => {
  if (!userId || !type || !title || !message) {
    throw new Error("userId, type, title, and message are required to create a notification");
  }

  const filter = {
    user: userId,
    type,
    booking: bookingId || null,
  };

  const existing = await Notification.findOne(filter);
  if (existing) {
    return { notification: existing, created: false };
  }

  const notification = await Notification.create({
    user: userId,
    booking: bookingId || null,
    type,
    title,
    message,
    metadata,
    sentAt: new Date(),
  });

  return { notification, created: true };
};
