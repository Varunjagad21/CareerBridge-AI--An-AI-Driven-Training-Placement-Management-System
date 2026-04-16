const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const announcementRoutes = require('./routes/announcements');
const path = require('path');
const applicationRoutes = require('./routes/applicationRoutes');
const companyProfileRoutes = require('./routes/companyProfileRoutes');


dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());



// connect database
connectDB();

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use('/api/announcements', announcementRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/company-profile', companyProfileRoutes);
app.use('/api/students', require('./routes/studentRoutes'));

// test route
app.get("/", (req, res) => {
  res.send("CareerConnect Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
