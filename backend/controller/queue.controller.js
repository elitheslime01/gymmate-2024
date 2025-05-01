import mongoose from "mongoose";
import Queue from "../models/queue.model.js";
import Student from "../models/student.model.js";
import AR from "../models/ar.model.js";
import MaxHeap from '../utils/maxHeap.js';
import Booking from "../models/booking.model.js";
import Schedule from "../models/schedule.model.js";
import { updateStudentMetrics } from "./student.controller.js";

// Calculate priority score with the new logic
const calculatePriorityScore = (student) => {
  if (!student._unsuccessfulAttempts && !student._attendedSlots && !student._noShows) {
    // New student with no history
    return 0;
  }
  
  const unsuccessfulPoints = student._unsuccessfulAttempts || 0;
  const noShowPenalty = Math.floor((student._noShows || 0) / 2);
  const attendanceBonus = student._attendedSlots || 0;
  const attendanceResetPenalty = Math.floor((student._attendedSlots || 0) / 3);

  return attendanceBonus + unsuccessfulPoints - noShowPenalty - attendanceResetPenalty;
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

  // // Validate date
  // if (new Date(_date) < new Date()) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Cannot queue for past dates"
  //   });
  // }

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



  // In the addStudentToQueue function, replace the existing priority score calculation:
  queue.students.push({
    _studentId: _studentId,
    _scheduleId: _scheduleId,
    _timeSlotId: _timeSlotId,
    _arID: _arId,
    _priorityScore: calculatePriorityScore(student),
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

export const fetchCurrentMonthQueues = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

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

    // Initialize allocationResults array
    const allocationResults = [];

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
      
      // Add all students from this queue to the heap
      try {
        queue.students.forEach(student => {
          maxHeap.insert(student);
        });
      } catch (error) {
        console.error("Error inserting students into heap:", error);
        continue; // Skip this queue and move to next one
      }

      // Get schedule and time slot info once
      const firstStudent = queue.students[0];
      const schedule = await Schedule.findById(firstStudent._scheduleId);
      const timeSlotIndex = schedule.timeSlots.findIndex(
        slot => slot._startTime === queue._timeSlot.startTime
      );

      if (!schedule || timeSlotIndex === -1) {
        continue; // Skip this queue if schedule/timeslot not found
      }

      const allocatedStudents = [];
      const unallocatedStudents = [];

      // Allocate students based on priority until slots run out
      while (maxHeap.size() > 0 && schedule.timeSlots[timeSlotIndex]._availableSlots > 0) {
        const student = maxHeap.extractMax();

        // Add to booking
        const existingBooking = await Booking.findOne({
          _date: queue._date,
          "_timeSlot.startTime": queue._timeSlot.startTime,
          "_timeSlot.endTime": queue._timeSlot.endTime,
        });

        if (existingBooking?.students.some(s => s._studentId.toString() === student._studentId.toString())) {
          continue;
        }

        // Update metrics for successful allocation
        await updateStudentMetrics(student._studentId, 'attended');

        if (existingBooking) {
          existingBooking.students.push(student);
          await existingBooking.save();
        } else {
          const newBooking = new Booking({
            _date: queue._date,
            _timeSlot: queue._timeSlot,
            students: [student],
          });
          await newBooking.save();
        }

        // Decrement available slots
        schedule.timeSlots[timeSlotIndex]._availableSlots -= 1;
        allocatedStudents.push(student);
      }

      // Process remaining unallocated students
      while (maxHeap.size() > 0) {
        const student = maxHeap.extractMax();
        // Update metrics for unsuccessful allocation
        await updateStudentMetrics(student._studentId, 'unsuccessful');
        unallocatedStudents.push(student);
      }

      // Update the queue with only unallocated students
      queue.students = unallocatedStudents;
      await queue.save();
      
      // Save schedule changes
      await schedule.save();

      allocationResults.push({
        queueId: queue._id,
        allocated: allocatedStudents.length,
        unallocated: unallocatedStudents.length
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Students allocated based on priority scores.",
      data: {
          results: allocationResults,
          totalQueuesProcessed: allocationResults.length,
          totalAllocated: allocationResults.reduce((sum, result) => sum + result.allocated, 0),
          totalUnallocated: allocationResults.reduce((sum, result) => sum + result.unallocated, 0)
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

// export const allocateStudentsToBooking = async (req, res) => {
//   try {
//     // Fetch all queues
//     const queues = await Queue.find({}).populate("students._studentId").populate("students._scheduleId").populate("students._arID");

//     // Initialize an array to store students who couldn't be allocated
//     const unallocatedStudents = [];

//     // Loop through each queue
//     for (const queue of queues) {
//       // Check if a booking already exists for the queue's date and time slot
//       const existingBooking = await Booking.findOne({
//         _date: queue._date,
//         "_timeSlot.startTime": queue._timeSlot.startTime,
//         "_timeSlot.endTime": queue._timeSlot.endTime,
//       });

//       // If a booking already exists, use it instead of creating a new one
//       if (existingBooking) {
//         // Add students from the queue to the existing booking
//         existingBooking.students = existingBooking.students.concat(queue.students);
//         await existingBooking.save();
//       } else {
//         // Create a new booking if one does not exist
//         const newBooking = new Booking({
//           _date: queue._date,
//           _timeSlot: queue._timeSlot,
//           students: queue.students,
//         });
//         await newBooking.save();
//       }

//       // Decrement available slots in the schedule for each allocated student
//       for (const student of queue.students) {
//         const schedule = await Schedule.findById(student._scheduleId);
//         if (schedule) {
//           const timeSlotIndex = schedule.timeSlots.findIndex((slot) => slot._startTime === queue._timeSlot.startTime);
//           if (timeSlotIndex !== -1) {
//             if (schedule.timeSlots[timeSlotIndex]._availableSlots > 0) {
//               schedule.timeSlots[timeSlotIndex]._availableSlots -= 1;
//               await schedule.save();
//             } else {
//               // If no more available slots, add student to unallocatedStudents array
//               unallocatedStudents.push(student);
//               break; // Stop allocating students for this queue
//             }
//           }
//         } else {
//           // If schedule is not found, add all students to unallocatedStudents array
//           unallocatedStudents.push(...queue.students);
//           break; // Stop allocating students for this queue
//         }
//       }

//       // Remove the queue after allocating its students to a booking
//       await Queue.deleteOne({ _id: queue._id });
//     }

//     // Return a response with the unallocated students
//     if (unallocatedStudents.length > 0) {
//       res.status(200).json({
//         success: true,
//         message: "Students allocated to booking collection successfully, but some students couldn't be allocated due to no more available slots.",
//         unallocatedStudents: unallocatedStudents,
//       });
//     } else {
//       res.status(200).json({ success: true, message: "Students allocated to booking collection successfully." });
//     }
//   } catch (error) {
//     console.error("Error allocating students to booking collection:", error.message);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// };