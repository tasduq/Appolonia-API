const bcrypt = require("bcryptjs");
var otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
var CryptoJS = require("crypto-js");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");
const { encrypt, decrypt, randomKey } = require("lab46-encrypt");
const { JWTKEY } = require("../Config/config");

var KEY = "qwertyuiopasdfghjklzxcvbnm123456";

const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Filephoneverified = require("../Models/Filephoneverification");

const accountSid = "AC05d6ccacda0201d3e850b4ce60c773af";
const authToken = "cc306492d86211c72c259ed8a24e386f";
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
  } = req.body;
  console.log(req.body);

  if (type === 1) {
    try {
      // try {

      // let hashedemairatesId = CryptoJS.AES.encrypt(
      //   emiratesId,
      //   "love"
      // ).toString();
      // let hashedemairatesId = cryptr.encrypt(emiratesId);
      // console.log(hashedemairatesId, "i am emirates Id");
      // const decryptedString = cryptr.decrypt(hashedemairatesId);
      // console.log(decryptedString, "decryypted");

      // let hashedemairatesId = encrypt({
      //   data: emiratesId,
      //   KEY,
      // });
      // console.log(hashedemairatesId, "i am emirates Id");
      // const decryptedData = decrypt({ data: hashedemairatesId, KEY });
      // console.log(decryptedData, "decrypted Data");

      let existingUser = await User.findOne({ emiratesId: emiratesId });

      //       var bytes  = CryptoJS.AES.decrypt(existingUser., 'secret key 123');
      // var originalText = bytes.toString(CryptoJS.enc.Utf8);

      if (existingUser) {
        // res.json({
        //   success: false,
        //   message: "You are an Existing User",
        // });
        // return;
        throw new Error("User Already Exist");
      }
      // } catch (err) {
      // res.json({
      //   success: false,
      //   data: err,
      //   message: "Signing up failed, please try again later.",
      // });
      // }

      // let hashedEmail;
      // let hashedphoneNumber;
      // // let hashedemiratesId;
      let hashedpassword;

      try {
        // hashedEmail = CryptoJS.AES.encrypt(email, "love").toString();
        // hashedphoneNumber = CryptoJS.AES.encrypt(
        //   phoneNumber,
        //   "love"
        // ).toString();
        // hashedemiratesId = bcrypt.hash(emiratesId, 12);
        hashedpassword = await bcrypt.hash(password, 12);
        // hashedemairatesId = CryptoJS.AES.encrypt(
        //   emiratesId,
        //   "love"
        // ).toString();

        // [hashedEmail, hashedphoneNumber, hashedemiratesId, hashedpassword] =
        //   await Promise.all([
        //     hashedEmail,
        //     hashedphoneNumber,
        //     hashedemiratesId,
        //     hashedpassword,
        //   ]);
        // console.log(
        //   hashedEmail,
        //   hashedpassword,
        //   hashedphoneNumber,
        //   hashedemiratesId,
        //   "i am hashed user"
        // );
      } catch (err) {
        console.log("Something went wrong while Encrypting Data", err);

        throw new Error("Something went wrong while Encrypting Data");
      }

      let otp = otpGenerator.generate(4, {
        upperCase: false,
        specialChars: false,
        alphabets: true,
      });
      if (!otp) {
        throw new Error("Error Genrating OTP");
      }

      const createdUser = new User({
        firstName,
        lastName,
        email: email,
        phoneNumber: phoneNumber,
        emiratesId: emiratesId,
        role,
      });

      const createdFile = new File({
        phoneNumber: phoneNumber,
        emiratesId: emiratesId,
        password: hashedpassword,
        clinicVerified: false,
        phoneVerified: false,
      });

      createdUser.save((err) => {
        if (err) {
          throw new Error("Error creating the User");
        } else {
          // console.log({ message: "user created", createdUser });
          createdFile.save(async (err) => {
            if (err) {
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
                          memberEmiratesId: emiratesId,
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
      // try {

      if (!fileNumber) {
        throw new Error("You havn't provided the File Number");
      }

      // let hashedfileNumber = CryptoJS.AES.encrypt(
      //   fileNumber,
      //   "love"
      // ).toString();

      let existingFile = await File.findOne({
        fileNumber: fileNumber,
        clinicVerified: true,
      });

      if (!existingFile) {
        throw new Error("File Number is not correct");
      }

      // let hashedemiratesId = CryptoJS.AES.encrypt(
      //   emiratesId,
      //   "love"
      // ).toString();

      let existingUser = await User.findOne({ emiratesId: emiratesId });

      if (existingUser) {
        // res.json({
        //   success: false,
        //   message: "You are an Existing User",
        // });
        // return;
        // throw new Error("User Already Exist");
        File.updateOne(
          { fileNumber: fileNumber },
          {
            $push: {
              familyMembers: {
                memberEmiratesId: emiratesId,
                connected: false,
              },
            },
          },
          (err) => {
            if (err) {
              throw new Error("Error creating the User");
            } else {
              res.json({
                success: true,
                message: "You would be soon verified by the Clinic",
              });
            }
          }
        );
      } else {
        let hashedEmail;
        let hashedphoneNumber;
        // let hashedemiratesId;
        // let hashedfileNumber;
        // let hashedpassword;

        // try {
        //   // hashedEmail = CryptoJS.AES.encrypt(email, "love").toString();
        //   // hashedphoneNumber = CryptoJS.AES.encrypt(
        //   //   phoneNumber,
        //   //   "love"
        //   // ).toString();

        //   // hashedemiratesId = bcrypt.hash(emiratesId, 12);
        //   // hashedpassword = await bcrypt.hash(password, 12);

        //   // [hashedEmail, hashedphoneNumber, hashedemiratesId] =
        //   //   await Promise.all([
        //   //     hashedEmail,
        //   //     hashedphoneNumber,
        //   //     hashedemiratesId,
        //   //   ]);
        //   // console.log(
        //   //   hashedEmail,
        //   //   hashedfileNumber,
        //   //   hashedphoneNumber,
        //   //   hashedemiratesId,
        //   //   "i am hashed user"
        //   // );
        // } catch (err) {
        //   console.log("Something went wrong while Encrypting Data", err);

        //   throw new Error("Something went wrong while Encrypting Data", err);
        // }

        const createdUser = new User({
          firstName,
          lastName,
          email: email,
          phoneNumber: phoneNumber,
          emiratesId: emiratesId,
          role,
        });

        createdUser.save(async (err) => {
          if (err) {
            throw new Error("Error creating the User");
          } else {
            // console.log({ message: "user created", createdUser });
            // let newUser = User.findOne({emirates : })
            File.updateOne(
              { fileNumber: fileNumber },
              {
                $push: {
                  familyMembers: {
                    memberEmiratesId: emiratesId,
                    connected: false,
                  },
                },
              },
              (err) => {
                if (err) {
                  throw new Error("Error creating the User");
                } else {
                  res.json({
                    success: true,
                    message: "You would be soon verified by the Clinic",
                  });
                }
              }
            );
          }
        });
      }

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
        pass: "mxnqbnuiaradsmxe", // generated ethereal password
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
              throw new Error("Error verifying phone");
            } else {
              Filephoneverified.deleteOne({ fileId: fileId }, (err) => {
                if (err) {
                  throw new Error("Error deleting the OTP Session");
                } else {
                  res.json({
                    success: true,
                    message: "Phone Number verified",
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

  try {
    let isFileExist = await File.findOne({ fileNumber: fileNumber });
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
        { $set: { clinicVerified: true, fileNumber: fileNumber } },
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
  const { fileNumber, password, phoneNumber, type } = req.body;
  let existingUser;

  // console.log(email, password);

  if (type === 1) {
    try {
      existingUser = await File.findOne({ phoneNumber: phoneNumber });

      if (!existingUser) {
        throw new Error("Account does not exist");
      } else {
        if (existingUser.clinicVerified === false) {
          throw new Error("Your account has not verified from the clinic yet");
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
            { userId: existingUser._id, email: existingUser.phoneNumber },
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
      existingUser = await File.findOne({ fileNumber: fileNumber });

      if (!existingUser) {
        throw new Error("Account does not exist");
      } else {
        if (existingUser.clinicVerified === false) {
          throw new Error("Your account has not verified from the clinic yet");
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
            { userId: existingUser._id, phoneNumber: existingUser.phoneNumber },
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

  const { newPassword, email, recentOtp } = req.body;
  console.log(newPassword, email, recentOtp, "details");

  if (newPassword && email && recentOtp) {
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
      let user = await User.findOne({ email: email }, "-password");
      console.log(user);
      if (user) {
        if (user.emailVerificationCode === recentOtp) {
          User.updateOne(
            { email: email },
            { $set: { password: hashedPassword } },
            function (err) {
              if (!err) {
                console.log("Updated");
                return res.json({ success: true, message: "Password Updated" });
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

const updateUserImage = async (req, res) => {
  const { id, image } = req.body;

  if (id && image) {
    User.updateOne({ _id: id }, { $set: { image, image } }, function (err) {
      if (!err) {
        console.log("User Image Updated");
        return res.json({
          success: true,
          message: "User Image Updated",
        });
      } else {
        res.json({
          success: false,
          message: "Something went wrong",
        });
        return;
      }
    });
  } else {
    res.json({
      success: false,
      message: "Id and Image needed",
    });
  }
};

module.exports = {
  signup,
  login,
  emailVerify,
  fileVerify,
  // requestNewEmailOtp,
  newPassword,
  getUsers,
  // deleteUsers,
  // editBio,
  // editUserInfo,
  updateUserImage,
};
