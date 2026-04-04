const express = require("express");
const router = express.Router();

const { auth, adminOnly } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.get("/", auth, adminOnly, authController.getAllUsers);

router.get("/:id", auth, adminOnly, async (req, res) => {
  try {
    const User = require("../models/User");

    const user = await User
      .findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        msg: "User not found"
      });
    }

    res.json(user);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.put("/role/update", auth, adminOnly, authController.updateUserRole);

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const User = require("../models/User");

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        msg: "User not found"
      });
    }

    await user.deleteOne();

    res.json({
      msg: "User deleted successfully"
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;