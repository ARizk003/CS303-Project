require('dotenv').config();
const express    = require('express');
const path       = require('path');
const fs         = require('fs');
const connectDB  = require("./config/db");
const authRoutes = require('./routes/auth');
const usersRoutes = require("./routes/users");
const listRoutes  = require("./routes/lists");
const cors       = require('cors');

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

connectDB();

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`[INIT] Created uploads directory at ${UPLOAD_DIR}`);
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




app.use('/api/auth',  authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/books", require("./routes/books"));
app.use("/api/tags",  require("./routes/tags"));
app.use("/api/lists", listRoutes);
app.use("/api/borrow", require("./routes/borrow"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));