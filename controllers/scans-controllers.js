const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Settings = require("../Models/Settings");
const Scans = require("../Models/Scans");

const submitScans = async (req, res) => {
  console.log(req.body);
  const { userId, doctorId, scanImages } = req.body;
  try {
    if ((userId, doctorId, scanImages)) {
      let createdScan = new Scans({
        userId,
        doctorId,
        scanImages,
        created: Date.now(),
      });
      createdScan.save((err) => {
        if (err) {
          throw new Error("Error saving scans");
        } else {
          res.json({
            success: true,
            message: "Successfully saved scans",
          });
        }
      });
    } else {
      throw new Error("Provide all the details");
    }
  } catch (err) {
    res.json({ message: err.message, success: false });
  }
};

const getMyScans = async (req, res) => {
  const { userId } = req.body;
  console.log(userId);
  try {
    if (userId) {
      let foundScans = await Scans.find({ userId: userId });
      console.log(foundScans);
      res.json({
        success: true,
        message: "Found Scans",
        foundScans: foundScans,
      });
    } else {
      throw new Error("User id is missing");
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = {
  submitScans,
  getMyScans,
};
