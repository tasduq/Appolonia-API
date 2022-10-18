const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Scans = require("../Models/Scans");

var CryptoJS = require("crypto-js");

const getFileFamilyMembers = async (req, res) => {
  console.log(req.headers);
  console.log(req.body);
  const { fileId } = req.body;

  let foundFile = await File.findOne({ _id: fileId }, "familyMembers");
  let { familyMembers } = foundFile;
  // let decryptedFamilyMembers = [];
  // for (member of familyMembers) {
  //   console.log("i am member", member);
  //   if (member?.connected === true) {
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
  //     // return yoo;
  //     decryptedFamilyMembers = [...decryptedFamilyMembers, decryptedemiratesId];
  //   }
  // }

  // console.log(decryptedFamilyMembers, "i am family");
  console.log(familyMembers, "i am family");

  let usersId = [];

  for (member of familyMembers) {
    if (member.connected === true) {
      usersId.push(member.userId);
    }
  }

  console.log(usersId, "i am ids");

  let connectedFamily = await User.find({
    _id: { $in: usersId },
  });
  console.log(connectedFamily, "i am connectedfamily");

  let yoo = [];
  yoo = connectedFamily.map(async (member) => {
    let userScans = await Scans.find({ userId: member._id }).limit(5);

    return {
      firstName: member.firstName,
      lastName: member.lastName,
      fileNumber: member.uniqueId1,
      emiratesId: member.uniqueId2,
      userId: member._id,
      phoneNumber: member?.phoneNumber,
      email: member?.email,
      gender: member?.gender,
      city: member?.city,
      assignedDoctorId: member?.assignedDoctorId
        ? member?.assignedDoctorId
        : "",
      assignedDoctorName: "Testdoctor",
      role: member?.role,
      image: member?.image
        ? member?.image
        : "https://www.clipartmax.com/png/middle/344-3442642_clip-art-freeuse-library-profile-man-user-people-icon-icono-de-login.png",
      scans: [],
    };
  });
  let resolvedFamilyData = await Promise.all(yoo);
  console.log(resolvedFamilyData);

  if (foundFile) {
    res.json({
      serverError: 0,
      message: "File Found",
      data: {
        success: 1,
        foundFamily: resolvedFamilyData,
      },
    });
  } else {
    res.json({
      serverError: 0,
      message: "File not found. File id may be incorrect",
      data: {
        success: 0,
      },
    });
  }
};

const connectMemberToFile = async (req, res, next) => {
  console.log(req.body);
  const { fileId, memberEmiratesId } = req.body;

  //   let foundFile = await File.

  File.findOneAndUpdate(
    { _id: fileId, "familyMembers.uniqueId": memberEmiratesId },
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

const addFamilyMember = async (req, res) => {
  console.log(req.body);
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    emiratesId,
    role,
    countryCode,
    city,
    gender,
    dob,
    fileNumber,
  } = req.body;

  try {
    let existingUser;
    existingUser = await User.findOne({ uniqueId1: fileNumber });
    console.log(existingUser, "i am existing");

    if (existingUser) {
      res.json({
        serverError: 0,
        message: "User file number already exist",
        data: {
          success: 0,
        },
      });
      return;
    }

    existingUser = await User.findOne({ uniqueId2: emiratesId });

    if (existingUser) {
      res.json({
        serverError: 0,
        message: "Emirates Id already exist",
        data: {
          success: 0,
        },
      });
      return;
    }

    let hashedemiratesId;
    let hashedfileNumber;

    try {
      hashedemiratesId = CryptoJS.AES.encrypt(emiratesId, "love").toString();
      hashedfileNumber = CryptoJS.AES.encrypt(fileNumber, "love").toString();
      console.log(hashedemiratesId, "i am emirates");
    } catch (err) {
      console.log("Something went wrong while Encrypting Data", err);

      throw new Error("Something went wrong while Encrypting Data");
    }

    // let existingFile = File.findOne({phoneNumber : phoneNumber , "familyMembers.emiratesId" : emiratesId })

    let newMember = new User({
      firstName,
      lastName,
      email: email,
      phoneNumber: phoneNumber,
      emiratesId: hashedemiratesId,
      role,
      countryCode,
      city,
      gender,
      dob,
      fileNumber: hashedfileNumber,
      uniqueId1: fileNumber,
      uniqueId2: emiratesId,
      image:
        "https://www.clipartmax.com/png/middle/344-3442642_clip-art-freeuse-library-profile-man-user-people-icon-icono-de-login.png",
    });

    newMember.save((err, userDoc) => {
      if (err) {
        console.log(err);
        throw new Error("Error saving the user");
      } else {
        File.updateOne(
          { phoneNumber: phoneNumber },
          {
            $push: {
              familyMembers: {
                memberEmiratesId: hashedemiratesId,
                uniqueId: emiratesId,
                connected: false,
                userId: userDoc._id.toString(),
              },
            },
          },
          (err) => {
            if (err) {
              throw new Error("Error creating the User");
            } else {
              res.json({
                serverError: 0,
                message:
                  "Family Member added. You would be notified from the clinic soon",
                data: {
                  success: 1,
                },
              });
              return;
            }
          }
        );
      }
    });
  } catch (err) {
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

module.exports = {
  getFileFamilyMembers,
  connectMemberToFile,
  addFamilyMember,
};
