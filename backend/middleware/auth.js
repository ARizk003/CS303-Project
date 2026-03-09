const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt");

module.exports = function (req, res, next) {

  const token = req.header("x-auth-token");


  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }


  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt");


const auth = (req, res, next) => {

  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({
      msg: "No token, authorization denied"
    });
  }

  try {

    const decoded = jwt.verify(token, jwtSecret);

    req.user = decoded.user;

    next();

  } catch (err) {

    res.status(401).json({
      msg: "Token is not valid"
    });

  }

};



const adminOnly = (req, res, next) => {

  if (req.user.role !== "admin") {

    return res.status(403).json({
      msg: "Access denied. Admin only."
    });

  }

  next();

};




const studentOnly = (req, res, next) => {

  if (req.user.role !== "student") {

    return res.status(403).json({
      msg: "Access denied. Students only."
    });

  }

  next();

};


module.exports = auth;
module.exports.adminOnly = adminOnly;
module.exports.studentOnly = studentOnly;