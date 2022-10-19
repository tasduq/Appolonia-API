const bcrypt = require("bcryptjs");
var otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
var CryptoJS = require("crypto-js");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");
const { encrypt, decrypt, randomKey } = require("lab46-encrypt");
const { JWTKEY, SMTPPASS, accountSid, authToken } = require("../Config/config");
// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

// cloudinary.config({
//   cloud_name: "dbff6tzuo",
//   api_key: "376437619835514",
//   api_secret: "Jz-U91pJTdFnbWN4X6Lx3fj6pC4",
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "DEV",
//   },
// });

// const uploadFiles = multer({ storage: storage });

var KEY = "qwertyuiopasdfghjklzxcvbnm123456";

const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Contact = require("../Models/Contact");
const Filephoneverified = require("../Models/Filephoneverification");
const Forgotphoneverified = require("../Models/Forgotphonrverification");
const Conversation = require("../Models/Conversations");
const Message = require("../Models/Messages");
const Scans = require("../Models/Scans");
const Settings = require("../Models/Settings");

// const accountSid = "AC05d6ccacda0201d3e850b4ce60c773af";
// const authToken = "5f7f59ab3a6bdf8fcc2d810e6be45f98";
const client = require("twilio")(accountSid, authToken);

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    res.json({ success: false, message: "Error Geting Users" });
    return;
  }
  res.json({ users: users });
};

const getUserdata = async (req, res) => {
  const { userId } = req.body;
  let foundUser = await User.findOne({ _id: userId });
  console.log(foundUser, "i am user");

  if (foundUser) {
    // let decryptedFileNumber;
    // decryptedFileNumber = CryptoJS.AES.decrypt(foundUser?.fileNumber, "love");
    // decryptedFileNumber = decryptedFileNumber.toString(CryptoJS.enc.Utf8);
    // let decryptedEmiratesId;
    // decryptedEmiratesId = CryptoJS.AES.decrypt(foundUser?.emiratesId, "love");
    // decryptedEmiratesId = decryptedEmiratesId.toString(CryptoJS.enc.Utf8);
    // console.log(decryptedFileNumber, decryptedEmiratesId, "decrupted");
    foundUser = {
      _id: foundUser._id,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      email: foundUser.email,
      phoneNumber: foundUser.phoneNumber,
      emiratesId: foundUser.uniqueId2,
      fileNumber: foundUser.uniqueId1,
      gender: foundUser.gender,
      city: foundUser.city,
      dob: foundUser.dob,
      role: foundUser.role,
    };
    res.json({
      serverError: 0,
      message: "User found",
      data: {
        success: 1,
        userData: foundUser,
      },
    });
    return;
  } else {
    // res.json({ success: false, message: "User not found" });
    res.json({
      serverError: 0,
      message: "User not found",
      data: {
        success: 0,
      },
    });
    return;
  }
};

const updateUserProfile = async (req, res) => {
  console.log(req.body);
  const {
    firstName,
    lastName,
    emiratesId,
    fileNumber,
    gender,
    dob,
    email,
    city,
    isEmiratesIdChanged,
    isFileNumberChanged,
    isFamilyHead,
    userId,
    fileId,
  } = req.body;

  if (isFileNumberChanged === "1") {
    let existing = await User.findOne({ uniqueId1: fileNumber });
    if (existing) {
      res.json({
        serverError: 0,
        message: "File Number Already Exist",
        data: {
          success: 0,
        },
      });
      return;
    }
  }

  if (isEmiratesIdChanged === "1") {
    let existing = await User.findOne({ uniqueId2: emiratesId });
    if (existing) {
      res.json({
        serverError: 0,
        message: "Emirates Id Already Exist",
        data: {
          success: 0,
        },
      });
      return;
    }
  }

  let hashedemiratesId;
  let hashedFileNumber;

  try {
    hashedemiratesId = CryptoJS.AES.encrypt(emiratesId, "love").toString();
    hashedFileNumber = CryptoJS.AES.encrypt(fileNumber, "love").toString();
    console.log(hashedemiratesId, hashedFileNumber, "i am emirates");
  } catch (err) {
    console.log("Something went wrong while Encrypting Data", err);

    throw new Error("Something went wrong while Encrypting Data");
  }

  let data = {
    firstName,
    lastName,
    emiratesId: hashedemiratesId,
    fileNumber: hashedFileNumber,
    gender,
    dob,
    email,
    city,
    uniqueId1: fileNumber,
    uniqueId2: emiratesId,
  };

  try {
    User.updateOne({ _id: userId }, data, { new: true }, (err) => {
      if (err) {
        console.log(err);
        throw new Error("Error updating the user");
      } else {
        if (isFamilyHead === "1") {
          File.updateOne(
            { _id: fileId },
            { $set: { uniqueId: emiratesId, emiratesId: hashedemiratesId } },
            (err) => {
              if (err) {
                console.log(err);
                throw new Error("Error updating the user");
              } else {
                File.updateOne(
                  { _id: fileId, "familyMembers.userId": userId },
                  {
                    $set: {
                      "familyMembers.$.memberEmiratesId": hashedemiratesId,
                      "familyMembers.$.uniqueId": emiratesId,
                    },
                  },
                  (err) => {
                    if (err) {
                      throw new Error("Error updating the user");
                    } else {
                      res.json({
                        serverError: 0,
                        message: "User data updated",
                        data: { success: 1 },
                      });
                    }
                  }
                );
              }
            }
          );
        } else {
          File.updateOne(
            { _id: fileId, "familyMembers.userId": userId },
            {
              $set: {
                "familyMembers.$.memberEmiratesId": hashedemiratesId,
                "familyMembers.$.uniqueId": emiratesId,
              },
            },
            (err) => {
              if (err) {
                throw new Error("Error updating the user");
              } else {
                res.json({
                  serverError: 0,
                  message: "User data updated",
                  data: { success: 1 },
                });
              }
            }
          );
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

const checkPatient = async (req, res) => {
  console.log(req.body);
  const { isFileNumber, fileNumber, emiratesId } = req.body;

  let otp = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log(otp, "i am otp");
  if (!otp) {
    throw new Error("Error Genrating OTP");
  }
  try {
    if (isFileNumber === "1") {
      let user = await User.findOne({ uniqueId1: fileNumber });
      if (!user) {
        let clinic = await Settings.find({}, "clinicName");
        console.log(clinic[0], "i am clinic");
        res.json({
          serverError: 0,
          message: `Welcome to ${clinic[0]?.clinicName} . We would like to have some details to activate your account.`,
          data: {
            success: 0,
            isExisting: 0,
            clinicVerified: 0,
            active: 0,
            activeRequested: 0,
            phoneVerified: 0,
          },
        });
        return;
      }

      let fileExist = await File.findOne({
        phoneNumber: user.phoneNumber,
      });
      if (!fileExist) {
        // throw new Error("No account is registered with that File Number");
        res.json({
          serverError: 0,
          message:
            "No account is registered with that File Number or your phone number is no longer associated to that family account",
          data: {
            success: 0,
            isExisting: 0,
            clinicVerified: 0,
            active: 0,
            activeRequested: 0,
            phoneVerified: 0,
          },
        });
        return;
      } else {
        if (fileExist?.phoneVerified === false) {
          let foundForgotPhone = await Filephoneverified.findOne({
            fileId: fileExist._id,
          });

          if (foundForgotPhone) {
            Filephoneverified.deleteOne(
              { fileId: fileExist._id },
              async (err) => {
                if (err) {
                  throw new Error("Error deleting the OTP Session");
                } else {
                  console.log("deleted previous");
                }
              }
            );
          }
          // sendPhoneOtp(fileExist.phoneNumber, otp);
          try {
            await sendEmailOtp(email, otp);
          } catch (err) {
            console.log(err.message);
          }

          const createdFilephoneverification = new Filephoneverified({
            otp: otp,
            fileId: fileExist._id,
            created: Date.now(),
            expires: Date.now() + 600000,
          });

          createdFilephoneverification.save((err) => {
            if (err) {
              throw new Error("Error saving the OTP");
            } else {
              res.json({
                serverError: 0,
                message:
                  "We have sent OTP to your registered Mobile Number and Email ID, please enter now to proceed.",
                data: {
                  fileId: fileExist._id,
                  success: 0,
                  clinicVerified: fileExist?.clinicVerified === true ? 1 : 0,
                  isExisting: 1,
                  active: 0,
                  activeRequested: fileExist?.activeRequested === true ? 1 : 0,
                  phoneVerified: 0,
                  otp: otp,
                },
              });
              return;
            }
          });
          return;
        }

        if (fileExist.active === true) {
          res.json({
            serverError: 0,
            message: "This account is already active. Try logging in",
            data: {
              success: 0,
              isExisting: 1,
              active: 1,
              clinicVerified: 1,
              activeRequested: 1,
              phoneVerified: 1,
            },
          });
          return;
        }

        if (fileExist.activeRequested === true) {
          res.json({
            serverError: 0,
            message:
              "You have already requested for the activation of the account",
            data: {
              success: 0,
              isExisting: 1,
              activeRequested: 1,
              clinicVerified: 1,
              active: 0,
              phoneVerified: 1,
            },
          });
          return;
        }

        res.json({
          serverError: 0,
          message:
            fileExist?.clinicVerified === true
              ? "Your account is verified try logging in"
              : "We are still reviewing your details and will get back to you soon to activate account.",
          data: {
            fileId: fileExist._id,
            success: fileExist?.clinicVerified === true ? 1 : 0,
            clinicVerified: fileExist?.clinicVerified === true ? 1 : 0,
            isExisting: 1,
            active: fileExist?.active === true ? 1 : 0,
            activeRequested: fileExist?.activeRequested === true ? 1 : 0,
            phoneVerified: 1,
          },
        });
        return;

        // if (
        //   fileExist.clinicVerified === true &&
        //   fileExist?.phoneVerified === false
        // ) {
        //   let foundForgotPhone = await Filephoneverified.findOne({
        //     fileId: fileExist._id,
        //   });

        //   if (foundForgotPhone) {
        //     Filephoneverified.deleteOne(
        //       { fileId: fileExist._id },
        //       async (err) => {
        //         if (err) {
        //           throw new Error("Error deleting the OTP Session");
        //         } else {
        //           console.log("deleted previous");
        //         }
        //       }
        //     );
        //   }
        //   // sendPhoneOtp(fileExist.phoneNumber, otp);
        //   // sendEmailOtp(email, otp);

        //   const createdFilephoneverification = new Filephoneverified({
        //     otp: otp,
        //     fileId: fileExist._id,
        //   });

        //   createdFilephoneverification.save((err) => {
        //     if (err) {
        //       throw new Error("Error saving the OTP");
        //     } else {
        //       res.json({
        //         serverError: 0,
        //         message:
        //           " We have sent OTP to your registered Mobile Number and Email ID, please enter now to proceed.",
        //         data: {
        //           fileId: fileExist._id,
        //           success: 0,
        //           clinicVerified: 1,
        //           isExisting: 1,
        //           active: 0,
        //           activeRequested: 0,
        //           phoneVerified: 0,
        //           otp: otp,
        //         },
        //       });
        //       return;
        //     }
        //   });
        // }

        // res.json({
        //   serverError: 0,
        //   message:
        //     "We have sent OTP to your registered Mobile Number and Email ID, please enter now to proceed.",
        //   data: {
        //     fileId: fileExist._id,
        //     otp: otp,
        //     success: 1,
        //   },
        // });
        // return;
      }
    } else {
      let user = await User.findOne({ uniqueId2: emiratesId });
      if (!user) {
        let clinic = await Settings.find({}, "clinicName");
        console.log(clinic[0], "i am clinic");
        res.json({
          serverError: 0,
          message: `Welcome to ${clinic[0]?.clinicName} . We would like to have some details to activate your account.`,
          data: {
            success: 0,
            isExisting: 0,
            clinicVerified: 0,
            active: 0,
            activeRequested: 0,
            phoneVerified: 0,
          },
        });
        return;
      }
      let fileExist = await File.findOne({
        phoneNumber: user.phoneNumber,
      });
      console.log(fileExist, "fileexist");
      if (!fileExist) {
        // throw new Error("No account is registered with that Emirates Id");
        res.json({
          serverError: 0,
          message:
            "No account is registered with that File Number or your phone number is no longer associated to that family account",
          data: {
            success: 0,
            isExisting: 0,
            clinicVerified: 0,
            active: 0,
            activeRequested: 0,
            phoneVerified: 0,
          },
        });
        return;
      } else {
        if (fileExist?.phoneVerified === false) {
          let foundForgotPhone = await Filephoneverified.findOne({
            fileId: fileExist._id,
          });

          if (foundForgotPhone) {
            Filephoneverified.deleteOne(
              { fileId: fileExist._id },
              async (err) => {
                if (err) {
                  throw new Error("Error deleting the OTP Session");
                } else {
                  console.log("deleted previous");
                }
              }
            );
          }
          // sendPhoneOtp(fileExist.phoneNumber, otp);
          try {
            await sendEmailOtp(email, otp);
          } catch (err) {
            console.log(err.message);
          }

          const createdFilephoneverification = new Filephoneverified({
            otp: otp,
            fileId: fileExist._id,
            created: Date.now(),
            expires: Date.now() + 600000,
          });

          createdFilephoneverification.save((err) => {
            if (err) {
              throw new Error("Error saving the OTP");
            } else {
              res.json({
                serverError: 0,
                message:
                  "We have sent OTP to your registered Mobile Number and Email ID, please enter now to proceed.",
                data: {
                  fileId: fileExist._id,
                  success: 0,
                  clinicVerified: fileExist?.clinicVerified === true ? 1 : 0,
                  isExisting: 1,
                  active: 0,
                  activeRequested: fileExist?.activeRequested === true ? 1 : 0,
                  phoneVerified: 0,
                  otp: otp,
                },
              });
              return;
            }
          });
          return;
        }
        if (fileExist.active === true) {
          console.log("in active check");
          res.json({
            serverError: 0,
            message: "This account is already active. Try logging in",
            data: {
              success: 0,
              isExisting: 1,
              active: 1,
              clinicVerified: 1,
              activeRequested: 1,
              phoneVerified: 1,
            },
          });
          return;
        }

        if (fileExist.activeRequested === true) {
          console.log("in active requested");
          res.json({
            serverError: 0,
            message:
              "You have already requested for the activation of the account",
            data: {
              success: 0,
              isExisting: 1,
              activeRequested: 1,
              clinicVerified: 1,
              active: 0,
              phoneVerified: 1,
            },
          });
          return;
        }

        res.json({
          serverError: 0,
          message:
            fileExist?.clinicVerified === true
              ? "Your account is verified try logging in"
              : "We are still reviewing your details and will get back to you soon to activate account.",
          data: {
            fileId: fileExist._id,
            success: fileExist?.clinicVerified === true ? 1 : 0,
            clinicVerified: fileExist?.clinicVerified === true ? 1 : 0,
            isExisting: 1,
            active: fileExist?.active === true ? 1 : 0,
            activeRequested: fileExist?.activeRequested === true ? 1 : 0,
            phoneVerified: 1,
          },
        });
        return;

        // if (
        //   fileExist.clinicVerified === true &&
        //   fileExist?.phoneVerified === false
        // ) {
        //   let foundForgotPhone = await Filephoneverified.findOne({
        //     fileId: fileExist._id,
        //   });

        //   if (foundForgotPhone) {
        //     Filephoneverified.deleteOne(
        //       { fileId: fileExist._id },
        //       async (err) => {
        //         if (err) {
        //           throw new Error("Error deleting the OTP Session");
        //         } else {
        //           console.log("deleted previous");
        //         }
        //       }
        //     );
        //   }
        //   // sendPhoneOtp(fileExist.phoneNumber, otp);
        //   // sendEmailOtp(email, otp);

        //   const createdFilephoneverification = new Filephoneverified({
        //     otp: otp,
        //     fileId: fileExist._id,
        //   });

        //   createdFilephoneverification.save((err) => {
        //     if (err) {
        //       throw new Error("Error saving the OTP");
        //     } else {
        //       res.json({
        //         serverError: 0,
        //         message:
        //           " We have sent OTP to your registered Mobile Number and Email ID, please enter now to proceed.",
        //         data: {
        //           fileId: fileExist._id,
        //           success: 0,
        //           clinicVerified: 1,
        //           isExisting: 1,
        //           active: 0,
        //           activeRequested: 0,
        //           phoneVerified: 0,
        //           otp: otp,
        //         },
        //       });
        //       return;
        //     }
        //   });
        // }

        // res.json({
        //   serverError: 0,
        //   message:
        //     "We have sent OTP to your registered Mobile Number and Email ID, please enter now to proceed.",
        //   data: {
        //     fileId: fileExist._id,
        //     otp: otp,
        //     success: 1,
        //   },
        // });
        // return;
      }
    }
  } catch (err) {
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
        isExisting: 0,
        clinicVerified: 0,
        active: 0,
        activeRequested: 0,
        phoneVerified: 0,
      },
    });
    return;
  }
};

const createUserAndAdminChat = async (
  senderId,
  receiverId,
  message,
  scanId,
  format
) => {
  let conversations = await Conversation.find({
    members: { $in: [senderId] },
  });

  let foundConversation = false;
  let foundConversationId;
  let i = 0;
  while (i < conversations?.length && foundConversation === false) {
    foundConversation = conversations[i].members.some(
      (member) => member === receiverId
    );
    if (foundConversation === true) {
      foundConversationId = conversations[i]._id;
    }
    i++;
  }

  if (foundConversation === true) {
    console.log("conversation already exist");
    return;
  }
  let membersData = await User.find({ _id: { $in: [senderId, receiverId] } }, [
    "firstName",
    "lastName",
    "image",
  ]);

  membersData = membersData.map((member) => {
    return {
      name: `${member.firstName} ${member.lastName}`,
      id: member._id,
      image: member.image,
    };
  });
  console.log(membersData);

  let createdConversation = new Conversation({
    members: [senderId, receiverId],
    membersData: membersData,
  });
  try {
    createdConversation.save((err, doc) => {
      if (err) {
        throw new Error("Error Creating the Chat");
      } else {
        console.log(doc, "doc there");

        let createdMessage = new Message({
          conversationId: doc._id,
          senderId: senderId,
          message: message,
          format: format,
          scanId: "",
        });

        createdMessage.save((err) => {
          if (err) {
            throw new Error("Error Creating the message");
          } else {
            // res.json({
            //   serverError: 0,
            //   message: "Message Sent",
            //   data: {
            //     success: 1,
            //   },
            // });
            console.log("msg sent");
            return;
          }
        });
      }
    });
  } catch (err) {
    // res.json({
    //   serverError: 1,
    //   message: err.message,
    //   data: {
    //     success: 0,
    //   },
    // });
    console.log(err.message);
    return;
  }
};

const signup = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    countryCode,
    emiratesId,
    role,
    isExisting,
    fileNumber,
    password,
    city,
    gender,
    isSignupWithFileNumber,
    fileId,
    dob,
  } = req.body;
  console.log(req.body);

  if (isExisting === "0") {
    try {
      let existingUser;
      // existingUser = await User.findOne({ uniqueId1: emiratesId });

      // if (existingUser) {
      //   // throw new Error("User Already Exist");
      //   res.json({
      //     serverError: 0,
      //     message: "User Already Exist",
      //     data: {
      //       success: 0,
      //     },
      //   });
      //   return;
      // }

      existingUser = await User.findOne({ uniqueId2: emiratesId });

      if (existingUser) {
        // throw new Error("User Already Exist");
        res.json({
          serverError: 0,
          message: "This Emirates id already exist",
          data: {
            phoneVerified: 0,
            isExisting: 1,
            success: 0,
          },
        });
        return;
      }

      let userPhoneExist = await File.findOne({ phoneNumber: phoneNumber });
      if (userPhoneExist) {
        // throw new Error("User Phone Already Exist");
        res.json({
          serverError: 0,
          message: "This phone is already registered to a family account. ",
          data: {
            phoneVerified: userPhoneExist?.phoneVerified === true ? 1 : 0,
            isExisting: 1,
            success: 0,
          },
        });
        return;
      }

      userPhoneExist = await File.findOne({ uniqueId: emiratesId });
      if (userPhoneExist) {
        // throw new Error("Emirates Id Already Exist");
        res.json({
          serverError: 0,
          message:
            "This Emirates Id Already already associated with a family account",
          data: {
            success: 0,
            phoneVerified: userPhoneExist?.phoneVerified === true ? 1 : 0,
            isExisting: 1,
          },
        });
        return;
      }

      let hashedemiratesId;
      let hashedpassword;

      try {
        hashedpassword = await bcrypt.hash(password, 12);
        hashedemiratesId = CryptoJS.AES.encrypt(emiratesId, "love").toString();
        console.log(hashedemiratesId, "i am emirates");
      } catch (err) {
        console.log("Something went wrong while Encrypting Data", err);

        throw new Error("Something went wrong while Encrypting Data");
      }

      let otp = otpGenerator.generate(4, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      console.log(otp, "i am otp");
      if (!otp) {
        throw new Error("Error Genrating OTP");
      }

      const createdUser = new User({
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
        fileNumber: "",
        uniqueId1: "",
        uniqueId2: emiratesId,
        image:
          "https://www.clipartmax.com/png/middle/344-3442642_clip-art-freeuse-library-profile-man-user-people-icon-icono-de-login.png",
      });

      const createdFile = new File({
        phoneNumber: phoneNumber,
        password: hashedpassword,
        clinicVerified: false,
        phoneVerified: false,
        activeRequested: false,
        active: false,
        countryCode: countryCode,
        city,
        emiratesId: hashedemiratesId,
        uniqueId: emiratesId,
      });

      createdUser.save((err, userDoc) => {
        if (err) {
          console.log(err);
          throw new Error("Error creating the User");
        } else {
          // console.log({ message: "user created", createdUser });
          createdFile.save(async (err) => {
            if (err) {
              console.log(err);
              throw new Error("Error creating the User");
            } else {
              let latestFile = await File.findOne(
                { phoneNumber: phoneNumber },
                "_id"
              );
              console.log(latestFile);

              let foundForgotPhone = await Filephoneverified.findOne({
                fileId: latestFile._id,
              });

              if (foundForgotPhone) {
                Filephoneverified.deleteOne(
                  { fileId: latestFile._id },
                  async (err) => {
                    if (err) {
                      throw new Error("Error deleting the OTP Session");
                    } else {
                      console.log("deleted previous");
                    }
                  }
                );
              }

              // sendPhoneOtp(phoneNumber, otp);
              // sendEmailOtp(email, otp);
              try {
                await sendEmailOtp(email, otp);
              } catch (err) {
                console.log(err.message);
              }

              const createdFilephoneverification = new Filephoneverified({
                otp: otp,
                fileId: latestFile._id,
                created: Date.now(),
                expires: Date.now() + 600000,
              });

              createdFilephoneverification.save((err) => {
                if (err) {
                  throw new Error("Error saving the OTP");
                } else {
                  File.updateOne(
                    { _id: latestFile._id },
                    {
                      $push: {
                        familyMembers: {
                          memberEmiratesId: hashedemiratesId,
                          uniqueId: emiratesId,
                          connected: true,
                          userId: userDoc._id.toString(),
                        },
                      },
                      $set: {
                        activeRequested: true,
                      },
                    },
                    async (err) => {
                      if (err) {
                        throw new Error("Error creating the User");
                      } else {
                        let adminFound = User.findOne({ role: "3" }, "_id");
                        let clinic = Settings.find({}, "clinicName");
                        let [adminFoundResolved, clinicResolved] =
                          await Promise.all([adminFound, clinic]);
                        createUserAndAdminChat(
                          adminFoundResolved?._id?.toString(),
                          userDoc._id?.toString(),
                          `Welcome to ${clinicResolved[0]?.clinicName}. Ask us anything`,
                          "",
                          "text"
                        );
                        res.json({
                          serverError: 0,
                          message:
                            "We have sent OTP to your registered Mobile Number and Email ID, please enter now to proceed.",
                          data: {
                            fileId: latestFile._id,
                            otp: otp,
                            phoneVerified: 0,
                            isExisting: 1,
                            success: 1,
                          },
                        });
                        return;
                      }
                    }
                  );
                }
              });
            }
          });
        }
      });
      // } catch (err) {
    } catch (err) {
      console.log(err, "i am error");

      res.json({
        serverError: 1,
        message: err.message,
        data: {
          success: 0,
          phoneVerified: 0,
          isExisting: 0,
        },
      });
    }
  } else {
    try {
      let fileExist;
      let hashedpassword = await bcrypt.hash(password, 12);

      fileExist = await File.findOne({ _id: fileId });
      if (!fileExist) {
        res.json({
          serverError: 0,

          message: "No account is registered with that File id",
          data: {
            success: 0,
            phoneVerified: 0,
            isExisting: 0,
          },
        });
        return;
      } else {
        if (fileExist.active === true) {
          res.json({
            serverError: 0,

            message: "This account is already active. Try logging in",
            data: {
              success: 0,
              phoneVerified: fileExist.phoneVerified === true ? 1 : 0,
              isExisting: 1,
            },
          });
          return;
        }
        File.updateOne(
          {
            _id: fileId,
          },
          {
            $set: {
              activeRequested: true,
              password: hashedpassword,
              image:
                "https://www.clipartmax.com/png/middle/344-3442642_clip-art-freeuse-library-profile-man-user-people-icon-icono-de-login.png",
            },
          },
          (err) => {
            if (err) {
              throw new Error("Somthing went wrong while making request");
            } else {
              res.json({
                serverError: 0,
                message:
                  "Thanks for verifying your Mobile Number. Our Team will be in touch soon to activate your account.",
                data: {
                  success: 1,
                  phoneVerified: fileExist.phoneVerified === true ? 1 : 0,
                  isExisting: 1,
                },
              });
              return;
            }
          }
        );
      }
    } catch (err) {
      console.log(err, "i am error");

      res.json({
        serverError: 1,

        message: err.message,
        data: {
          success: 0,
          phoneVerified: 0,
          isExisting: 0,
        },
      });
      return;
    }
  }
};

const sendPhoneOtp = async (phone, otp) => {
  console.log(phone, otp);
  const from = "Appolonia";
  const to = phone;
  const text = `Your Verification OTP is ${otp}`;

  let res = await client.messages
    .create({
      to: `+${phone}`,
      body: `Your Verification OTP is ${otp}`,
      from: "+18586306724",
    })
    .then((message) => console.log(message))
    .done();

  console.log(res);

  return res;
};

const sendEmailOtp = (email, otp) => {
  console.log(email, otp, "hello gggggg");
  if (otp && email) {
    console.log("Things going good");
    const output = `
            <p>You Verification code</p>
            <h3>OTP</h3>
            <p>${otp}</p>
            `;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.google.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      service: "gmail",
      auth: {
        user: "appoloniaapp@gmail.com", // generated ethereal user
        pass: SMTPPASS, // generated ethereal password
      },
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Appolonia" <appoloniaapp@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Verification Code", // Subject line
      // text: details, // plain text body
      html: output, // html body
    };

    // send mail with defined transport object
    // transporter.sendMail(mailOptions, async (error, info) => {
    //   if (error) {
    //     console.log(error, "I am error");
    //     return error;
    //   } else {
    //     console.log("Message sent: %s", info.messageId);
    //     console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    //   }
    // });
    // return true;
    return transporter.sendMail(mailOptions);
  }
  // else {
  //   // res.status(401).json({ message: "Something went Wrong" });
  //   // console.log("There is problem");
  //   // return false;
  //   res.json({
  //     serverError : 0,
  //     message : "Somthing is missing otp or email",
  //     data : {
  //       success : 0,
  //     }
  //   })
  // }
};

const emailVerify = async (req, res) => {
  console.log(req.body);
  const { otp, phoneNumber, fileId } = req.body;
  let user;

  try {
    user = await Filephoneverified.findOne({ fileId: fileId });
    console.log(user);
    if (user) {
      if (user.expires > Date.now()) {
        if (user.otp === otp) {
          File.updateOne(
            { _id: fileId },
            { $set: { phoneVerified: true } },
            function (err) {
              if (err) {
                throw new Error(
                  "Somthing went wrong while verifiying Phone Number"
                );
              } else {
                Filephoneverified.deleteOne({ fileId: fileId }, async (err) => {
                  if (err) {
                    throw new Error("Error deleting the OTP Session");
                  } else {
                    let foundFile = await File.findOne({ _id: fileId }, [
                      "uniqueId",
                      "city",
                      "familyMembers",
                      "emiratesId",
                      "phoneNumber",
                    ]);

                    res.json({
                      serverError: 0,
                      message:
                        "Thanks for verifying your Mobile Number. Our Team will be in touch soon to activate your account.",
                      data: {
                        fileId: foundFile._id,
                        success: 1,
                      },
                    });
                    return;
                  }
                });
              }
            }
          );
        } else {
          // throw new Error("Otp is wrong");
          res.json({
            serverError: 0,
            message:
              "You have entered an Incorrect OTP Code, please try again.",
            data: {
              success: 0,
            },
          });
          return;
        }
      } else {
        res.json({
          serverError: 0,
          message: "OTP got expired. Kindly request the new one",
          data: {
            success: 0,
          },
        });
        return;
      }
    } else {
      throw new Error("File Id is not correct");
    }
  } catch (err) {
    console.log(err.message);
    // return res.json({ success: false, message: err.message });
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

const fileVerify = async (req, res) => {
  console.log(req.body);
  const { fileNumber, fileId } = req.body;
  let user;

  hashedfileNumber = CryptoJS.AES.encrypt(fileNumber, "love").toString();

  try {
    let isFileExist = await File.findOne({ uniqueId: fileNumber });
    if (isFileExist) {
      throw new Error("File Number already Exist");
    }

    if (!fileNumber) {
      throw new Error("File Number is compulsary");
    }
    user = await File.findOne({ _id: fileId });
    console.log(user);
    if (user) {
      File.updateOne(
        { fileId: fileId },
        {
          $set: {
            clinicVerified: true,
            fileNumber: hashedfileNumber,
            uniqueId: fileNumber,
          },
        },
        function (err) {
          if (err) {
            throw new Error("Error verifying");
          } else {
            res.json({
              success: true,
              message: "Verification completed successfully",
            });
          }
        }
      );
    } else {
      throw new Error("File Dose not exist");
    }
  } catch (err) {
    console.log(err.message);
    return res.json({ success: false, message: err.message });
  }
};

const login = async (req, res, next) => {
  console.log(req.body);
  const { phoneNumber, password, emiratesId, isPhoneNumber } = req.body;
  let existingUser;

  // console.log(email, password);

  if (isPhoneNumber === "0") {
    try {
      existingUser = await File.findOne({ uniqueId: emiratesId });
      console.log(existingUser, "i am existing user");

      if (!existingUser) {
        // throw new Error("Account does not exist");
        res.json({
          serverError: 0,
          message: "We couldn't find record with this Emirates id",
          data: {
            success: 0,
            phoneVerified: 0,
            clinicVerified: 0,
            active: 0,
            activeRequested: 0,
            isExisting: 0,
          },
        });
        return;
      } else {
        if (existingUser.phoneVerified === false) {
          let otp = otpGenerator.generate(4, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
          });
          console.log(otp, "i am otp");
          let foundForgotPhone = await Filephoneverified.findOne({
            fileId: existingUser?._id,
          });
          if (foundForgotPhone) {
            Filephoneverified.deleteOne(
              { fileId: existingUser?._id },
              async (err) => {
                if (err) {
                  throw new Error("Error deleting the OTP Session");
                } else {
                  console.log("deleted previous");
                }
              }
            );
          }
          // console.log(phoneExist);
          let createdForgotOtp = new Filephoneverified({
            otp: otp,
            fileId: existingUser?._id,
            created: Date.now(),
            expires: Date.now() + 600000,
          });

          createdForgotOtp.save((err) => {
            if (err) {
              console.log(err),
                res.json({
                  serverError: 1,
                  message: "Somthing went wrong",
                  data: {
                    success: 0,
                    phoneVerified: 0,
                    clinicVerified: 0,
                    active: 0,
                    activeRequested: 0,
                    isExisting: 1,
                  },
                });
              return;
            } else {
              // sendPhoneOtp(phoneExist?.phoneNumber, otp);
              res.json({
                serverError: 0,
                message:
                  "Please verify your Mobile Number to activate your account.",
                data: {
                  fileId: existingUser?._id,
                  otp: otp,
                  success: 0,
                  phoneVerified: 0,
                  clinicVerified: existingUser?.clinicVerified === true ? 1 : 0,
                  active: existingUser?.active === true ? 1 : 0,
                  activeRequested:
                    existingUser?.activeRequested === true ? 1 : 0,
                  isExisting: 1,
                },
              });
              return;
            }
          });

          return;
        }
        if (existingUser.clinicVerified === false) {
          res.json({
            serverError: 0,
            message:
              "We are still reviewing your details and will get back to you soon to activate account.",
            data: {
              success: 0,
              phoneVerified: existingUser?.phoneVerified === true ? 1 : 0,
              clinicVerified: 0,
              active: existingUser?.active === true ? 1 : 0,
              activeRequested: existingUser?.activeRequested === true ? 1 : 0,
              isExisting: 1,
            },
          });
          return;
        }

        // if (existingUser.activeRequested === true) {
        //   res.json({
        //     serverError: 0,
        //     message:
        //       "We are still reviewing your details and will get back to you soon to activate account.",
        //     data: {
        //       success: 0,
        //       phoneVerified: existingUser?.phoneVerified === true ? 1 : 0,
        //       clinicVerified: existingUser?.clinicVerified === true ? 1 : 0,
        //       active: existingUser?.active === true ? 1 : 0,
        //       activeRequested: 1,
        //     },
        //   });
        //   return;
        // }

        if (existingUser.active === false) {
          console.log("i am thereeeeeeeeee");
          res.json({
            serverError: 0,
            message:
              "We are still reviewing your details and will get back to you soon to activate account.",
            data: {
              success: 0,
              phoneVerified: existingUser?.phoneVerified === true ? 1 : 0,
              clinicVerified: existingUser?.clinicVerified === true ? 1 : 0,
              active: 0,
              activeRequested: existingUser?.activeRequested === true ? 1 : 0,
              isExisting: 1,
            },
          });
          return;
        }

        let isValidPassword = false;
        try {
          isValidPassword = await bcrypt.compare(
            password,
            existingUser.password
          );
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong");
        }

        if (!isValidPassword) {
          // throw new Error("Wrong Password");
          res.json({
            serverError: 0,

            message: "Wrong Password",
            data: {
              success: 0,
              phoneVerified: existingUser?.phoneVerified === true ? 1 : 0,
              clinicVerified: existingUser?.clinicVerified === true ? 1 : 0,
              active: existingUser?.active === true ? 1 : 0,
              activeRequested: existingUser?.activeRequested === true ? 1 : 0,
              isExisting: 1,
            },
          });
          return;
        }

        let access_token;
        try {
          access_token = jwt.sign({ userId: existingUser._id }, JWTKEY, {
            expiresIn: "1h",
          });
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong while creating token");
        }

        // let familyIds = existingUser.familyMembers.filter((member) => {
        //   // if (member.connected === true) {
        //   //   console.log(member);
        //   return member.connected === true && member;
        //   // }
        // });

        // familyIds = familyIds.map((member) => member.userId);
        // console.log(familyIds, "We are family ids");

        // let familyMembers = await User.find({ _id: { $in: familyIds } });
        // console.log(familyMembers, "we are members");

        // let decryptedFileNumber;
        // decryptedFileNumber = CryptoJS.AES.decrypt(
        //   existingUser.fileNumber,
        //   "love"
        // );
        // decryptedFileNumber = decryptedFileNumber.toString(CryptoJS.enc.Utf8);
        // console.log(decryptedFileNumber, "decrupted");

        // res.json({
        //   message: "you are login success fully ",
        //   id: existingUser._id,
        //   role: existingUser.role,
        //   access_token: access_token,
        //   success: true,
        //   fileNumber: existingUser.fileNumber,
        //   familyMembers,
        // });

        let familyHead = existingUser?.familyMembers?.find(
          (member) => member.uniqueId === existingUser.uniqueId
        );
        console.log("i am head", familyHead);

        familyHead = await User.findOne({ _id: familyHead?.userId });
        let userScans = Scans.find({ userId: familyHead._id }).limit(5);
        let adminFound = User.findOne({ role: "3" }, [
          "firstName",
          "lastName",
          "role",
        ]);
        let [adminFoundResolved, userScansResolved] = await Promise.all([
          adminFound,
          userScans,
        ]);
        console.log(userScansResolved.length, "i am scans");
        familyHead = {
          _id: familyHead?._id,
          firstName: familyHead?.firstName,
          lastName: familyHead?.lastName,
          emiratesId: familyHead?.uniqueId2,
          fileNumber: familyHead?.uniqueId1,
          phoneNumber: familyHead?.phoneNumber,
          countryCode: familyHead?.countryCode,
          email: familyHead?.email,
          gender: familyHead?.gender,
          city: familyHead?.city,
          assignedDoctorId: familyHead?.assignedDoctorId
            ? familyHead?.assignedDoctorId
            : adminFoundResolved?._id,
          assignedDoctorName: familyHead?.assignedDoctorName
            ? familyHead?.assignedDoctorName
            : `${adminFoundResolved?.firstName} ${adminFoundResolved.lastName}`,
          role: familyHead?.role,
          image: familyHead?.image
            ? familyHead?.image
            : "https://www.clipartmax.com/png/middle/344-3442642_clip-art-freeuse-library-profile-man-user-people-icon-icono-de-login.png",
          scans: userScansResolved,
        };

        console.log(familyHead, "i am head");
        res.json({
          serverError: 0,
          message: "you are login success fully",
          data: {
            familyHead: familyHead,
            fileId: existingUser._id,
            role: existingUser.role,
            access_token: access_token,
            // familyMembers,
            success: 1,
            phoneVerified: existingUser?.phoneVerified === true ? 1 : 0,
            clinicVerified: existingUser?.clinicVerified === true ? 1 : 0,
            active: existingUser?.active === true ? 1 : 0,
            activeRequested: existingUser?.activeRequested === true ? 1 : 0,
            isExisting: 1,
          },
        });
        return;
      }
    } catch (err) {
      console.log(err.message);
      // res.json({ success: false, message: err.message });
      res.json({
        serverError: 1,
        message: err.message,
        data: {
          success: 0,
          phoneVerified: 0,
          clinicVerified: 0,
          active: 0,
          activeRequested: 0,
          isExisting: 0,
        },
      });
      return;
    }
  } else {
    try {
      existingUser = await File.findOne({ phoneNumber: phoneNumber });
      console.log(existingUser, "i am existing");

      if (!existingUser) {
        // throw new Error("Account does not exist");
        res.json({
          serverError: 0,
          message: "We couldn't find record with this phone number",
          data: {
            success: 0,
            phoneVerified: 0,
            clinicVerified: 0,
            active: 0,
            activeRequested: 0,
            isExisting: 0,
          },
        });
        return;
      } else {
        if (existingUser.phoneVerified === false) {
          let otp = otpGenerator.generate(4, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
          });
          console.log(otp, "i am otp");
          let foundForgotPhone = await Filephoneverified.findOne({
            fileId: existingUser?._id,
          });
          if (foundForgotPhone) {
            Filephoneverified.deleteOne(
              { fileId: existingUser?._id },
              async (err) => {
                if (err) {
                  throw new Error("Error deleting the OTP Session");
                } else {
                  console.log("deleted previous");
                }
              }
            );
          }
          // console.log(phoneExist);
          let createdForgotOtp = new Filephoneverified({
            otp: otp,
            fileId: existingUser?._id,
            created: Date.now(),
            expires: Date.now() + 600000,
          });

          createdForgotOtp.save((err) => {
            if (err) {
              console.log(err),
                res.json({
                  serverError: 1,
                  message: "Somthing went wrong",
                  data: {
                    success: 0,
                    phoneVerified: 0,
                    clinicVerified: 0,
                    active: 0,
                    activeRequested: 0,
                    isExisting: 1,
                  },
                });
              return;
            } else {
              // sendPhoneOtp(phoneExist?.phoneNumber, otp);
              res.json({
                serverError: 0,
                message:
                  "Please verify your Mobile Number to activate your account.",
                data: {
                  fileId: existingUser?._id,
                  otp: otp,
                  success: 0,
                  phoneVerified: 0,
                  clinicVerified: existingUser?.clinicVerified === true ? 1 : 0,
                  active: existingUser?.active === true ? 1 : 0,
                  activeRequested:
                    existingUser?.activeRequested === true ? 1 : 0,
                  isExisting: 1,
                },
              });
              return;
            }
          });

          return;
        }
        if (existingUser.clinicVerified === false) {
          res.json({
            serverError: 0,
            message:
              "We are still reviewing your details and will get back to you soon to activate account.",
            data: {
              success: 0,
              phoneVerified: existingUser?.phoneVerified === true ? 1 : 0,
              clinicVerified: 0,
              active: existingUser?.active === true ? 1 : 0,
              activeRequested: existingUser?.activeRequested === true ? 1 : 0,
              isExisting: 1,
            },
          });
          return;
        }

        // if (existingUser.activeRequested === false) {
        //   res.json({
        //     serverError: 0,
        //     message:
        //       "We are still reviewing your details and will get back to you soon to activate account.",
        //     data: {
        //       success: 0,
        //       phoneVerified: existingUser?.phoneVerified === true ? 1 : 0,
        //       clinicVerified: existingUser?.clinicVerified === true ? 1 : 0,
        //       active: existingUser?.active === true ? 1 : 0,
        //       activeRequested:0,
        //     },
        //   });
        //   return;
        // }

        if (existingUser.active === false) {
          console.log("i am thereeeeeeeeee");
          res.json({
            serverError: 0,
            message:
              "We are still reviewing your details and will get back to you soon to activate account.",
            data: {
              success: 0,
              phoneVerified: existingUser?.phoneVerified === true ? 1 : 0,
              clinicVerified: existingUser?.clinicVerified === true ? 1 : 0,
              active: 0,
              activeRequested: existingUser?.activeRequested === true ? 1 : 0,
              isExisting: 1,
            },
          });
          return;
        }

        let isValidPassword = false;
        try {
          isValidPassword = await bcrypt.compare(
            password,
            existingUser.password
          );
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong");
        }

        if (!isValidPassword) {
          // throw new Error("Wrong Password");
          res.json({
            serverError: 0,
            message: "Wrong Password",
            data: {
              success: 0,
              phoneVerified: existingUser?.phoneVerified === true ? 1 : 0,
              clinicVerified: existingUser?.clinicVerified === true ? 1 : 0,
              active: existingUser?.active === true ? 1 : 0,
              activeRequested: existingUser?.activeRequested === true ? 1 : 0,
              isExisting: 1,
            },
          });
          return;
        }

        let access_token;
        try {
          access_token = jwt.sign({ userId: existingUser._id }, JWTKEY, {
            expiresIn: "1h",
          });
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong while creating token");
        }

        // let familyIds = existingUser.familyMembers.filter((member) => {
        //   return member.connected === true && member;
        // });

        // familyIds = familyIds.map((member) => member.userId);
        // console.log(familyIds, "We are family ids");

        // let familyMembers = await User.find({ _id: { $in: familyIds } });
        // console.log(familyMembers, "we are members");

        // let decryptedFileNumber;
        // decryptedFileNumber = CryptoJS.AES.decrypt(
        //   existingUser.fileNumber,
        //   "love"
        // );
        // decryptedFileNumber = decryptedFileNumber.toString(CryptoJS.enc.Utf8);

        // res.json({
        //   message: "you are login success fully ",
        //   id: existingUser._id,
        //   role: existingUser.role,
        //   access_token: access_token,
        //   success: true,
        //   fileNumber: existingUser.fileNumber,
        //   familyMembers,
        // });
        let familyHead = existingUser?.familyMembers?.find(
          (member) => member.uniqueId === existingUser.uniqueId
        );
        familyHead = await User.findOne({ _id: familyHead?.userId });
        console.log("i am familyHead", familyHead);
        let userScans = Scans.find({ userId: familyHead?._id }).limit(5);
        let adminFound = User.findOne({ role: "3" }, [
          "firstName",
          "lastName",
          "role",
        ]);
        let [adminFoundResolved, userScansResolved] = await Promise.all([
          adminFound,
          userScans,
        ]);
        console.log(userScansResolved.length, "i am scans");
        familyHead = {
          _id: familyHead?._id,
          firstName: familyHead?.firstName,
          lastName: familyHead?.lastName,
          emiratesId: familyHead?.uniqueId2,
          fileNumber: familyHead?.uniqueId1,
          phoneNumber: familyHead?.phoneNumber,
          countryCode: familyHead?.countryCode,
          email: familyHead?.email,
          gender: familyHead?.gender,
          city: familyHead?.city,
          assignedDoctorId: familyHead?.assignedDoctorId
            ? familyHead?.assignedDoctorId
            : adminFoundResolved?._id,
          assignedDoctorName: familyHead?.assignedDoctorName
            ? familyHead?.assignedDoctorName
            : `${adminFoundResolved?.firstName} ${adminFoundResolved.lastName}`,
          role: familyHead?.role,
          image: familyHead?.image
            ? familyHead?.image
            : "https://www.clipartmax.com/png/middle/344-3442642_clip-art-freeuse-library-profile-man-user-people-icon-icono-de-login.png",
          scans: userScansResolved,
        };
        console.log(familyHead, "i am head");
        res.json({
          serverError: 0,
          message: "you are login success fully",
          data: {
            familyHead: familyHead,
            fileId: existingUser._id,
            role: existingUser.role,
            access_token: access_token,
            // familyMembers,
            success: 1,
            phoneVerified: existingUser?.phoneVerified === true ? 1 : 0,
            clinicVerified: existingUser?.clinicVerified === true ? 1 : 0,
            active: existingUser?.active === true ? 1 : 0,
            activeRequested: existingUser?.activeRequested === true ? 1 : 0,
            // isExisting: 1,
            isExisting: 1,
          },
        });
        return;
      }
    } catch (err) {
      console.log(err.message);
      // res.json({ success: false, message: err.message });
      res.json({
        serverError: 1,
        message: err.message,
        data: {
          success: 0,
          phoneVerified: 0,
          clinicVerified: 0,
          active: 0,
          activeRequested: 0,
          isExisting: 0,
        },
      });
      return;
    }
  }
};

const sendOtpIfPhoneNotVerified = async (fileId) => {
  try {
    let phoneExist = await File.findOne({ _id: fileId }, "phoneNumber");
    if (!phoneExist) {
      return {
        serverError: 0,
        message: "Phonenumber is not registered with us",
        data: {
          success: 0,
        },
      };
      // res.json({
      //   serverError: 0,
      //   message: "Phonenumber is not registered with us",
      //   data: {
      //     success: 0,
      //   },
      // });
      // return;
    }
    let otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log(otp, "i am otp");
    let foundForgotPhone = await Filephoneverified.findOne({
      fileId: fileId,
    });
    if (foundForgotPhone) {
      Filephoneverified.deleteOne({ fileId: fileId }, async (err) => {
        if (err) {
          throw new Error("Error deleting the OTP Session");
        } else {
          console.log("deleted previous");
        }
      });
    }
    console.log(phoneExist);
    let createdForgotOtp = new Filephoneverified({
      otp: otp,
      fileId: fileId,
      created: Date.now(),
      expires: Date.now() + 600000,
    });

    createdForgotOtp.save((err) => {
      if (err) {
        return {
          serverError: 1,
          message: "Somthing went wrong",
          data: {
            success: 0,
          },
        };
        // console.log(err),
        //   res.json({
        //     serverError: 1,
        //     message: "Somthing went wrong",
        //     data: {
        //       success: 0,
        //     },
        //   });
        // return;
      } else {
        // sendPhoneOtp(phoneExist?.phoneNumber, otp);
        return {
          serverError: 0,
          message: "You have not verified your phone number",
          data: {
            success: 0,
            phoneVerified: 0,
            fileId: fileId,
            otp: otp,
          },
        };
        // res.json({
        //   serverError: 0,
        //   message: "You have not verified your phone number",
        //   data: {
        //     success: 0,
        //     phoneVerified: 0,
        //     fileId: fileId,
        //     otp: otp,
        //   },
        // });
        // return;
      }
    });
  } catch (err) {
    return {
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    };
  }
};

const newPassword = async (req, res) => {
  console.log(req.body);

  const { newPassword, fileId, recentOtp } = req.body;
  console.log(newPassword, fileId, recentOtp, "details");

  if (newPassword && fileId && recentOtp) {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(newPassword, 12);
    } catch (err) {
      console.log("Error hashing password", err);

      // res.json({
      //   success: false,
      //   data: err,
      //   message: "Something went wrong",
      // });
      // return;
      res.json({
        serverError: 1,

        message: "Error hashing password",
        data: {
          success: 0,
        },
      });
      return;
    }

    // console.log(hashedPassword);

    try {
      let user = await Forgotphoneverified.findOne(
        { fileId: fileId },
        "-password"
      );
      console.log(user);
      if (user) {
        if (user.otp === recentOtp) {
          File.updateOne(
            { _id: fileId },
            { $set: { password: hashedPassword } },
            function (err) {
              if (!err) {
                console.log("Updated");
                Forgotphoneverified.deleteOne(
                  { fileId: fileId },
                  async (err) => {
                    if (err) {
                      // throw new Error("Error deleting the OTP Session");
                      res.json({
                        serverError: 1,

                        message: "Error deleting the OTP Session",
                        data: {
                          success: 0,
                        },
                      });
                      return;
                    } else {
                      console.log("deleted previous");
                      // return res.json({
                      //   success: true,
                      //   message: "Password Updated",
                      // });
                      res.json({
                        serverError: 0,

                        message: "Password Updated",
                        data: {
                          success: 1,
                        },
                      });
                      return;
                    }
                  }
                );
              } else {
                // console.log(err);
                // res.json({
                //   success: false,
                //   data: err,
                //   message: "Something went wrong",
                // });
                // return;
                res.json({
                  serverError: 1,

                  message: "Something went wrong",
                  data: {
                    success: 0,
                  },
                });
                return;
              }
            }
          );
        } else {
          // res.json({ success: false, message: "Otp Wrong" });
          // return;
          res.json({
            serverError: 0,

            message: "Otp Wrong",
            data: {
              success: 0,
            },
          });
          return;
        }
      } else {
        // return res.json({ success: false, message: "Somthing went wrong" });
        res.json({
          serverError: 0,

          message: "User not found",
          data: {
            success: 0,
          },
        });
        return;
      }
    } catch (err) {
      // return res.json({ success: false, message: "Somthing went wrong" });
      res.json({
        serverError: 1,

        message: "Somthing went wrong",
        data: {
          success: 0,
        },
      });
      return;
    }
  } else {
    // res.json({
    //   success: false,
    //   message: "Some Details are missing",
    // });
    res.json({
      serverError: 0,

      message: "Some Details are missing",
      data: {
        success: 0,
      },
    });
    return;
  }
};

const changePassword = async (req, res) => {
  console.log(req.body);

  const { passwordUpdate, fileId } = req.body;
  const { oldPassword, newPassword } = passwordUpdate;

  let existingUser;

  try {
    existingUser = await File.findOne({ _id: fileId });
    console.log(existingUser);
    if (!existingUser) {
      throw new Error("Account not found");
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(
        oldPassword,
        existingUser.password
      );
      console.log(isValidPassword);
    } catch (err) {
      throw new Error("Something went wrong");
    }

    if (isValidPassword) {
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(newPassword, 12);
      } catch (err) {
        console.log("Error hashing password", err);

        throw new Error("Error hashing password");
      }

      File.updateOne(
        { _id: fileId },
        { $set: { password: hashedPassword } },
        function (err) {
          if (!err) {
            // return res.json({ success: true, message: "Password Updated" });
            res.json({
              serverError: 0,
              message: "Password Updated",
              data: {
                success: 1,
              },
            });
            return;
          }
        }
      );
    } else {
      throw new Error("Wrong old Password");
    }
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

const requestNewOtp = async (req, res) => {
  console.log(req.body);
  const { fileId } = req.body;
  let phoneExist = await File.findOne({ _id: fileId }, [
    "phoneNumber",
    "uniqueId",
  ]);
  console.log(phoneExist, "i am phoneExist");
  let userFound = await User.findOne({ uniqueId2: phoneExist?.uniqueId });
  console.log(userFound, "i am found user");
  if (!phoneExist) {
    res.json({
      serverError: 0,
      message: "Phonenumber is not registered with us",
      data: {
        success: 0,
      },
    });
    return;
  }
  let otp = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log(otp, "i am otp");
  let foundForgotPhone = await Filephoneverified.findOne({
    fileId: fileId,
  });
  if (foundForgotPhone) {
    Filephoneverified.deleteOne({ fileId: fileId }, async (err) => {
      if (err) {
        throw new Error("Error deleting the OTP Session");
      } else {
        console.log("deleted previous");
      }
    });
  }
  console.log(phoneExist);
  let createdForgotOtp = new Filephoneverified({
    otp: otp,
    fileId: fileId,
    created: Date.now(),
    expires: Date.now() + 600000,
  });

  createdForgotOtp.save(async (err) => {
    if (err) {
      console.log(err),
        res.json({
          serverError: 1,
          message: "Somthing went wrong",
          data: {
            success: 0,
          },
        });
      return;
    } else {
      // sendPhoneOtp(phoneExist?.phoneNumber, otp);
      try {
        await sendEmailOtp(userFound?.email, otp);
      } catch (err) {
        console.log(err.message);
      }
      res.json({
        serverError: 0,
        message: "OTP Sent to Phone Number",
        data: {
          fileId: fileId,
          otp: otp,
          success: 1,
        },
      });
      return;
    }
  });

  return;
};

const requestForgotOtp = async (req, res) => {
  console.log(req.body);
  const { phoneNumber } = req.body;
  let phoneExist = await File.findOne({ phoneNumber: phoneNumber });
  let userFound = await User.findOne({ uniqueId2: phoneExist?.uniqueId });
  console.log(userFound, "i am found user");
  if (!phoneExist) {
    res.json({
      serverError: 0,
      message: "We couldn't find record with this mobile number.",
      data: {
        success: 0,
      },
    });
    return;
  }
  // if(phoneExist)
  let otp = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log(otp, "i am otp");

  let foundForgotPhone = await Forgotphoneverified.findOne({
    fileId: phoneExist._id,
  });

  if (foundForgotPhone) {
    Forgotphoneverified.deleteOne({ fileId: phoneExist._id }, async (err) => {
      if (err) {
        throw new Error("Error deleting the OTP Session");
      } else {
        console.log("deleted previous");
      }
    });
  }

  console.log(phoneExist);
  let createdForgotOtp = new Forgotphoneverified({
    otp: otp,
    fileId: phoneExist._id,
    created: Date.now(),
    expires: Date.now() + 600000,
  });

  createdForgotOtp.save(async (err) => {
    if (err) {
      console.log(err),
        // res.json({
        //   success: false,
        //   message: "Somthing went wrong",
        // });
        res.json({
          serverError: 1,
          message: "Somthing went wrong",
          data: {
            success: 0,
          },
        });
      return;
    } else {
      try {
        await sendEmailOtp(userFound?.email, otp);
      } catch (err) {
        console.log(err.message);
      }
      res.json({
        serverError: 0,
        message:
          "We have sent OTP to your registered Mobile Number and Email ID, please enter now to proceed.",
        data: {
          fileId: phoneExist._id,
          otp: otp,
          success: 1,
        },
      });
      return;
    }
  });

  return;
};

const verifyForgotOtp = async (req, res) => {
  console.log(req.body);
  const { otp, fileId } = req.body;

  let found = await Forgotphoneverified.findOne({ fileId: fileId });
  console.log(found);
  if (found) {
    if (found.expires > Date.now()) {
      if (found.otp === otp) {
        res.json({
          serverError: 0,
          message: "Thanks for verifying your Mobile Number",
          data: {
            success: 1,
          },
        });
        return;
      } else {
        // res.json({ success: false, message: "OTP is wrong" });
        res.json({
          serverError: 0,
          message: "You have entered an Incorrect OTP Code, please try again.",
          data: {
            success: 0,
          },
        });
        return;
      }
    } else {
      res.json({
        serverError: 0,
        message: "OTP got expired. Kindly request the new one",
        data: {
          success: 0,
        },
      });
      return;
    }
  } else {
    // res.json({ success: false, message: "Kindly request the OTP Again" });
    res.json({
      serverError: 1,
      message: "Kindly request the OTP Again",
      data: {
        success: 0,
      },
    });
    return;
  }
};

const contact = async (req, res) => {
  // console.log(req.files);
  console.log(req.files, "i am files");

  let filesName = [];
  if (req?.files?.length > 0) {
    console.log(req.files, "here are the files");
    filesName = req.files.map((file) => file.path);
  }

  console.log(req.body);
  const {
    name,
    contactInfo,
    subject,
    message,
    appVersion,
    appOsVersion,
    source,
  } = req.body;

  let savedContact = new Contact({
    name,
    contactInfo,
    subject,
    message,
    appVersion,
    appOsVersion,
    source,
    files: filesName,
  });

  savedContact.save((err) => {
    if (err) {
      console.log(err);

      res.json({
        serverError: 1,

        message: "Somthing went wrong while saving the contact info",
        data: {
          success: 0,
        },
      });
      return;
    } else {
      res.json({
        serverError: 0,

        message:
          "We have received your message and will respond within 24-48 Hrs",
        data: {
          success: 1,
        },
      });
      return;
    }
  });
};
const logout = async (req, res) => {
  console.log(req.body);
  res.json({
    serverError: 0,
    message: "You are logged out",
    data: {
      success: 1,
    },
  });
};

const deleteAccount = async (req, res) => {
  console.log(req.body);
  const { fileId } = req.body;

  try {
    let foundFamilyIds = await File.findOne({ _id: fileId }, "familyMembers");
    foundFamilyIds = foundFamilyIds.familyMembers.map(
      (member) => member.userId
    );
    console.log(foundFamilyIds, "i am ids");

    File.updateOne(
      { _id: fileId },
      { $set: { active: false } },
      async (err) => {
        if (err) {
          throw new Error("Some Error occuered while deleting acount");
        } else {
          let yoo = foundFamilyIds.map(async (memberId) => {
            try {
              let deletedConvo = Conversation.deleteMany({
                members: { $in: [memberId] },
              });
              let deletedMessage = Message.deleteMany({ senderId: memberId });
              let deletedScans = Scans.deleteMany({ userId: memberId });
              let deletedUser = User.deleteOne({ _id: memberId });

              let resolved = await Promise.all([
                deletedConvo,
                deletedMessage,
                deletedScans,
                deletedUser,
              ]);
              console.log(resolved, "this is resolved");
              return resolved;
            } catch (err) {
              throw new Error("Somthing went wrong while deleting data");
            }
          });
          try {
            let doneDeleting = await Promise.all(yoo);
            console.log(doneDeleting);
            return true;
          } catch (err) {
            console.log(err);
            throw new Error("Something went wrong");
          }
        }
      }
    );
    File.deleteOne({ _id: fileId }, (err) => {
      if (err) {
        throw new Error("Somthing went wrong while deleting data");
      } else {
        res.json({
          serverError: 0,
          message: "Your account has been deleted successfully",
          data: {
            success: 1,
          },
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

const getAllDoctors = async (req, res) => {
  // const doctors = [
  //   {
  //     _id: "1",
  //     doctorName: "Tasadduq",
  //     departmentNumber: "123",
  //     role: "admin",
  //   },
  //   {
  //     _id: "2",
  //     doctorName: "Tasadduq Ali",
  //     departmentNumber: "1234",
  //     role: "doctor",
  //   },
  //   {
  //     _id: "3",
  //     doctorName: "Tasadduq Ali Khokhar",
  //     departmentNumber: "12345",
  //     role: "doctor",
  //   },
  //   {
  //     _id: "4",
  //     doctorName: "Sanju",
  //     departmentNumber: "123456",
  //     role: "doctor",
  //   },
  //   {
  //     _id: "5",
  //     doctorName: "Sanju Doctor",
  //     departmentNumber: "1234567",
  //     role: "doctor",
  //   },
  // ];

  try {
    let foundDoctors = User.find({ role: "2" }, [
      "firstName",
      "lastName",
      "role",
    ]);
    let foundAdmin = User.find({ role: "3" }, [
      "firstName",
      "lastName",
      "role",
    ]);

    let [foundDoctorsResolved, foundAdminResolved] = await Promise.all([
      foundDoctors,
      foundAdmin,
    ]);

    foundDoctors = [foundAdminResolved, ...foundDoctorsResolved];
    if (foundDoctors.length > 0) {
      res.json({
        serverError: 0,
        message: "Doctors Found",
        data: {
          doctors: foundDoctors,
          success: 1,
        },
      });
    } else {
      res.json({
        serverError: 0,
        message: "Doctors Found",
        data: {
          doctors: doctors,
          success: 1,
        },
      });
    }
  } catch (err) {
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        // doctors: doctors,
        success: 0,
      },
    });
  }
};

module.exports = {
  signup,
  login,
  checkPatient,
  emailVerify,
  fileVerify,
  newPassword,
  getUsers,
  requestNewOtp,
  requestForgotOtp,
  verifyForgotOtp,
  contact,
  getUserdata,
  changePassword,
  logout,
  updateUserProfile,
  deleteAccount,
  getAllDoctors,
};
