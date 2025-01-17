import Schedule from "../models/schedule.model.js";

// Function to fetch a schedule by date
export const getScheduleByDate = async (req, res) => {
    const { date } = req.params; 

    try {
        const schedule = await Schedule.findOne({ _date: new Date(date) });
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found." });
        }
        res.status(200).json(schedule); // Return the found schedule
    } catch (error) {
        console.error("Error fetching schedule:", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Function to create a new schedule 
export const createSchedule = async (req, res) => {
    const { _date, timeSlots } = req.body; 

    if (!_date || !timeSlots || !Array.isArray(timeSlots)) {
        return res.status(400).json({ success: false, message: "Date and time slots are required." });
    }

    const newSchedule = new Schedule({ _date, timeSlots });

    try {
        await newSchedule.save();
        res.status(201).json({ success: true, data: newSchedule });
    } catch (error) {
        console.error("Error creating schedule:", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Function to update a schedule time slot
export const updateSchedule = async (req, res) => {
    const { scheduleId, timeSlot } = req.body;  

    if (!scheduleId || !timeSlot) {
        return res.status(400).json({ success: false, message: "Schedule ID and time slot data are required." });
    }

    try {
        // Find the schedule by ID
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found." });
        }

        // Find the index of the time slot to update
        const slotIndex = schedule.timeSlots.findIndex(slot => slot._startTime === timeSlot._startTime);
        if (slotIndex === -1) {
            return res.status(404).json({ success: false, message: "Time slot not found." });
        }

        // Update the time slot with the new data
        schedule.timeSlots[slotIndex]._availableSlots = timeSlot._availableSlots;
        schedule.timeSlots[slotIndex]._status = timeSlot._status;

        // Save the updated schedule document
        await schedule.save();

        res.status(200).json({ success: true, message: "Time slot updated successfully.", data: schedule });
    } catch (error) {
        console.error("Error updating schedule:", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
};