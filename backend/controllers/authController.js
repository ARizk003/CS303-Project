const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jwtSecret, jwtExpiration } = require("../config/jwt");


exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    let role = email === "admin@admin.com" ? "admin" : "student";

    user = new User({
      username,
      email,
      password,
      role
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiration
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {

    console.error(err.message);
    res.status(500).send("Server error");

  }
};



exports.loginUser = async (req, res) => {

  const { email, password } = req.body;

  try {

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiration
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {

    console.error(err.message);
    res.status(500).send("Server error");

  }

};



exports.updateUserRole = async (req, res) => {

  const { userId, role } = req.body;

  try {

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!["admin", "student"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    user.role = role;

    await user.save();

    res.json({
      msg: "User role updated successfully",
      user
    });

  } catch (err) {

    console.error(err.message);
    res.status(500).send("Server error");

  }

};



exports.getAllUsers = async (req, res) => {

  try {

    const users = await User.find().select("-password");

    res.json(users);

  } catch (err) {

    console.error(err.message);
    res.status(500).send("Server error");

  }

};



exports.getMe = async (req, res) => {

  try {

    const user = await User
      .findById(req.user.id)
      .select("-password");

    res.json(user);

  } catch (err) {

    console.error(err.message);
    res.status(500).send("Server error");

  }

};