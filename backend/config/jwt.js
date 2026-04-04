module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
<<<<<<< HEAD
  jwtExpiration: '1h',
};

=======
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
};
>>>>>>> df07846d554141f43841149cc0b071663c112f62



