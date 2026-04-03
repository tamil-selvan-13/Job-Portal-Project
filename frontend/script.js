const API = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
  ? "http://localhost:3000/api"
  : "/api";

/* =========================
   GET USER
========================= */
function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

/* =========================
   REGISTER
========================= */
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) window.location.href = "login.html";
});


/* =========================
   LOGIN (WITH ROLE)
========================= */
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();

  if (res.ok) {
    const role = email.value === "admin@gmail.com" ? "admin" : "user";

    localStorage.setItem("user", JSON.stringify({
      ...data.user,
      role: role
    }));

    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
});


/* =========================
   LOAD JOBS
========================= */
async function loadJobs() {
  const res = await fetch(`${API}/jobs`);
  const jobs = await res.json();

  const jobList = document.getElementById("jobList");
  if (!jobList) return;

  jobList.innerHTML = "";

  jobs.forEach(job => {
    const div = document.createElement("div");
    div.className = "job-card";

    div.innerHTML = `
      <div>
        <h4>${job.title}</h4>
        <p>${job.company}</p>
      </div>
      <button onclick="applyJob('${job.title}', '${job.company}')">
        Apply
      </button>
    `;

    jobList.appendChild(div);
  });

  // 👉 SHOW ADMIN PANEL
  const user = getUser();
  if (user && user.role === "admin") {
    document.getElementById("adminSection").style.display = "block";
  }
}

loadJobs();


/* =========================
   ADD JOB (ADMIN ONLY)
========================= */
document.getElementById("jobForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = getUser();

  if (!user || user.role !== "admin") {
    alert("Only admin can add jobs");
    return;
  }

  await fetch(`${API}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title.value,
      company: company.value
    })
  });

  alert("Job added");
  loadJobs();
});


/* =========================
   APPLY JOB
========================= */
async function applyJob(title, company) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first");
    return;
  }

  const message = prompt("Optional: Enter a short message or cover letter for this application:");
  if (message === null) return; // User cancelled

  try {
    const res = await fetch(`${API}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userName: user.name,
        userEmail: user.email,
        jobTitle: title,
        company: company,
        applicantMessage: message || ""
      })
    });

    const data = await res.json();

    alert(data.message);
    if (document.getElementById("myApplicationsCard")) {
      loadMyApplications();
    }

  } catch (err) {
    console.log(err);
    alert("Apply failed");
  }
}

/* =========================
   LOAD MY APPLICATIONS (DASHBOARD)
========================= */
async function loadMyApplications() {
  const user = getUser();
  if (!user) return;

  const card = document.getElementById("myApplicationsCard");
  const list = document.getElementById("myApplicationList");
  if (!card || !list) return;

  card.style.display = "block"; // Show the card

  const res = await fetch(`${API}/applications?email=${user.email}`);
  const apps = await res.json();

  list.innerHTML = "";

  if (apps.length === 0) {
    list.innerHTML = "<p>You haven't applied for any jobs yet.</p>";
    return;
  }

  apps.forEach(app => {
    const div = document.createElement("div");
    div.className = "job-card";

    let messageText = app.applicantMessage ? app.applicantMessage : "(No message)";

    div.innerHTML = `
      <div>
        <h4>${app.jobTitle}</h4>
        <p>${app.company}</p>
        <p style="font-size: 0.9em; color: #ccc;">Message: ${messageText}</p>
      </div>
      <div>
        <button style="background: #eab308; color: black;" onclick="editApplication('${app._id}', '${messageText.replace(/'/g, "\\'")}')">Edit</button>
        <button style="background: #ef4444; color: white; margin-left: 5px;" onclick="withdrawApplication('${app._id}')">Withdraw</button>
      </div>
    `;

    list.appendChild(div);
  });
}

// Only call this on the dashboard
if (document.getElementById("myApplicationsCard")) {
  loadMyApplications();
}

/* =========================
   EDIT APPLICATION
========================= */
async function editApplication(id, oldMessage) {
  const newMessage = prompt("Update your application message:", oldMessage !== "(No message)" ? oldMessage : "");
  
  if (newMessage === null || newMessage === oldMessage) return;

  try {
    const res = await fetch(`${API}/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicantMessage: newMessage })
    });
    
    if (res.ok) {
      alert("Application updated!");
      loadMyApplications();
    } else {
      alert("Failed to update application");
    }
  } catch (err) {
    console.log(err);
    alert("Error updating application");
  }
}

/* =========================
   WITHDRAW APPLICATION
========================= */
async function withdrawApplication(id) {
  if (!confirm("Are you sure you want to withdraw this application?")) return;

  try {
    const res = await fetch(`${API}/applications/${id}`, {
      method: "DELETE"
    });
    
    if (res.ok) {
      alert("Application withdrawn!");
      loadMyApplications();
    } else {
      alert("Failed to withdraw application");
    }
  } catch (err) {
    console.log(err);
    alert("Error withdrawing application");
  }
}
/* =========================
   LOAD APPLICATIONS
========================= */
async function loadApplications() {
  const res = await fetch(`${API}/applications`);
  const apps = await res.json();

  const list = document.getElementById("applicationList");
  if (!list) return;

  list.innerHTML = "";

  apps.forEach(app => {
    const div = document.createElement("div");
    div.className = "job-card";

    div.innerHTML = `
      <p><b>${app.userName}</b> applied for</p>
      <p>${app.jobTitle} - ${app.company}</p>
    `;

    list.appendChild(div);
  });
}

loadApplications();


/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}