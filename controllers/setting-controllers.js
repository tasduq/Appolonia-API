const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Settings = require("../Models/Settings");

const getRoles = async (req, res) => {
  let roles = await Role.find({});
  res.json({
    success: true,
    roles: roles,
  });
};

const createRole = async (req, res) => {
  console.log(req.body);
  let { roleName } = req.body;
  roleName = roleName.toLowerCase();
  console.log(roleName);
  let findRole = await Role.findOne({ roleName: roleName });
  if (findRole) {
    res.json({
      success: false,
      message: "A role with same name already available",
    });
    return;
  }

  let createdRole = new Role({
    roleName: roleName,
  });

  createdRole.save((err) => {
    if (err) {
      console.log(err);
      res.json({ success: false, message: "Error creating role" });
    } else {
      res.json({ success: true, message: "Role created" });
    }
  });
};

const addSettingsData = async (req, res) => {
  console.log(req.body);

  const { clinicName, clinicLogo, version, fcmKey, forceUpdate } = req.body;

  const createdSettings = new Settings({
    clinicName: clinicName,
    clinicLogo: clinicLogo,
    version: version,
    fcmKey: fcmKey,
    forceUpdate: forceUpdate,
  });

  createdSettings.save((err) => {
    if (err) {
      res.json({
        message: "Somthing went wrong",
        success: false,
      });
    } else {
      res.json({
        message: "Settings saved",
        success: true,
      });
    }
  });
};

const getSettings = async (req, res) => {
  let settingsFound = await Settings.find({});
  console.log(settingsFound[0]);
  res.json({
    success: true,
    message: "settings found",
    settingsFound: settingsFound[0],
  });
};

module.exports = {
  getRoles,
  createRole,
  addSettingsData,
  getSettings,
};
