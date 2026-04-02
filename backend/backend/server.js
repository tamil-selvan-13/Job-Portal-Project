// 🔹 IMPORTS
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 🔹 APP SETUP
const app = express();
app.use(cors());
app.use(express.json());

// 🔹 CONNECT TO MONGODB
mongoose.connect("mongodb://127.0.0.1:27017/jobAppDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err));

// 🔹 SCHEMAS

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

// Application Schema
const applicationSchema = new mongoose.Schema({
    email: String,
    job: String
});

// 🔹 MODELS
const User = mongoose.model("User", userSchema);
const Application = mongoose.model("Application", applicationSchema);

// 🔹 REGISTER API
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({ message: "User already exists!" });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.json({ message: "Registered successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 LOGIN API
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Login successful", user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 APPLY JOB API
app.post("/apply", async (req, res) => {
    try {
        const { email, job } = req.body;

        let exists = await Application.findOne({ email, job });

        if (exists) {
            return res.json({ message: "Already applied!" });
        }

        const newApp = new Application({ email, job });
        await newApp.save();

        console.log("Application saved:", email, job);

        res.json({ message: "Application submitted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 GET USER APPLICATIONS
app.get("/applications/:email", async (req, res) => {
    try {
        const userApps = await Application.find({ email: req.params.email });
        res.json(userApps);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 DELETE APPLICATION
app.post("/delete", async (req, res) => {
    try {
        const { email, job } = req.body;

        console.log("Delete request:", email, job);

        // 🔥 SAFE DELETE (case-insensitive)
        let result = await Application.deleteOne({
            email: { $regex: new RegExp(`^${email}$`, "i") },
            job: { $regex: new RegExp(`^${job}$`, "i") }
        });

        console.log("Delete result:", result);

        if (result.deletedCount === 0) {
            return res.json({ message: "Delete failed (not found)" });
        }

        res.json({ message: "Deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 TEST ROUTE
app.get("/", (req, res) => {
    res.send("Server is running...");
});

// 🔹 START SERVER
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});