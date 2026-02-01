import mongoose from "mongoose";
import Student from "../models/student.model.js";

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({});
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching students: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

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
        if (!student) return;

        switch (status) {
            case 'attended':
                student._attendedSlots += 1;
                student._unsuccessfulAttempts = 0;
                // If student has 3 attended sessions, reduce no-shows by 1 (if any)
                if (student._attendedSlots % 3 === 0 && student._noShows > 0) {
                    student._noShows -= 1;
                }
                break;
            case 'noShow':
                // Increment no-shows by 1 (not 2)
                student._noShows += 1;
                break;
            case 'unsuccessful':
                student._unsuccessfulAttempts += 1;
                break;
        }

        // Recalculate priority score
        student._priorityScore = 
            student._unsuccessfulAttempts + 
            student._attendedSlots - 
            Math.floor(student._noShows / 2);

        await student.save();
        return student;
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

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Student.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating student: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }
    res.status(200).json({ success: true, message: "Student deleted." });
  } catch (error) {
    console.error("Error deleting student: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};