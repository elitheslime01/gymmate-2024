import mongoose from "mongoose";
import Student from "../models/student.model.js";

export const createStudent = async (req, res) => {
    const student = req.body; //user will send this data

    if (!student._fName ||
        !student._lName ||
        !student._sex ||
        !student._college ||
        !student._course ||
        !student._year || 
        !student._section ||
        !student._umakEmail || 
        !student._umakID || 
        !student._password ||
        !student._lastLogin)
    {
        return res.status(400).json({ success:false, message: "Please fill in all fields" });
    }

    const newStudent = new Student(student);

    try {
        await newStudent.save();
        res.status(201).json({success: true, data: newStudent});
    } catch (error) {
        console.error("Error in Creating Student: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }

}

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
  
      // Set _activeStat to true upon successful login
      student._activeStat = true;
      await student.save(); // Save the updated student document
  
      res.status(200).json({ success: true, user: { id: student._id, name: student._fName } });
    } catch (error) {
      console.error("Error during student login: ", error.message);
      res.status(500).json({ success: false, message: "Server error." });
    }
  };
  
  export const logoutStudent = async (req, res) => {
    const { userId } = req.body; // Assuming you send the user ID when logging out
  
    try {
        const student = await Student.findById(userId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }
  
        // Set _activeStat to false upon logout
        student._activeStat = false;
        await student.save(); // Save the updated student document
  
        res.status(200).json({ success: true, message: "Logout successful." });
    } catch (error) {
        console.error("Error during student logout: ", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
  };