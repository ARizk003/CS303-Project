const bcrypt      = require("bcryptjs");
const jwt         = require("jsonwebtoken");
const User        = require("../models/User");
const { jwtSecret, jwtExpiration } = require("../config/jwt");
const {
  generateOtp,
  hashOtp,
  validatePassword,
  sendOtpEmail,
  sendPasswordChangedEmail
} = require("../services/passwordResetService");


exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const role =
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
        ? "admin"
        : "student";

    user = new User({ username, email, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const token = signToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.googleLogin = async (req, res) => {
  const { email, username } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ username, email, password: "google-auth", role: "student" });
      await user.save();
    }
    const token = signToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
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
    if (user.role === "admin") {
      return res.status(403).json({ msg: "Cannot change the role of another admin" });
    }
    if (!["admin", "student"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    user.role = role;
    await user.save();
    res.json({ msg: "User role updated successfully", user });
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


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const genericMsg = "If that email is registered, you will receive an OTP shortly.";

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ msg: genericMsg });
    }

    if (user.lastOtpSentAt) {
      const secondsSinceLast = (Date.now() - new Date(user.lastOtpSentAt).getTime()) / 1000;
      if (secondsSinceLast < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceLast);
        return res.status(429).json({
          msg: `Please wait ${waitSeconds} seconds before requesting a new OTP.`
        });
      }
    }

    const otp = generateOtp();
    
    const hashedOtp = hashOtp(otp);


    user.resetOtp        = hashedOtp;
    user.resetOtpExpire  = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts     = 0;
    user.lastOtpSentAt   = new Date();
    await user.save();

    await sendOtpEmail(email, otp);

    console.log(`[PASSWORD RESET] OTP sent to ${email} at ${new Date().toISOString()}`);

    res.json({ msg: genericMsg });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.resetOtp) {
      return res.status(400).json({ msg: "No password reset request found for this email." });
    }

    if (user.otpAttempts >= 5) {
      user.resetOtp       = null;
      user.resetOtpExpire = null;
      user.otpAttempts    = 0;
      await user.save();
      return res.status(429).json({
        msg: "Too many failed attempts. Please request a new OTP."
      });
    }

    if (new Date() > new Date(user.resetOtpExpire)) {
      user.resetOtp       = null;
      user.resetOtpExpire = null;
      user.otpAttempts    = 0;
      await user.save();
      return res.status(400).json({ msg: "OTP has expired. Please request a new one." });
    }

    const hashedInput = hashOtp(otp);
    if (hashedInput !== user.resetOtp) {
      user.otpAttempts += 1;
      await user.save();

      const attemptsLeft = 5 - user.otpAttempts;
      return res.status(400).json({
        msg: `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`
      });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ msg: passwordCheck.msg });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetOtp       = null;
    user.resetOtpExpire = null;
    user.otpAttempts    = 0;

    await user.save();

    console.log(`[PASSWORD RESET] Password successfully reset for ${email} at ${new Date().toISOString()}`);

    await sendPasswordChangedEmail(email);

    res.json({ msg: "Password has been reset successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

function signToken(user) {
  return jwt.sign(
    { user: { id: user.id, role: user.role } },
    jwtSecret,
    { expiresIn: jwtExpiration }
  );
}

function safeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    image: user.image || "",
  };
}