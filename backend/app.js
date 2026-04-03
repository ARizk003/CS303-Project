require('dotenv').config();
const express = require('express');
const connectDB = require("./config/db");
const authRoutes = require('./routes/auth');
const usersRoutes = require("./routes/users");
const cors = require('cors');

const app = express();

connectDB();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/users", usersRoutes);
app.use('/api/books', require('./routes/books'));


app.listen(PORT, () => console.log(`app.js is saying : Server running on port ${PORT}`));