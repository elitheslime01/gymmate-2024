import AllocationStatus from "../models/allocationStatus.model.js";
import { createNotification, NOTIFICATION_TYPES } from "./notification.controller.js";

export const notifyAllocationStatus = async (req, res) => {
  try {
    const { userId, bookingId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const query = { user: userId };
    if (bookingId) {
      query.booking = bookingId;
    }

    const statusRecord = await AllocationStatus.findOne(query).sort({ createdAt: -1 });

    if (!statusRecord) {
      return res.status(404).json({
        success: false,
        message: "Allocation status not found",
      });
    }

    let notificationResult = null;

    if (statusRecord.status === "ALLOCATED") {
      const bookingRef = bookingId || statusRecord.booking;
      notificationResult = await createNotification({
        userId,
        bookingId: bookingRef,
        type: NOTIFICATION_TYPES.BOOKING_CONFIRMED,
        title: "Booking confirmed",
        message: "Your GymMate booking has been confirmed.",
        metadata: {
          bookingId: bookingRef,
          allocationStatusId: statusRecord._id,
        },
      });
    } else if (statusRecord.status === "FAILED") {
      const bookingRef = bookingId || statusRecord.booking;
      const reason = statusRecord.reason || "We were unable to allocate a slot for your request.";

      notificationResult = await createNotification({
        userId,
        bookingId: bookingRef,
        type: NOTIFICATION_TYPES.QUEUE_FAIL,
        title: "Allocation update",
        message: reason,
        metadata: {
          bookingId: bookingRef,
          allocationStatusId: statusRecord._id,
          reason,
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Allocation is still pending",
        data: { status: statusRecord.status },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification processed",
      data: {
        status: statusRecord.status,
        notificationId: notificationResult?.notification?._id || null,
        created: notificationResult?.created ?? false,
      },
    });
  } catch (error) {
    console.error("Error sending allocation notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending notification",
    });
  }
};
