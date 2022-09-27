const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Settings = require("../Models/Settings");
const Library = require("../Models/Library");

const getArticles = async (req, res) => {
  try {
    let foundArticles = await Library.find({});
    if (foundArticles) {
      res.json({
        serverError: 0,
        message: "Articles found",
        data: {
          success: 1,
          articles: foundArticles,
        },
      });
      return;
    } else {
      res.json({
        serverError: 0,
        message: "No articles found",
        data: {
          success: 0,
        },
      });
      return;
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

const getSingleArticle = async (req, res) => {
  console.log(req.body);
  const { articleId } = req.body;

  try {
    let foundArticle = await Library.findOne({ _id: articleId });
    if (foundArticle) {
      res.json({
        serverError: 0,
        message: "Article found",
        data: {
          success: 1,
          article: foundArticle,
        },
      });
      return;
    } else {
      res.json({
        serverError: 0,
        message: "No article found",
        data: {
          success: 0,
        },
      });
      return;
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
  getArticles,
  getSingleArticle,
};
