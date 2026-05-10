const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      _id: user._id,
      name: user.username,
      email: user.email,
      role: user.role,
      image: user.image || "",
      createdAt: user.date
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const updateData = {};
    
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ msg: "Name cannot be empty" });
      updateData.username = name.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true , runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      _id: user._id,
      name: user.username,
      email: user.email,
      role: user.role,
      image: user.image || "",
      createdAt: user.date
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No image file provided" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.image = req.file.path;
    await user.save();

    res.json({
      image: user.image,
      msg: "Profile image updated successfully"
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};