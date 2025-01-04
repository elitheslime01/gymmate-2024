import Queue from "../models/queue.model.js";
import Student from "../models/student.model.js";
import AR from "../models/ar.model.js";

// Function to add a student to the queue
export const addStudentToQueue = async (req, res) => {
    
    const { studentId, date, timeSlot, scheduleId, arId } = req.body;
    const arImage = req.files.buffer;

    // Validate input
    if (
      !studentId ||
      !date ||
      !timeSlot ||
      !timeSlot.startTime ||
      !timeSlot.endTime ||
      !scheduleId ||
      !arId ||
      !arImage
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student ID, date, time slot (start and end times), schedule ID, AR ID, and image are required.",
      });
    }
  
    try {
      // Check if the student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found." });
      }
  
      // Check if the AR exists
      const ar = await AR.findById(arId);
      if (!ar) {
        return res.status(404).json({ success: false, message: "AR not found." });
      }
  
      // Check if the queue for the specified date and time slot already exists
      let queue = await Queue.findOne({
        _date: date,
        "_timeSlot.startTime": timeSlot.startTime,
        "_timeSlot.endTime": timeSlot.endTime,
      });
  
      // If the queue does not exist, create a new one
      if (!queue) {
        queue = new Queue({
          _date: date,
          _timeSlot: {
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
          },
          students: [], // Initialize with an empty students array
        });
      }
  
      // Check if the student is already in the queue
      const studentExists = queue.students.some(
        (student) => student._studentId.toString() === studentId
      );
      if (studentExists) {
        return res.status(400).json({
          success: false,
          message: "Student is already in the queue for this time slot.",
        });
      }
  
      // Add the student to the queue with the AR ID
      queue.students.push({ _studentId: studentId, _scheduleID: scheduleId, _arID: arId, _arImage: arImage.buffer });
  
      // Save the queue
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