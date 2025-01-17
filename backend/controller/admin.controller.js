import mongoose from "mongoose";
import Admin from "../models/admin.model.js";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    const admin = await Admin.findOne({ _umakEmail: email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid Email." });
    }

    const isMatch = await Admin.findOne({ _password: password });
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Password." });
    }

    admin._activeStat = true;
    await admin.save(); 

    res.status(200).json({ success: true, user: { id: admin._id, name: admin._fName } });
  } catch (error) {
    console.error("Error during admin login: ", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const logoutAdmin = async (req, res) => {
  const { userId } = req.body;

  try {
      const admin = await Admin.findById(userId);
      if (!admin) {
          return res.status(404).json({ success: false, message: "Admin not found." });
      }

      admin._activeStat = false;
      await admin.save();

      res.status(200).json({ success: true, message: "Logout successful." });
  } catch (error) {
      console.error("Error during admin logout: ", error.message);
      res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({});
        res.status(200).json({success: true, data: admins});
    } catch (error) {
        console.log("error in fetching schedules: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

export const createAdmin = async (req, res) => {
    const admin = req.body; 

    if (!admin._fName || admin._fName == "" ||
        !admin._lName || admin._lName == "" ||
        !admin._gender || admin._gender == "" ||
        !admin._umakEmail || admin._umakEmail == "" ||
        !admin._umakIDNum || admin._umakIDNum == "" ||
        !admin._role || admin._role == "" ||
        !admin._password || admin._password == "" ||
        !admin._activeStat || admin._activeStat == "" ||
        !admin._dateReg || admin._dateReg == "" ||
        !admin._lastLogin || admin._lastLogin == ""
    ) {
        return res.status(400).json({ success:false, message: "Please fill in all fields" });
    }

    const newAdmin = new Admin(admin);

    try {
        await newAdmin.save();
        res.status(201).json({success: true, data: newAdmin});
    } catch (error) {
        console.error("Error in Create Schedule: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }

}
