import express from "express";
import {
  fetchCurrentMonthBookings,
  fetchBookings,
  getBookingById,
  deleteBooking,
  updateBookingStatus,
  getCurrentBooking,
  timeIn,
  timeOut, 
  checkMissedBookings,
  checkExistingBooking,
} from "../controller/booking.controller.js";

const router = express.Router();

// Route for fetching all current month bookings
router.get("/currentMonth", fetchCurrentMonthBookings);

router.get("/check-existing", checkExistingBooking);

// Route for fetching bookings with optional date and time slot filters
router.get("/get", fetchBookings);

router.get("/current/:studentId", getCurrentBooking);

// Route for getting a specific booking
router.get("/:id", getBookingById);

// Route for deleting a booking
router.delete("/:id", deleteBooking);

// Route for updating booking status
router.patch("/:id/status", updateBookingStatus);

router.post('/:bookingId/timeIn', timeIn);

router.post('/:bookingId/timeOut', timeOut);

router.post('/check-missed', checkMissedBookings);




const bookingRoutes = router;

export default bookingRoutes;