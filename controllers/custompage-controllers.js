const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Settings = require("../Models/Settings");
const Library = require("../Models/Library");
const Custompage = require("../Models/Customepage");

const getCustomPages = async (req, res) => {
  console.log(req.body);
  const { pageId } = req.body;

  try {
    if (pageId) {
      let foundPage = await Custompage.findOne({ pageId: pageId });
      if (foundPage) {
        res.json({
          serverError: 0,
          message: "Page found",
          data: {
            success: 1,
            page: foundPage,
          },
        });
        return;
      } else {
        res.json({
          serverError: 0,
          message: "No Page found",
          data: {
            success: 0,
          },
        });
        return;
      }
    } else {
      let foundPages = await Custompage.find({});
      if (foundPages.length > 0) {
        res.json({
          serverError: 0,
          message: "Pages found",
          data: {
            success: 1,
            page: foundPages,
          },
        });
        return;
      } else {
        res.json({
          serverError: 0,
          message: "No Pages found",
          data: {
            success: 0,
          },
        });
        return;
      }
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
    return;
  }
};

module.exports = {
  getCustomPages,
};
