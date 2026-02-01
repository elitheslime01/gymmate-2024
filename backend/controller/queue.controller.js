import mongoose from "mongoose";
import Queue from "../models/queue.model.js";
import Student from "../models/student.model.js";
import AR from "../models/ar.model.js";
import MaxHeap from '../utils/maxHeap.js';
import Booking from "../models/booking.model.js";
import Schedule from "../models/schedule.model.js";
import AllocationStatus from "../models/allocationStatus.model.js";
import { createNotification, NOTIFICATION_TYPES } from "./notification.controller.js";
import { updateStudentMetrics } from "./student.controller.js";

// Calculate priority score with the new logic
const calculatePriorityScore = (student) => {
  if (!student._unsuccessfulAttempts && !student._attendedSlots && !student._noShows) {
    // New student with no history
    return 0;
  }
  
  const unsuccessfulPoints = student._unsuccessfulAttempts || 0;
  const noShowPenalty = student._noShows ? Math.floor(student._noShows / 2) : 0; // Only penalize if there are no-shows
  const attendanceBonus = student._attendedSlots || 0;

  return attendanceBonus + unsuccessfulPoints - noShowPenalty;
};

const getSlotLabel = (timeSlot) => `${timeSlot.startTime} - ${timeSlot.endTime}`;

const sendAllocationNotification = async ({ userId, bookingId, status, reason, queueDate, queueSlot }) => {
  try {
    const dateLabel = new Date(queueDate).toLocaleDateString();
    const slotLabel = getSlotLabel(queueSlot);

    if (status === "ALLOCATED") {
      await createNotification({
        userId,
        bookingId,
        type: NOTIFICATION_TYPES.BOOKING_CONFIRMED,
        title: "Booking confirmed",
        message: `Your booking for ${slotLabel} on ${dateLabel} is confirmed.`,
        metadata: {
          queueDate,
          queueSlot,
        },
      });
    } else if (status === "FAILED") {
      await createNotification({
        userId,
        bookingId,
        type: NOTIFICATION_TYPES.QUEUE_FAIL,
        title: "Allocation update",
        message: reason || "We could not allocate a slot for your request.",
        metadata: {
          queueDate,
          queueSlot,
          reason,
        },
      });
    }
  } catch (error) {
    console.error("Error sending allocation notification:", error.message);
  }
};

export const addStudentToQueue = async (req, res) => {

  const { _studentId, _date, _timeSlot, _timeSlotId, _scheduleId, _arId } = req.body;

  // Validate input
  if (!_studentId || !_date || !_timeSlot || !_timeSlot.startTime || 
      !_timeSlot.endTime || !_timeSlotId || !_scheduleId || !_arId) {
    return res.status(400).json({
      success: false,
      message: "All fields are required."
    });
  }

  try {
    // Check for existing booking first
    const existingBooking = await Booking.findOne({
      '_date': new Date(_date),
      '_timeSlot.startTime': _timeSlot.startTime,
      '_timeSlot.endTime': _timeSlot.endTime,
      'students._studentId': _studentId
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have a booking for this time slot"
      });
    }

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
      _date: new Date(req.body._date + 'T00:00:00.000Z'),
      "_timeSlot.startTime": _timeSlot.startTime,
      "_timeSlot.endTime": _timeSlot.endTime,
    });

    // If the queue does not exist, create a new one
    if (!queue) {
      queue = new Queue({
        _date: new Date(req.body._date + 'T00:00:00.000Z'),
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



  // In the addStudentToQueue function, replace the existing priority score calculation:
  queue.students.push({
    _studentId: _studentId,
    _scheduleId: _scheduleId,
    _timeSlotId: _timeSlotId,
    _arID: _arId,
    _priorityScore: calculatePriorityScore(student),
    _queueStatus: "Waiting for allocation",
    _queuedAt: new Date() // Add timestamp when student is queued
  });

    await queue.save();

    try {
      await AllocationStatus.create({
        user: _studentId,
        booking: null,
        status: "WAITING",
        allocatedAt: null,
      });
    } catch (statusError) {
      console.error("Error creating allocation status:", statusError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Student added to queue successfully.",
      data: queue,
    });
  } catch (error) {
    console.error("Error adding student to queue:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error while adding to queue" 
    });
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

export const fetchCurrentMonthQueues = async (req, res) => {
  try {
    const now = new Date();
    // Create a broad date range to handle timezone differences
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const queues = await Queue.find({
      _date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).populate("students._studentId")
      .populate("students._scheduleId")
      .populate("students._arID");

    res.status(200).json(queues);
  } catch (error) {
    console.error("Error fetching current month queues:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


// Function to allocate students to booking collection
export const allocateStudentsToBooking = async (req, res) => {
  try {
    const allocationResults = [];
    const statusChanges = [];

    // Fetch all queues with populated student data
    const queues = await Queue.find({})
      .populate("students._studentId")
      .populate("students._scheduleId")
      .populate("students._arID");
    
    for (const queue of queues) {
      // Skip empty queues
      if (!queue.students || queue.students.length === 0) {
        continue;
      }

      // Create max heap for this queue's students
      const maxHeap = new MaxHeap();
      
      // Only add students who are waiting for allocation
      const waitingStudents = queue.students.filter(
        student => student._queueStatus === "Waiting for allocation"
      );

      // Skip if no students are waiting for allocation
      if (waitingStudents.length === 0) {
        continue;
      }
      
      // Add waiting students to the heap
      try {
        waitingStudents.forEach(student => {
          maxHeap.insert(student);
        });
      } catch (error) {
        console.error("Error inserting students into heap:", error);
        continue;
      }

      // Get schedule and time slot info
      const firstStudent = waitingStudents[0];
      const schedule = await Schedule.findById(firstStudent._scheduleId);
      const timeSlotIndex = schedule.timeSlots.findIndex(
        slot => slot._startTime === queue._timeSlot.startTime
      );

      if (!schedule || timeSlotIndex === -1) {
        continue;
      }

      const allocatedStudents = [];
      const unallocatedStudents = [...queue.students.filter(
        student => student._queueStatus !== "Waiting for allocation"
      )]; // Keep non-waiting students as is

      // Allocate waiting students based on priority
      while (maxHeap.size() > 0 && schedule.timeSlots[timeSlotIndex]._availableSlots > 0) {
        const student = maxHeap.extractMax();
        let bookingRecord = null;
        
        const existingBooking = await Booking.findOne({
            _date: queue._date,
            "_timeSlot.startTime": queue._timeSlot.startTime,
            "_timeSlot.endTime": queue._timeSlot.endTime,
        });
    
        if (!existingBooking?.students.some(s => s._studentId.toString() === student._studentId.toString())) {
            // Remove the updateStudentMetrics call here
            student._bookingStatus = "Awaiting Arrival"; // Set initial status
    
            if (existingBooking) {
                existingBooking.students.push(student);
                await existingBooking.save();
                bookingRecord = existingBooking;
            } else {
                const newBooking = new Booking({
                    _date: queue._date,
                    _timeSlot: queue._timeSlot,
                    students: [student],
                });
                await newBooking.save();
                bookingRecord = newBooking;
            }
            
            schedule.timeSlots[timeSlotIndex]._availableSlots -= 1;
            allocatedStudents.push(student);

            try {
              await AllocationStatus.findOneAndUpdate(
                {
                  user: student._studentId,
                },
                {
                  user: student._studentId,
                  booking: bookingRecord?._id || null,
                  status: "ALLOCATED",
                  reason: null,
                  allocatedAt: new Date(),
                },
                {
                  new: true,
                  upsert: true,
                  sort: { createdAt: -1 },
                  setDefaultsOnInsert: true,
                }
              );

              statusChanges.push({
                userId: student._studentId.toString(),
                bookingId: bookingRecord?._id ? bookingRecord._id.toString() : null,
                status: "ALLOCATED",
              });

              await sendAllocationNotification({
                userId: student._studentId,
                bookingId: bookingRecord?._id || null,
                status: "ALLOCATED",
                queueDate: queue._date,
                queueSlot: queue._timeSlot,
              });
            } catch (allocationStatusError) {
              console.error("Error updating allocation status:", allocationStatusError.message);
            }
        }
    }
    
      // Handle remaining unallocated waiting students
      while (maxHeap.size() > 0) {
        const student = maxHeap.extractMax();
        await updateStudentMetrics(student._studentId, 'unsuccessful');
        student._queueStatus = "Not allocated - No slots available";
        unallocatedStudents.push(student);

        const reason = "No slots available";

        try {
          await AllocationStatus.findOneAndUpdate(
            {
              user: student._studentId,
            },
            {
              user: student._studentId,
              booking: null,
              status: "FAILED",
              reason,
              allocatedAt: null,
            },
            {
              new: true,
              upsert: true,
              sort: { createdAt: -1 },
              setDefaultsOnInsert: true,
            }
          );

          statusChanges.push({
            userId: student._studentId.toString(),
            bookingId: null,
            status: "FAILED",
            reason,
          });

          await sendAllocationNotification({
            userId: student._studentId,
            bookingId: null,
            status: "FAILED",
            reason,
            queueDate: queue._date,
            queueSlot: queue._timeSlot,
          });
        } catch (allocationStatusError) {
          console.error("Error updating allocation status:", allocationStatusError.message);
        }
      }

      // Update schedule status if needed
      if (schedule.timeSlots[timeSlotIndex]._availableSlots === 0 && allocatedStudents.length > 0) {
        schedule.timeSlots[timeSlotIndex]._status = "Fully Booked";
        schedule.timeSlots[timeSlotIndex]._isFullyBooked = true;
      }

      // Update queue with allocated and unallocated students
      queue.students = unallocatedStudents;
      await queue.save();
      await schedule.save();

      allocationResults.push({
        queueId: queue._id,
        allocated: allocatedStudents.length,
        unallocated: waitingStudents.length - allocatedStudents.length
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Students allocated based on priority scores.",
      data: {
        results: allocationResults,
        totalQueuesProcessed: allocationResults.length,
        totalAllocated: allocationResults.reduce((sum, result) => sum + result.allocated, 0),
        totalUnallocated: allocationResults.reduce((sum, result) => sum + result.unallocated, 0),
        statusChanges,
      }
    });

  } catch (error) {
    console.error("Error allocating students:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


export const cleanupEmptyQueues = async () => {
  try {
    await Queue.deleteMany({ students: { $size: 0 } });
  } catch (error) {
    console.error("Error cleaning up empty queues:", error);
  }
};