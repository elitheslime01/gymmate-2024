import mongoose from "mongoose";
import Student from "../models/student.model.js";

export const createStudent = async (req, res) => {
    const student = req.body; //user will send this data

    if (!student._fName || student._fName == "" ||
        !student._lName || student._lName == "" ||
        !student._sex || student._sex == "" ||
        !student._college || student._college == "" ||
        !student._course || student._course == "" ||
        !student._year || student._year == "" ||
        !student._section || student._section == "" ||
        !student._umakEmail || student._umakEmail == "" ||
        !student._umakID || student._umakID == "" ||
        !student._password || student._password == "" ||
        !student._lastLogin || student._lastLogin == "" ||
        !student._activeStat || student._activeStat == "" ||
        !student._isAthlete || student._isAthlete == ""
    ) {
        return res.status(400).json({ success:false, message: "Please fill in all fields" });
    }

    const newStudent = new Student(student);

    try {
        await newStudent.save();
        res.status(201).json({success: true, data: newAdmin});
    } catch (error) {
        console.error("Error in Creating Student: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }

}