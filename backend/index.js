const express = require("express"); // u-ws: udayworkspace
const dotenv = require("dotenv");
const cors = require("cors");
const connectionofDb = require("./connects.js");
const path = require("path");
const fs = require("fs");

//////dotenv config/////////////////////
dotenv.config();

const app = express();

//////connection to DB/////////////////
connectionofDb();

const PORT = process.env.PORT || 8001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api/user', require('./routes/userRouter.js'));
app.use('/api/admin', require('./routes/adminRouter.js'));
app.use('/api/owner', require('./routes/ownerRouter.js'));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
