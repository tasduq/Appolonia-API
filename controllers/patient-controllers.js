const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Settings = require("../Models/Settings");
const Scans = require("../Models/Scans");

const getAllPatients = async (req, res) => {
  try {
    let allPatients = await User.find({ role: "1" });
    console.log(allPatients);

    if (allPatients.length > 0) {
      res.json({
        serverError: 0,
        message: "Patients Found",
        data: {
          success: 1,
          allPatients: allPatients,
        },
      });
    } else {
      res.json({
        serverError: 0,
        message: "Patients Not Found",
        data: {
          success: 0,
          allPatients: allPatients,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};

module.exports = {
  getAllPatients,
};
