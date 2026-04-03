const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());


/* =========================
   MONGODB CONNECTION
========================= */
mongoose.connect("mongodb://127.0.0.1:27017/jobportal")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


/* =========================
   SCHEMAS
========================= */

// 👤 USER
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: String,
  password: String
}));

// 💼 JOB
const Job = mongoose.model("Job", new mongoose.Schema({
  title: String,
  company: String
}));

// 📄 APPLICATION
const Application = mongoose.model("Application", new mongoose.Schema({
  userName: String,
  userEmail: String,
  jobTitle: String,
  company: String,
  applicantMessage: String
}));

// 🌱 SEED DEFAULT JOBS
async function seedJobs() {
  try {
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      await Job.insertMany([
        { title: "Frontend Developer", company: "TechCorp" },
        { title: "Backend Engineer", company: "DataSystems" },
        { title: "UX Designer", company: "CreativeSolutions" },
        { title: "React Developer", company: "Meta" },
        { title: "Full Stack Developer", company: "Google" },
        { title: "Data Scientist", company: "Netflix" },
        { title: "DevOps Engineer", company: "Amazon" },
        { title: "Product Manager", company: "Apple" },
        { title: "Cybersecurity Analyst", company: "Microsoft" },
        { title: "Mobile App Developer", company: "Spotify" },
        { title: "AI/ML Engineer", company: "OpenAI" }
      ]);
      console.log("Seeded database with default jobs");
    }
  } catch (err) {
    console.log("Error seeding jobs:", err);
  }
}
seedJobs();


/* =========================
   REGISTER
========================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* =========================
   LOGIN
========================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Wrong password" });
    }

    res.json({
      message: "Login success",
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* =========================
   ADD JOB (ADMIN)
========================= */
app.post("/jobs", async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();

    res.json(job);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding job" });
  }
});


/* =========================
   GET ALL JOBS (USERS)
========================= */
app.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});


/* =========================
   APPLY JOB
========================= */
app.post("/apply", async (req, res) => {
  try {
    console.log("Apply:", req.body);

    const application = new Application(req.body);
    await application.save();

    res.json({ message: "Applied successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Apply failed" });
  }
});


/* =========================
   GET APPLICATIONS
========================= */
app.get("/applications", async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { userEmail: email } : {};
    const apps = await Application.find(query);
    res.json(apps);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching applications" });
  }
});

/* =========================
   UPDATE APPLICATION
========================= */
app.put("/applications/:id", async (req, res) => {
  try {
    const { applicantMessage } = req.body;
    await Application.findByIdAndUpdate(req.params.id, { applicantMessage });
    res.json({ message: "Application updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating application" });
  }
});

/* =========================
   DELETE APPLICATION
========================= */
app.delete("/applications/:id", async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting application" });
  }
});


/* =========================
   SERVER START
========================= */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});