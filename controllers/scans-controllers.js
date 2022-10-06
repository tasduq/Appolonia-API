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
      createdScan.save((err, doc) => {
        if (err) {
          throw new Error("Error saving scans");
        } else {
          res.json({
            errorCode: 0,
            message: "Successfully saved scans",
            data: {
              success: 1,
              scanId: doc?._id,
            },
          });
          return;
        }
      });
    } else {
      // throw new Error("Provide all the details");
      res.json({
        errorCode: 0,
        message: "Send all the data please",
        data: {
          success: 0,
        },
      });
      return;
    }
  } catch (err) {
    res.json({
      errorCode: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
    return;
  }
};

const getMyScans = async (req, res) => {
  const { userId } = req.body;
  console.log(userId);
  try {
    if (userId) {
      let foundScans = await Scans.find({ userId: userId });
      console.log(foundScans);
      if (foundScans.length > 0) {
        res.json({
          errorCode: 0,
          message: "found scans",
          data: {
            success: 1,
            scans: foundScans,
          },
        });
        return;
      } else {
        res.json({
          errorCode: 0,
          message: "No Scans found",
          data: {
            success: 0,
            scans: foundScans,
          },
        });
        return;
      }
    } else {
      // throw new Error("User id is missing");
      res.json({
        errorCode: 0,
        message: "User id is missing",
        data: {
          success: 0,
        },
      });
      return;
    }
  } catch (err) {
    // res.json({ success: false, message: err.message });
    res.json({
      errorCode: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
    return;
  }
};

const getAllScans = async (req, res) => {
  const { userId } = req.body;
  console.log(userId);
  try {
    let foundScans = await Scans.find({});
    console.log(foundScans, "i am found");
    res.json({
      errorCode: 0,
      message: "found scans",
      data: {
        success: 1,
        scans: foundScans[foundScans?.length - 1].scanImages[0],
      },
    });
    return;
  } catch (err) {
    // res.json({ success: false, message: err.message });
    res.json({
      errorCode: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
    return;
  }
};

module.exports = {
  submitScans,
  getMyScans,
  getAllScans,
};
