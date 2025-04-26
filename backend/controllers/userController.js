import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { dirname, join } from "path"; // also import `join` if using it

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

//login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

//register user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

function generateOtp(req, res) {
  const otp = Math.floor(100000 + Math.random() * 900000);
  // res.json({success:true,otp})
  return otp;
}

async function sendEmail(req, res) {
  const tomatoEmail = process.env.TOMATO_EMAIL;
  const tomatoEmailPassword = process.env.TOMATO_EMAIL_PASSWORD;
  const userEmail = req.body.email;
  // check if email is valid
  if (!validator.isEmail(userEmail)) {
    return res.json({ success: false, message: "Please enter a valid email" });
  }
  // check if user already exists
  const user = await userModel.findOne({ email: userEmail });
  if (user) {
    res.json({ success: false, message: "User already exists" });
    return;
  }

  const otp = generateOtp(req, res);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: tomatoEmail,
      pass: tomatoEmailPassword,
    },
  });

  const mailOptions = {
    from: tomatoEmail,
    to: userEmail,
    subject: "Tomato Email Verification - Your OTP Code",
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                <div style="text-align: center;">
                    <img src="cid:logo" alt="Website Logo" style="width: 120px; margin-bottom: 20px;" />
                    <h2 style="color: #333;">Your OTP for Email Verification</h2>
                </div>
                <div style="text-align: center; margin: 40px 0;">
                    <p style="font-size: 22px; color: #444;">Please use the following OTP to verify your email:</p>
                    <div style="font-size: 36px; font-weight: bold; color: #4CAF50; margin: 20px 0;">${otp}</div>
                </div>
                <div style="font-size: 14px; color: #777; text-align: center;">
                    <p>If you did not request this, please ignore this email.</p>
                    <p>This OTP is valid for a limited time only.</p>
                </div>
            </div>
        `,
    attachments: [
      {
        filename: "logo.png",
        path: join(__dirname, "../images", "logo.png"), // change to your local file path
        cid: "logo", // same as src="cid:logo"
      },
    ],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.json({ success: false, message: "Error in sending email" });
      console.log(error);
    } else {
      res.json({ success: true, otp: otp });
    }
  });
}

export { loginUser, registerUser, sendEmail };
