import mongoose from "mongoose";
import AR from "../models/ar.model.js";

export const uploadAR = async (req, res) => {
    const ar = req.body; // user will send this data

    // Validate the required fields
    if (!ar._code || ar._code === "" ||
        !ar._dateSubmitted || ar._dateSubmitted === "" ||
        !ar._status || ar._status === "" ||
        !ar._studentID || ar._studentID === ""
    ) {
        return res.status(400).json({ success: false, message: "One or more fields are empty" });
    }

    try {
        // Check if the AR code already exists in the database
        const existingAR = await AR.findOne({ _code: ar._code });
        if (existingAR) {
            return res.status(400).json({ success: false, message: "AR code already used." });
        }

        // If the code does not exist, proceed to create a new AR
        const newAR = new AR(ar);
        await newAR.save();
        res.status(201).json({ success: true, data: newAR });
    } catch (error) {
        console.error("Error in Uploading AR: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};