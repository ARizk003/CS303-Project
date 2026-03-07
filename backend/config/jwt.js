module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
  jwtExpiration: '1h',
};


