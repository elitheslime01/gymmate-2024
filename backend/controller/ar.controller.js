import mongoose from "mongoose";
import AR from "../models/ar.model.js";

export const uploadAR = async (req, res) => {
    const { _code, _studentID } = req.body;

    if (!_code || !_studentID) {
        return res.status(400).json({ success: false, message: "One or more fields are empty" });
    }

    try {
        const existingAR = await AR.findOne({ _code });
        if (existingAR) {
            return res.status(400).json({ success: false, message: "AR code already exists." });
        }

        const newAR = new AR({ _code, _dateSubmitted: new Date(), _studentID });
        await newAR.save();
        
        res.status(201).json({ success: true, message: "AR code added successfully.", arId: newAR._id });
    } catch (error) {
        console.error("Error in Uploading AR: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const checkAR = async (req, res) => {
    const ar = req.body; 

    if (!ar._code || ar._code === "") 
    {
        return res.status(400).json({ success: false, message: "One or more fields are empty" });
    }

    try {
        const existingAR = await AR.findOne({ _code: ar._code });
        if (existingAR) {
            return res.status(400).json({ success: false, message: "AR code already used." });
        }
        return res.status(200).json({ success: true, message: "AR code is valid." });
    } catch (error) {
        console.error("Error in Checking AR: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};