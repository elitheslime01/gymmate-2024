import Booking from "../models/booking.model.js";
import { updateStudentMetrics } from './student.controller.js';

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
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    // Convert studentId to ObjectId if necessary
    const mongoose = await import("mongoose");
    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId) 
      ? new mongoose.Types.ObjectId(studentId)
      : studentId;

    // Find all bookings for the student that are either today or in the future
    const bookings = await Booking.find({
      'students._studentId': studentObjectId,
      $or: [
        // Future bookings
        { '_date': { $gt: startOfDay } },
        // Today's bookings that aren't completed
        {
          '_date': startOfDay,
          'students': {
            $elemMatch: {
              '_studentId': studentObjectId,
              '_bookingStatus': { $ne: 'Completed' }
            }
          }
        }
      ]
    })
    .populate('students._studentId')
    .populate('students._scheduleId')
    .populate('students._arID')
    .sort({ '_date': 1, '_timeSlot.startTime': 1 });

    // Get the earliest non-completed booking
    const currentBooking = bookings.find(booking => {
      const student = booking.students.find(s => 
        s._studentId._id.toString() === studentId.toString() &&
        s._bookingStatus !== 'Completed'
      );
      return student;
    });

    if (!currentBooking) {
      return res.status(404).json({
        message: "No current booking found"
      });
    }

    res.status(200).json(currentBooking);
  } catch (error) {
    console.error("Error fetching current booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const timeIn = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { studentId, timeIn } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const student = booking.students.find(s => s._studentId.toString() === studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found in booking" });
    }

    student._timedIn = timeIn;
    student._bookingStatus = "Checked-In";
    await booking.save();

    res.status(200).json({ message: "Time in recorded successfully" });
  } catch (error) {
    console.error("Error recording time in:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const timeOut = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { studentId, timeOut } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const student = booking.students.find(s => s._studentId.toString() === studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found in booking" });
    }

    student._timedOut = timeOut;
    student._bookingStatus = "Completed";
    await booking.save();

    res.status(200).json({ message: "Time out recorded successfully" });
  } catch (error) {
    console.error("Error recording time out:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkMissedBookings = async (req, res) => {
    try {
        const now = new Date();
        const missedBookings = await Booking.find({
            '_date': { $lte: now },
            'students': {
                $elemMatch: {
                    '_bookingStatus': 'Awaiting Arrival',
                    '_timedIn': null,
                    '_timedOut': null
                }
            }
        }).populate('students._studentId');

        const updatedStudents = [];

        for (const booking of missedBookings) {
            for (const student of booking.students) {
                if (student._bookingStatus === 'Awaiting Arrival' && !student._timedIn && !student._timedOut) {
                    const [hours, minutes] = booking._timeSlot.endTime.match(/(\d+):(\d+) (AM|PM)/).slice(1);
                    let endHour = parseInt(hours);
                    const endMinutes = parseInt(minutes);
                    const isPM = booking._timeSlot.endTime.includes('PM');

                    if (isPM && endHour !== 12) endHour += 12;
                    else if (!isPM && endHour === 12) endHour = 0;

                    const bookingEndTime = new Date(booking._date);
                    bookingEndTime.setHours(endHour, endMinutes, 0, 0);

                    if (now > bookingEndTime) {
                        student._bookingStatus = 'Not Attended';
                        // Update student metrics immediately
                        await updateStudentMetrics(student._studentId._id, 'noShow');
                        updatedStudents.push(student._studentId._id);
                    }
                }
            }
            await booking.save();
        }

        // Fetch updated priority scores for affected students
        const updatedScores = await Promise.all(
            updatedStudents.map(async (studentId) => {
                const updatedStudent = await Student.findById(studentId);
                return {
                    studentId,
                    priorityScore: updatedStudent._priorityScore
                };
            })
        );

        res.status(200).json({ 
            success: true, 
            message: "Missed bookings updated successfully.",
            updatedScores 
        });
    } catch (error) {
        console.error("Error checking missed bookings:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

export const checkExistingBooking = async (req, res) => {
    try {
        const { studentId, date, startTime, endTime } = req.query;

        // Validate required parameters
        if (!studentId || !date || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Missing required query parameters",
                params: { studentId, date, startTime, endTime }
            });
        }

        // Convert date string to Date object and set to start of day
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        // Debug log
        console.log('Checking booking with criteria:', {
            studentId,
            date: queryDate,
            startTime: decodeURIComponent(startTime),
            endTime: decodeURIComponent(endTime)
        });

        const booking = await Booking.findOne({
            'students._studentId': studentId,
            '_timeSlot.startTime': decodeURIComponent(startTime),
            '_timeSlot.endTime': decodeURIComponent(endTime)
        }).where('_date').gte(queryDate).lt(new Date(queryDate.getTime() + 24 * 60 * 60 * 1000));

        console.log('Found booking:', booking);

        return res.status(200).json({ 
            exists: !!booking,
            message: booking ? "Student already has a booking for this time slot" : "No existing booking found"
        });
    } catch (error) {
        console.error("Error checking existing booking:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error checking existing booking",
            error: error.message 
        });
    }
};

export const updateLapsedBookings = async (req, res) => {
    try {
        const now = new Date();
        
        // Find bookings that are in the past or current with "Awaiting Arrival" status
        const bookings = await Booking.find({
            'students': {
                $elemMatch: {
                    '_bookingStatus': 'Awaiting Arrival',
                    '_timedIn': null
                }
            }
        }).populate('students._studentId');

        const updatedBookings = [];

        for (const booking of bookings) {
            const bookingDate = new Date(booking._date);
            
            // Parse the end time
            const [hours, minutes] = booking._timeSlot.endTime.match(/(\d+):(\d+) (AM|PM)/).slice(1);
            let endHour = parseInt(hours);
            const endMinutes = parseInt(minutes);
            const isPM = booking._timeSlot.endTime.includes('PM');

            // Convert to 24-hour format
            if (isPM && endHour !== 12) endHour += 12;
            else if (!isPM && endHour === 12) endHour = 0;

            // Set booking end time
            bookingDate.setHours(endHour, endMinutes, 0, 0);

            // Check if booking time has passed
            if (now > bookingDate) {
                for (const student of booking.students) {
                    if (student._bookingStatus === 'Awaiting Arrival' && !student._timedIn) {
                        student._bookingStatus = 'Not Attended';
                        await updateStudentMetrics(student._studentId._id, 'noShow');
                        updatedBookings.push(booking._id);
                    }
                }
                await booking.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Lapsed bookings updated successfully",
            updatedBookings
        });
    } catch (error) {
        console.error("Error updating lapsed bookings:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating lapsed bookings"
        });
    }
};