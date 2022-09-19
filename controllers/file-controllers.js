const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");

var CryptoJS = require("crypto-js");

const getFileFamilyMembers = async (req, res) => {
  console.log(req.body);
  const { fileId } = req.body;

  let foundFile = await File.findOne({ _id: fileId }, "familyMembers");
  let { familyMembers } = foundFile;
  //   let decryptedFamilyMembers = familyMembers.map((member) => {
  //     let yoo = member;
  //     console.log(yoo, "i am yoo");
  //     let decryptedemiratesId;
  //     decryptedemiratesId = CryptoJS.AES.decrypt(yoo.memberEmiratesId, "love");
  //     decryptedemiratesId = decryptedemiratesId.toString(CryptoJS.enc.Utf8);
  //     console.log(decryptedemiratesId, "i am decrypted");
  //     yoo = {
  //       ...yoo,
  //       memberEmiratesId: decryptedemiratesId,
  //     };
  //     console.log(yoo, "i am yoo");
  //     return yoo;
  //   });

  //   console.log(decryptedFamilyMembers, "i am family");

  if (foundFile) {
    res.json({
      success: true,
      foundFamily: familyMembers,
    });
  }
};

const connectMemberToFile = async (req, res, next) => {
  console.log(req.body);
  const { fileId, memberEmiratesId } = req.body;

  //   let foundFile = await File.

  File.findOneAndUpdate(
    { _id: fileId, "familyMembers.memberEmiratesId": memberEmiratesId },
    { $set: { "familyMembers.$.connected": true } },
    { new: true },
    (err, doc) => {
      console.log(doc, "i am doc");
      if (err) {
        console.log(err);
        res.json({
          success: true,
          message: "Somthing Went Wrong",
        });
      } else {
        if (doc === null) {
          res.json({ success: false, message: "Member not found" });
          return;
        }
        res.json({
          success: true,
          message: "Member joined the family account",
        });
      }
    }
  );
};

module.exports = {
  getFileFamilyMembers,
  connectMemberToFile,
};
