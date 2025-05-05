import Booking from "../models/booking.model.js";

// Function to fetch all bookings for the current month
export const fetchCurrentMonthBookings = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const bookings = await Booking.find({
        _date: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
        }).populate("students._studentId")
        .populate("students._scheduleId")
        .populate("students._arID");

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching current month bookings:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Function to fetch bookings by date and optional time slot
export const fetchBookings = async (req, res) => {
    try {
      const { date, startTime, endTime } = req.query;
      const query = {};
      
      if (date) {
        query._date = new Date(date);
      }
      if (startTime) {
        query["_timeSlot.startTime"] = startTime;
      }
      if (endTime) {
        query["_timeSlot.endTime"] = endTime;
      }
  
      const bookings = await Booking.find(query)
        .populate("students._studentId")
        .populate("students._scheduleId")
        .populate("students._arID");
  
      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
};

// Function to get a specific booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("students._studentId")
      .populate("students._scheduleId")
      .populate("students._arID");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Function to delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Function to update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, message: "Booking status updated successfully" });
  } catch (error) {
    console.error("Error updating booking status:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCurrentBooking = async (req, res) => {
  try {
    const { studentId } = req.params;
    const currentDate = new Date();
    
    // Find the most recent or upcoming booking for the student
    const booking = await Booking.findOne({
      'students._studentId': studentId,
      '_date': {
        $gte: new Date(currentDate.setHours(0, 0, 0, 0))
      }
    })
    .populate('students._arId')
    .sort({ _date: 1, 'timeSlot.startTime': 1 });

    if (!booking) {
      return res.status(404).json({ message: "No current booking found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching current booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  fetchCurrentMonthBookings,
  fetchBookings,
  getBookingById,
  deleteBooking,
  updateBookingStatus
};