const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔗 MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/jobportal")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// 👤 USER MODEL
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// 💼 JOB MODEL
const jobSchema = new mongoose.Schema({
  title: String,
  company: String
});

const Job = mongoose.model("Job", jobSchema);

// 📝 APPLICATION MODEL
const applicationSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  jobTitle: String,
  company: String
});

const Application = mongoose.model("Application", applicationSchema);

// 🟢 REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ ADD JOB
app.post("/jobs", async (req, res) => {
  const job = new Job(req.body);
  await job.save();
  res.json({ message: "Job added" });
});

// 📋 GET JOBS
app.get("/jobs", async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

// 📌 APPLY JOB
app.post("/apply", async (req, res) => {
  const application = new Application(req.body);
  await application.save();
  res.json({ message: "Applied successfully" });
});

// 🚀 START SERVER
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});