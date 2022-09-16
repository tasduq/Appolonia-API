const bcrypt = require("bcryptjs");
var otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
var CryptoJS = require("crypto-js");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");
const { encrypt, decrypt, randomKey } = require("lab46-encrypt");
const { JWTKEY, SMTPPASS, accountSid, authToken } = require("../Config/config");

var KEY = "qwertyuiopasdfghjklzxcvbnm123456";

const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Contact = require("../Models/Contact");
const Filephoneverified = require("../Models/Filephoneverification");
const Forgotphoneverified = require("../Models/Forgotphonrverification");

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
  const foundUser = await User.findOne({ _id: userId });
  if (foundUser) {
    res.json({ success: true, message: "User found", userData: foundUser });
  } else {
    res.json({ success: false, message: "User not found" });
  }
};

const checkPatient = async (req, res) => {
  console.log(req.body);
  const { isFileNumber, fileNumber, emiratesId } = req.body;

  let otp = otpGenerator.generate(4, {
    upperCase: false,
    specialChars: false,
    alphabets: false,
  });
  if (!otp) {
    throw new Error("Error Genrating OTP");
  }
  try {
    if (isFileNumber === 1) {
      fileExist = await File.findOne({
        uniqueId: fileNumber,
        clinicVerified: true,
      });
      if (!fileExist) {
        throw new Error("No account is registered with that File Number");
      } else {
        sendPhoneOtp(fileExist.phoneNumber, otp);
        // sendEmailOtp(email, otp);'

        const createdFilephoneverification = new Filephoneverified({
          otp: otp,
          fileId: fileExist._id,
        });

        createdFilephoneverification.save((err) => {
          if (err) {
            throw new Error("Error saving the OTP");
          } else {
            res.json({
              ErrorCode: 1,
              Data: {
                success: true,
                fileId: fileExist._id,
                message:
                  "We have sent the OTP to the number and email associated to that account",
              },
            });
          }
        });
      }
    } else {
      fileExist = await File.findOne({
        emiratesId: emiratesId,
        clinicVerified: true,
      });
      console.log(fileExist, "fileexist");
      if (!fileExist) {
        throw new Error("No account is registered with that Emirates Id");
      } else {
        sendPhoneOtp(fileExist.phoneNumber, otp);
        // sendEmailOtp(email, otp);

        const createdFilephoneverification = new Filephoneverified({
          otp: otp,
          fileId: fileExist._id,
        });

        createdFilephoneverification.save((err) => {
          if (err) {
            throw new Error("Error saving the OTP");
          } else {
            res.json({
              ErrorCode: 1,
              Data: {
                success: true,
                fileId: fileExist._id,
                message:
                  "We have sent the OTP to the number and email associated to that account",
              },
            });
          }
        });
      }
    }
  } catch (err) {
    // res.json({ success: false, message: err.message });
    res.json({
      ErrorCode: 0,
      Data: { success: false, message: err.message },
    });
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
    type,
    fileNumber,
    password,
    city,
    gender,
    isSignupWithFileNumber,
    fileId,
  } = req.body;
  console.log(req.body);

  if (type === 1) {
    try {
      let existingUser = await User.findOne({ uniqueId: emiratesId });

      if (existingUser) {
        throw new Error("User Already Exist");
      }

      let userPhoneExist = await File.findOne({ phoneNumber: phoneNumber });
      if (userPhoneExist) {
        throw new Error("User Phone Already Exist");
      }

      userPhoneExist = await File.findOne({ emiratesId: emiratesId });
      if (userPhoneExist) {
        throw new Error("Emirates Id Already Exist");
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
        upperCase: false,
        specialChars: false,
        alphabets: false,
      });
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
        uniqueId: emiratesId,
        city,
        gender,
      });

      const createdFile = new File({
        phoneNumber: phoneNumber,
        emiratesId: emiratesId,
        password: hashedpassword,
        clinicVerified: false,
        phoneVerified: false,
        activeRequested: false,
        active: false,
        countryCode: countryCode,
        city,
      });

      createdUser.save((err) => {
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
              sendPhoneOtp(phoneNumber, otp);
              sendEmailOtp(email, otp);
              let latestFile = await File.findOne(
                { phoneNumber: phoneNumber },
                "_id"
              );
              console.log(latestFile);

              const createdFilephoneverification = new Filephoneverified({
                otp: otp,
                fileId: latestFile._id,
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
                          connected: false,
                        },
                      },
                    },
                    (err) => {
                      if (err) {
                        throw new Error("Error creating the User");
                      } else {
                        res.json({
                          message:
                            "Registration Successful. You would be notified from the clinic soon",
                          success: true,
                          responseData: {
                            fileId: latestFile._id,
                          },
                        });
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
        success: false,
        message: err.message,
      });
    }
  } else {
    try {
      let fileExist;
      let hashedpassword = await bcrypt.hash(password, 12);

      fileExist = await File.findOne({ _id: fileId });
      if (!fileExist) {
        throw new Error("No account is registered with that File Number");
      } else {
        File.updateOne(
          {
            _id: fileId,
          },
          { $set: { activeRequested: true, password: hashedpassword } },
          (err) => {
            if (err) {
              throw new Error("Somthing went wrong while making request");
            } else {
              res.json({
                success: true,
                message:
                  "Thanks for registering with us, our team will review your details and contact you soon to activate your account",
              });
            }
          }
        );
      }
      // } else {
      //   fileExist = await File.findOne({ emiratesId: emiratesId });
      //   if (!fileExist) {
      //     throw new Error("No account is registered with that Emirates Id");
      //   } else {
      //     File.updateOne(
      //       {
      //         emiratesId: emiratesId,
      //       },
      //       { $set: { activeRequested: true, password: hashedpassword } },
      //       (err) => {
      //         if (err) {
      //           throw new Error("Somthing went wrong while making request");
      //         } else {
      //           res.json({
      //             success: true,
      //             message:
      //               "Thanks for registering with us, our team will review your details and contact you soon to activate your account",
      //           });
      //         }
      //       }
      //     );
      //   }
      // }

      // if (!fileNumber) {
      //   throw new Error("You havn't provided the File Number");
      // }

      // let hashedfileNumber = CryptoJS.AES.encrypt(
      //   fileNumber,
      //   "love"
      // ).toString();

      // if (!existingFile) {
      //   throw new Error(
      //     "File Number is not correct or its not got verified by Clinic"
      //   );
      // }

      // console.log(existingFile, "i am existing file");

      // let existingFile = await File.updateOne({
      //   uniqueId: fileNumber,
      //   clinicVerified: true,
      // });

      // let hashedemiratesId = CryptoJS.AES.encrypt(
      //   emiratesId,
      //   "love"
      // ).toString();

      // let existingUser = await User.findOne({ uniqueId: emiratesId });

      // if (existingUser) {
      //   let { familyMembers } = existingFile;
      //   let decryptedFamilyMembers = familyMembers.map((member) => {
      //     let yoo = member;
      //     console.log(yoo, "i am yoo");
      //     let decryptedemiratesId;
      //     decryptedemiratesId = CryptoJS.AES.decrypt(
      //       yoo.memberEmiratesId,
      //       "love"
      //     );
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

      //   let foundMember = decryptedFamilyMembers.find(
      //     (member) => member.memberEmiratesId === emiratesId
      //   );

      //   if (foundMember) {
      //     if (foundMember.connected === true) {
      //       throw new Error("You are already the member of the Family Account");
      //     } else if (foundMember.connected === false) {
      //       throw new Error("You have already requested to join the account.");
      //     } else {
      //       throw new Error("Somthing went wrong");
      //     }
      //   }

      //   File.updateOne(
      //     { uniqueId: fileNumber },
      //     {
      //       $push: {
      //         familyMembers: {
      //           memberEmiratesId: hashedemiratesId,
      //           connected: false,
      //         },
      //       },
      //     },
      //     (err) => {
      //       if (err) {
      //         throw new Error("Error creating the User");
      //       } else {
      //         res.json({
      //           success: true,
      //           message: "You would be soon verified by the Clinic",
      //         });
      //       }
      //     }
      //   );
      // } else {
      //   let hashedEmail;
      //   let hashedphoneNumber;

      //   //   let existingUser = await User.findOne({ uniqueId: emiratesId });

      //   // if (existingUser) {
      //   //   throw new Error("User Already Exist");
      //   // }

      //   const createdUser = new User({
      //     firstName,
      //     lastName,
      //     email: email,
      //     phoneNumber: phoneNumber,
      //     emiratesId: hashedemiratesId,
      //     role,
      //     countryCode,
      //     uniqueId: emiratesId,
      //     city,
      //     gender,
      //   });

      //   createdUser.save(async (err) => {
      //     if (err) {
      //       throw new Error("Error creating the User");
      //     } else {
      //       // console.log({ message: "user created", createdUser });
      //       // let newUser = User.findOne({emirates : })
      //       File.updateOne(
      //         { uniqueId: fileNumber },
      //         {
      //           $push: {
      //             familyMembers: {
      //               memberEmiratesId: hashedemiratesId,
      //               connected: false,
      //             },
      //           },
      //         },
      //         (err) => {
      //           if (err) {
      //             throw new Error("Error creating the User");
      //           } else {
      //             res.json({
      //               success: true,
      //               message: "You would be soon verified by the Clinic",
      //             });
      //           }
      //         }
      //       );
      //     }
      //   });
      // }

      // } catch (err) {
    } catch (err) {
      console.log(err, "i am error");
      res.json({
        success: false,
        message: err.message,
      });
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
    .then((message) => console.log(message.sid))
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
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log(error, "I am error");
        return error;
      } else {
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
    });
    return true;
  } else {
    // res.status(401).json({ message: "Something went Wrong" });
    console.log("There is problem");
    return false;
  }
};

const emailVerify = async (req, res) => {
  const { otp, phoneNumber, fileId } = req.body;
  let user;

  try {
    user = await Filephoneverified.findOne({ fileId: fileId }, "otp");
    console.log(user);
    if (user) {
      if (user.otp === otp) {
        File.updateOne(
          { fileId: fileId },
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
                    success: true,
                    message: "Phone Number verified",
                    fileData: {
                      // fileNumber: foundFile.uniqueId,
                      // city: foundFile.city,
                      // familyMembers: foundFile?.familyMembers?.length,
                      // emiratesId: foundFile.emiratesId,
                      // phoneNumber: foundFile.phoneNumber,
                      fileId: foundFile._id,
                    },
                  });
                }
              });
            }
          }
        );
      } else {
        throw new Error("Otp is wrong");
      }
    } else {
      throw new Error("File Id is not correct");
    }
  } catch (err) {
    console.log(err.message);
    return res.json({ success: false, message: err.message });
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
  const { fileNumber, password, emiratesId, type } = req.body;
  let existingUser;

  // console.log(email, password);

  if (type === 1) {
    try {
      existingUser = await File.findOne({ emiratesId: emiratesId });
      console.log(existingUser, "i am existing user");

      if (!existingUser) {
        throw new Error("Account does not exist");
      } else {
        if (existingUser.clinicVerified === false) {
          throw new Error("Your account has not verified from the clinic yet");
        }

        if (existingUser.active === false) {
          throw new Error(
            "Your account has not been activated from the clinic yet"
          );
        }

        if (existingUser.phoneVerified === false) {
          throw new Error("You have not verified your phone number");
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
          throw new Error("Wrong Password");
        }

        let access_token;
        try {
          access_token = jwt.sign(
            { userId: existingUser._id, emiratesId: existingUser.emiratesId },
            JWTKEY,
            { expiresIn: "1h" }
          );
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong while creating token");
        }

        let familyIds = existingUser.familyMembers.filter((member) => {
          // if (member.connected === true) {
          //   console.log(member);
          return member.connected === true && member;
          // }
        });

        familyIds = familyIds.map((member) => member.memberEmiratesId);
        console.log(familyIds, "We are family ids");

        let familyMembers = await User.find({ emiratesId: { $in: familyIds } });
        console.log(familyMembers, "we are members");

        let decryptedFileNumber;
        decryptedFileNumber = CryptoJS.AES.decrypt(
          existingUser.fileNumber,
          "love"
        );
        decryptedFileNumber = decryptedFileNumber.toString(CryptoJS.enc.Utf8);
        console.log(decryptedFileNumber, "decrupted");

        res.json({
          message: "you are login success fully ",
          id: existingUser._id,
          role: existingUser.role,
          access_token: access_token,
          success: true,
          fileNumber: existingUser.fileNumber,
          familyMembers,
        });
      }
    } catch (err) {
      console.log(err.message);
      res.json({ success: false, message: err.message });
    }
  } else {
    try {
      existingUser = await File.findOne({ uniqueId: fileNumber });

      if (!existingUser) {
        throw new Error("Account does not exist");
      } else {
        if (existingUser.clinicVerified === false) {
          throw new Error("Your account has not verified from the clinic yet");
        }

        if (existingUser.active === false) {
          throw new Error(
            "Your account has not been activated from the clinic yet"
          );
        }

        if (existingUser.phoneVerified === false) {
          throw new Error("You have not verified your phone number");
        }

        if (existingUser.phoneVerified === false) {
          throw new Error("Your have not verified your phone number");
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
          throw new Error("Wrong Password");
        }

        let access_token;
        try {
          access_token = jwt.sign(
            { userId: existingUser._id, emiratesId: existingUser.emiratesId },
            JWTKEY,
            { expiresIn: "1h" }
          );
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong while creating token");
        }

        let familyIds = existingUser.familyMembers.filter((member) => {
          // if (member.connected === true) {
          //   console.log(member);
          return member.connected === true && member;
          // }
        });

        familyIds = familyIds.map((member) => member.memberEmiratesId);
        console.log(familyIds, "We are family ids");

        let familyMembers = await User.find({ emiratesId: { $in: familyIds } });
        console.log(familyMembers, "we are members");

        // let decryptedFileNumber;
        // decryptedFileNumber = CryptoJS.AES.decrypt(
        //   existingUser.fileNumber,
        //   "love"
        // );
        // decryptedFileNumber = decryptedFileNumber.toString(CryptoJS.enc.Utf8);

        res.json({
          message: "you are login success fully ",
          id: existingUser._id,
          role: existingUser.role,
          access_token: access_token,
          success: true,
          fileNumber: existingUser.fileNumber,
          familyMembers,
        });
      }
    } catch (err) {
      console.log(err.message);
      res.json({ success: false, message: err.message });
    }
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

      res.json({
        success: false,
        data: err,
        message: "Something went wrong",
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
                      throw new Error("Error deleting the OTP Session");
                    } else {
                      console.log("deleted previous");
                      return res.json({
                        success: true,
                        message: "Password Updated",
                      });
                    }
                  }
                );
              } else {
                // console.log(err);
                res.json({
                  success: false,
                  data: err,
                  message: "Something went wrong",
                });
                return;
              }
            }
          );
        } else {
          res.json({ success: false, message: "Otp Wrong" });
          return;
        }
      } else {
        return res.json({ success: false, message: "Somthing went wrong" });
      }
    } catch (err) {
      return res.json({ success: false, message: "Somthing went wrong" });
    }
  } else {
    res.json({
      success: false,
      message: "Some Details are missing",
    });
  }
};

const requestNewOtp = async (req, res) => {
  console.log(req.body);
  const { phoneNumber } = req.body;
  let phoneExist = await File.findOne({ phoneNumber: phoneNumber }, "_id");
  if (!phoneExist) {
    res.json({
      success: false,
      message: "Phonenumber is not registered with us",
    });
    return;
  }
  let otp = otpGenerator.generate(4, {
    upperCase: false,
    specialChars: false,
    alphabets: false,
  });
  sendPhoneOtp(phoneNumber, otp);

  res.json({ success: true, message: "OTP Sent to Phone Number" });
  return;
};

const requestForgotOtp = async (req, res) => {
  console.log(req.body);
  const { phoneNumber } = req.body;
  let phoneExist = await File.findOne({ phoneNumber: phoneNumber }, "_id");
  if (!phoneExist) {
    res.json({
      success: false,
      message: "Phonenumber is not registered with us",
    });
    return;
  }
  let otp = otpGenerator.generate(4, {
    upperCase: false,
    specialChars: false,
    alphabets: false,
  });

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
  let createdForgotOtp = await Forgotphoneverified({
    otp: otp,
    fileId: phoneExist._id,
    created: Date.now(),
    expires: Date.now() + 600000,
  });

  createdForgotOtp.save((err) => {
    if (err) {
      console.log(err),
        res.json({
          success: false,
          message: "Somthing went wrong",
        });
    } else {
      sendPhoneOtp(phoneNumber, otp);
      res.json({
        success: true,
        message: "OTP Sent to Phone Number",
        fileId: phoneExist._id,
      });
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
          success: true,
          message: "OTP got verified",
        });
      } else {
        res.json({ success: false, message: "OTP is wrong" });
      }
    } else {
      res.json({
        success: false,
        message: "OTP got expired. Request the new one",
      });
    }
  } else {
    res.json({ success: false, message: "Kindly request the OTP Again" });
  }
};

const contact = async (req, res) => {
  console.log(req.files);
  if (req.files.length === 0) {
    res.json({ success: false, message: "Files not selecteds" });
    return;
  }
  let filesName = req.files.map((file) => file.filename);
  console.log(req.body.name);
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
        success: false,
        message: "Somthing went wrong while saving the contact info",
      });
    } else {
      res.json({
        success: true,
        message:
          "We have received your message and will respond within 24-48 Hrs",
      });
    }
  });
};

module.exports = {
  signup,
  login,
  checkPatient,
  emailVerify,
  fileVerify,
  // requestNewEmailOtp,
  newPassword,
  getUsers,
  // deleteUsers,
  // editBio,
  // editUserInfo,
  // updateUserImage,
  requestNewOtp,
  requestForgotOtp,
  verifyForgotOtp,
  contact,
};
