import mongoose from "mongoose";
import Student from "../models/student.model.js";

export const createStudent = async (req, res) => {
  const student = req.body; // User will send this data

  if (!student._fName || !student._lName || !student._sex || 
      !student._college || !student._course || !student._year || 
      !student._section || !student._umakEmail || !student._umakID || 
      !student._password || !student._lastLogin) {
      return res.status(400).json({ success: false, message: "Please fill in all fields" });
  }

  const newStudent = new Student({
      ...student,
      _unsuccessfulAttempts: 0, 
      _noShows: 0,
      _attendedSlots: 0,
  });

  try {
      // Save the student
      await newStudent.save();
      res.status(201).json({ success: true, data: newStudent });
  } catch (error) {
      console.error("Error in Creating Student: ", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const loginStudent = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }
  
    try {
    const student = await Student.findOne({ _umakEmail: email });
      if (!student) {
        return res.status(401).json({ success: false, message: "Invalid Email." });
      }
  
      const isMatch = await Student.findOne({ _password: password });
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid Password." });
      }
  
      student._activeStat = true;
      await student.save();
  
      res.status(200).json({ 
        success: true, 
        user: {
            _id: student._id,
            _fName: student._fName,
            _lName: student._lName,
            _sex: student._sex,
            _college: student._college,
            _course: student._course,
            _year: student._year,
            _section: student._section,
            _umakEmail: student._umakEmail,
            _umakID: student._umakID,
            _activeStat: student._activeStat,
        }
      });    
    } catch (error) {
      console.error("Error during student login: ", error.message);
      res.status(500).json({ success: false, message: "Server error." });
    }
  };

  // Function to update student metrics
  export const updateStudentMetrics = async (studentId, status) => {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        console.error('Student not found:', studentId);
        return;
      }
  
      switch(status) {
        case 'unsuccessful':
          student._unsuccessfulAttempts += 1;
          break;
        case 'noShow':
          student._noShows += 1;
          // Reset unsuccessful attempts when marked as no-show
          student._unsuccessfulAttempts = 0;
          break;
        case 'attended':
          student._attendedSlots += 1;
          // Reset unsuccessful attempts when attended
          student._unsuccessfulAttempts = 0;
          // Reset no-shows for every 3 attended slots
          if (student._attendedSlots % 3 === 0 && student._noShows > 0) {
            student._noShows -= 1;
          }
          break;
        default:
          console.warn('Unknown status:', status);
          return;
      }
  
      // Calculate priority score
      // Higher score = lower priority
      // Formula: unsuccessful attempts + attended slots - (no-shows / 2)
      student._priorityScore = 
        student._unsuccessfulAttempts + 
        student._attendedSlots - 
        Math.floor(student._noShows / 2);
  
      // Save the updated student record
      const updatedStudent = await student.save();
      console.log('Updated student metrics:', {
        studentId: updatedStudent._id,
        unsuccessfulAttempts: updatedStudent._unsuccessfulAttempts,
        noShows: updatedStudent._noShows,
        attendedSlots: updatedStudent._attendedSlots,
        priorityScore: updatedStudent._priorityScore
      });
  
      return updatedStudent;
    } catch (error) {
      console.error('Error updating student metrics:', error);
      throw error;
    }
  };
  
  export const logoutStudent = async (req, res) => {
    const { userId } = req.body;
  
    try {
        const student = await Student.findById(userId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }
        student._activeStat = false;
        await student.save();
  
        res.status(200).json({ success: true, message: "Logout successful." });
    } catch (error) {
        console.error("Error during student logout: ", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
  };