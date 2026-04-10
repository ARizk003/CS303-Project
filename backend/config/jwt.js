module.exports = {
  jwtSecret:     process.env.JWT_SECRET     || "supersecretjwtkey",
  jwtExpiration: process.env.JWT_EXPIRATION || "7d",
};