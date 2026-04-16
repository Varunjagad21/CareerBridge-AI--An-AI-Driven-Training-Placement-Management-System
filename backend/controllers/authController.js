const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ── LOGIN ──
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        phone:      user.phone      || '',
        gender:     user.gender     || '',
        department: user.department || '',
        college:    user.college    || '',
        dob:        user.dob        || '',
        semester:   user.semester   || ''
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── REGISTER ──
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, gender, department, college, dob, semester } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password:   hashedPassword,
      role,
      phone:      phone      || '',
      gender:     gender     || '',
      department: department || '',
      college:    college    || '',
      dob:        dob        || '',
      semester:   semester   || ''
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        phone: user.phone, gender: user.gender, department: user.department,
        college: user.college, dob: user.dob, semester: user.semester
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};