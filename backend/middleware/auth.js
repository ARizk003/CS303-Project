const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt");



///////////////////////duplicated code fragment //////////////////////////

// module.exports = function (req, res, next) {
//
//   const token = req.header("x-auth-token");
//
//
//   if (!token) {
//     return res.status(401).json({ msg: "No token, authorization denied" });
//   }
//
//
//   try {
//     const decoded = jwt.verify(token, jwtSecret);
//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: "Token is not valid" });
//   }
// };


// const jwt = require("jsonwebtoken");
// const { jwtSecret } = require("../config/jwt");
// ^
//
// SyntaxError: Identifier 'jwt' has already been declared
// at wrapSafe (node:internal/modules/cjs/loader:1735:18)
// at Module._compile (node:internal/modules/cjs/loader:1778:20)
// at Object..js (node:internal/modules/cjs/loader:1936:10)
// at Module.load (node:internal/modules/cjs/loader:1525:32)
// at Module._load (node:internal/modules/cjs/loader:1327:12)
// at TracingChannel.traceSync (node:diagnostics_channel:328:14)
// at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
// at Module.require (node:internal/modules/cjs/loader:1548:12)
// at require (node:internal/modules/helpers:152:16)
// at Object.<anonymous> (C:\Users\Abdelrahman\Desktop\CS303\college-project\backend\routes\auth.js:4:14)
//
// Node.js v24.13.1
//     [nodemon] app crashed - waiting for file changes before starting...



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