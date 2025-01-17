import mongoose from "mongoose";
import Queue from "../models/queue.model.js";
import Student from "../models/student.model.js";
import AR from "../models/ar.model.js";
import MaxHeap from '../utils/maxHeap.js';
import Booking from "../models/booking.model.js";

export const addStudentToQueue = async (req, res) => {
  // console.log(req.body);
  // console.log(req.body._studentId);
  // console.log(req.body._date);
  // console.log(req.body._timeSlot);
  // console.log(req.body._scheduleId);
  // console.log(req.body._arId);

  const { _studentId, _date, _timeSlot, _timeSlotId, _scheduleId, _arId } = req.body;

  // Validate input
  if (
    !_studentId ||
    !_date ||
    !_timeSlot ||
    !_timeSlot.startTime ||
    !_timeSlot.endTime ||
    !_timeSlotId ||
    !_scheduleId ||
    !_arId
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Student ID, date, time slot (start and end times), schedule ID, and AR ID are required.",
    });
  }

  try {
    // Check if the student exists
    const student = await Student.findById(req.body._studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // Check if the AR exists
    const ar = await AR.findById(req.body._arId);
    if (!ar) {
      return res.status(404).json({ success: false, message: "AR not found." });
    }

    // Check if the queue for the specified date and time slot already exists
    let queue = await Queue.findOne({
      _date: req.body._date,
      "_timeSlot.startTime": _timeSlot.startTime,
      "_timeSlot.endTime": _timeSlot.endTime,
    });

    // If the queue does not exist, create a new one
    if (!queue) {
      queue = new Queue({
        _date: req.body._date,
        _timeSlot: {
          startTime: _timeSlot.startTime,
          endTime: _timeSlot.endTime,
        },
        students: [], // Initialize with an empty students array
      });
    }

    // Check if the student is already in the queue
    const studentExists = queue.students.some(
      (student) => student._studentId.toString() === req.body._studentId
    );
    if (studentExists) {
      return res.status(400).json({
        success: false,
        message: "Student already in queue.",
      });
    }

    // Add the student to the queue with the AR ID
    queue.students.push({
      _studentId: _studentId,
      _scheduleId: _scheduleId, // Include the actual schedule ID
      _timeSlotId: _timeSlotId, // Include the actual time slot ID
      _arID: _arId,
      _priorityScore: student._unsuccessfulAttempts + student._attendedSlots - Math.floor(student._noShows / 2),
      _queueStatus: "Waiting for allocation",
    });

    await queue.save();

    return res.status(200).json({
      success: true,
      message: "Student added to queue successfully.",
      data: queue,
    });
  } catch (error) {
    console.error("Error adding student to queue:", error.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Function to fetch all queues
export const fetchQueues = async (req, res) => {
  try {
    const queues = await Queue.find({}).populate("students._studentId").populate("students._scheduleId").populate("students._arID");
    res.status(200).json(queues);
  } catch (error) {
    console.error("Error fetching queues:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Function to allocate students to booking collection
export const allocateStudentsToBooking = async (req, res) => {
    try {
      // Fetch all queues
      const queues = await Queue.find({}).populate("students._studentId").populate("students._scheduleId").populate("students._arID");
  
      // Loop through each queue
      for (const queue of queues) {
        // Check if a booking already exists for the queue's date and time slot
        const existingBooking = await Booking.findOne({
          _date: queue._date,
          "_timeSlot.startTime": queue._timeSlot.startTime,
          "_timeSlot.endTime": queue._timeSlot.endTime,
        });
  
        // If a booking already exists, use it instead of creating a new one
        if (existingBooking) {
          // Add students from the queue to the existing booking
          existingBooking.students = existingBooking.students.concat(queue.students);
          await existingBooking.save();
        } else {
          // Create a new booking if one does not exist
          const newBooking = new Booking({
            _date: queue._date,
            _timeSlot: queue._timeSlot,
            students: queue.students,
          });
          await newBooking.save();
        }
  
        // Remove the queue after allocating its students to a booking
        await Queue.deleteOne({ _id: queue._id });
    }
  
      res.status(200).json({ success: true, message: "Students allocated to booking collection successfully." });
    } catch (error) {
      console.error("Error allocating students to booking collection:", error.message);
      res.status(500).json({ success: false, message: "Server error." });
    }
  };