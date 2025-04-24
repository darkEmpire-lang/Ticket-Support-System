import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from "nodemailer";
import path from "path";


// Function to create a JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};

// 📩 Send Welcome Email with Inline Image
const sendWelcomeEmail = async (name, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const imagePath = path.resolve("assets", "real.png");

  const mailOptions = {
    from: `"CraftTopia Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 Welcome to craftopia.lk –",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <img src="cid:realimage" alt="Welcome to Idam.lk" style="max-width: 100%; border-radius: 8px; margin-bottom: 20px;" />
          <h2 style="color: #2c3e50; text-align: center;">Welcome to  Craftopia, ${name}!</h2>
          <p style="font-size: 16px; color: #444; text-align: center;">We're thrilled to have you join our community.</p>
          <p style="font-size: 16px; color: #555;">With <strong>Craftopia.lk</strong>, you can explore best hand craft and buy shop and  listings—all in one place!</p>
          <ul style="font-size: 15px; color: #333;">
            <li>Discover new handmade  and listings</li>
            <li>🔒 shop everything u want </li>
          </ul>
          <p style="font-size: 15px; color: #666;">Thank you for choosing  craftopia.lk.</p>
          <p style="text-align: center; margin-top: 30px;">Warm regards,<br><strong>Team craftopia.lk</strong></p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: "flogo.png",
        path: imagePath,
        cid: "realimage", // referenced in HTML img src
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

// 🟢 Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(user._id);
    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// 🟢 Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let profilePic = "";

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 5) {
      return res.status(400).json({ success: false, message: "Password too short (min 5 chars)" });
    }

    if (req.file) {
      try {
        console.log("Uploading image to Cloudinary:", req.file.path);
        const uploadedResponse = await cloudinary.uploader.upload(req.file.path, {
          folder: "user_profiles",
        });
        profilePic = uploadedResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.json({ success: false, message: "Image upload failed" });
      }
    } else {
      console.warn("No file uploaded! req.file is undefined.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      profilePic,
    });

    await newUser.save();
    const token = createToken(newUser._id);

    // ✅ Send welcome email after registration
    await sendWelcomeEmail(name, email);

    res.status(201).json({ success: true, message: "Registration successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Update User
const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.params.id;
    let profilePic;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload_stream(
        { folder: "user_profiles" },
        (error, result) => {
          if (error) throw error;
          profilePic = result.secure_url;
        }
      ).end(req.file.buffer);
    }

    let updatedPassword = user.password;
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.password = updatedPassword;
    user.profilePic = profilePic || user.profilePic;

    await user.save();
    res.json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Admin Login
const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// 🟢 Get Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  adminlogin,
  updateUser,
  deleteUser,
  getUserProfile,
  verifyToken,
};
