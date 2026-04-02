console.log("Script loaded");

// ---------------- REGISTER ----------------
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (data.message === "Registration successful") {
      window.location.href = "login.html";
    }
  });
}

// ---------------- LOGIN ----------------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (data.message === "Login successful") {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";
    }
  });
}

// ---------------- DASHBOARD ----------------
const userInfo = document.getElementById("userInfo");
const jobList = document.getElementById("jobList");
const jobForm = document.getElementById("jobForm");

// SHOW USER INFO
if (userInfo) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "login.html";
  } else {
    userInfo.innerHTML = `
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
    `;
  }
}

// ---------------- LOAD JOBS ----------------
async function loadJobs() {
  if (!jobList) return;

  const res = await fetch("http://localhost:3000/jobs");
  const jobs = await res.json();

  console.log("Jobs:", jobs); // debug

  jobList.innerHTML = "";

  if (jobs.length === 0) {
    jobList.innerHTML = "<p>No jobs available</p>";
    return;
  }

  jobs.forEach(job => {
    const div = document.createElement("div");

    div.innerHTML = `
      <p><strong>${job.title}</strong> - ${job.company}</p>
      <button onclick="applyJob('${job.title}', '${job.company}')">
        Apply
      </button>
      <hr>
    `;

    jobList.appendChild(div);
  });
}

// ---------------- APPLY JOB ----------------
async function applyJob(title, company) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first");
    return;
  }

  await fetch("http://localhost:3000/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userName: user.name,
      userEmail: user.email,
      jobTitle: title,
      company: company
    })
  });

  alert("Applied successfully!");
}

// ---------------- ADD JOB ----------------
if (jobForm) {
  jobForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const company = document.getElementById("company").value;

    await fetch("http://localhost:3000/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, company })
    });

    alert("Job added!");
    jobForm.reset();

    loadJobs(); // refresh list
  });
}

// ---------------- LOGOUT ----------------
const logoutBtn = document.getElementById("logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

// ---------------- AUTO LOAD JOBS ----------------
if (jobList) {
  loadJobs();
}