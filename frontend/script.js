const API = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
  ? "http://localhost:3000/api"
  : "/api";

/* =========================
   CUSTOM TOAST ALERTS
========================= */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '<i class="fa-solid fa-circle-info"></i>';
  if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
  if (type === 'error') icon = '<i class="fa-solid fa-circle-exclamation"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

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

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      })
    });

    const data = await res.json();
    
    if (res.ok) {
      showToast(data.message, 'success');
      setTimeout(() => window.location.href = "login.html", 1500);
    } else {
      showToast(data.message, 'error');
    }
  } catch(err) {
    showToast("Server error", 'error');
  }
});


/* =========================
   LOGIN (WITH ROLE)
========================= */
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      })
    });

    const data = await res.json();

    if (res.ok) {
      const role = document.getElementById("email").value === "admin@gmail.com" ? "admin" : "user";
      localStorage.setItem("user", JSON.stringify({
        ...data.user,
        role: role
      }));

      showToast("Login successful!", "success");
      setTimeout(() => window.location.href = "dashboard.html", 1000);
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    showToast("Server error", "error");
  }
});


/* =========================
   LOAD JOBS
========================= */
async function loadJobs() {
  try {
    const res = await fetch(`${API}/jobs`);
    const jobs = await res.json();

    const jobList = document.getElementById("jobList");
    if (!jobList) return;

    jobList.innerHTML = "";

    if (jobs.length === 0) {
      jobList.innerHTML = "<p style='color: var(--text-muted);'>No jobs available right now.</p>";
    }

    jobs.forEach(job => {
      const div = document.createElement("div");
      div.className = "job-card";

      div.innerHTML = `
        <div class="job-info">
          <h4>${job.title}</h4>
          <p><i class="fa-regular fa-building"></i> ${job.company}</p>
        </div>
        <button onclick="applyJob('${job.title}', '${job.company}')">
          <i class="fa-solid fa-paper-plane"></i> Apply
        </button>
      `;

      jobList.appendChild(div);
    });

    // 👉 SHOW ADMIN PANEL
    const user = getUser();
    if (user && user.role === "admin") {
      const adminSec = document.getElementById("adminSection");
      if(adminSec) adminSec.style.display = "block";
    }
  } catch (err) {
    console.error("Error loading jobs");
  }
}

// Load jobs automatically on relevant pages
if (document.getElementById("jobList")) loadJobs();


/* =========================
   ADD JOB (ADMIN ONLY)
========================= */
document.getElementById("jobForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = getUser();

  if (!user || user.role !== "admin") {
    showToast("Only admin can add jobs", "error");
    return;
  }

  const title = document.getElementById("title");
  const company = document.getElementById("company");

  try {
    await fetch(`${API}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.value,
        company: company.value
      })
    });

    showToast("Job added successfully!", "success");
    title.value = "";
    company.value = "";
    loadJobs();
  } catch (err) {
    showToast("Error adding job", "error");
  }
});


/* =========================
   APPLY JOB
========================= */
async function applyJob(title, company) {
  const user = getUser();

  if (!user) {
    showToast("Please login first to apply", "error");
    setTimeout(() => window.location.href = "login.html", 1500);
    return;
  }

  const message = prompt("Optional: Enter a short message or cover letter for this application:");
  if (message === null) return; // User cancelled

  try {
    const res = await fetch(`${API}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: user.name,
        userEmail: user.email,
        jobTitle: title,
        company: company,
        applicantMessage: message || ""
      })
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message, "success");
      if (document.getElementById("myApplicationsCard")) {
        loadMyApplications();
      }
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    console.log(err);
    showToast("Apply failed", "error");
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
  // Also check if we are on applications.html
  const appListOnly = document.getElementById("applicationList");
  
  const targetList = list || appListOnly;
  if (!targetList) return;

  if (card) card.style.display = "block";

  try {
    const res = await fetch(`${API}/applications?email=${user.email}`);
    const apps = await res.json();

    targetList.innerHTML = "";

    if (apps.length === 0) {
      targetList.innerHTML = "<p style='color: var(--text-muted);'>You haven't applied for any jobs yet.</p>";
      return;
    }

    apps.forEach(app => {
      const div = document.createElement("div");
      div.className = "job-card my-app-card";

      let messageText = app.applicantMessage ? app.applicantMessage : "(No message)";

      div.innerHTML = `
        <div class="job-info" style="width: 100%;">
          <h4>${app.jobTitle}</h4>
          <p><i class="fa-regular fa-building"></i> ${app.company}</p>
          <div style="margin-top:10px; padding:10px; background: rgba(0,0,0,0.2); border-left: 3px solid #cbd5e1; border-radius: 4px;">
            <p style="font-size: 0.9em; color: #cbd5e1; font-weight: normal; margin: 0;">
              <i class="fa-regular fa-comment"></i> ${messageText}
            </p>
          </div>
        </div>
        <div class="my-app-actions">
          <button style="background: #eab308; color: black; padding: 8px 16px; font-size: 0.9rem;" onclick="editApplication('${app._id}', '${messageText.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          <button style="background: #ef4444; color: white; padding: 8px 16px; font-size: 0.9rem;" onclick="withdrawApplication('${app._id}')">
            <i class="fa-solid fa-trash"></i> Withdraw
          </button>
        </div>
      `;

      targetList.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading applications", err);
  }
}

// Load applications automatically 
if (document.getElementById("myApplicationsCard") || document.getElementById("applicationList")) {
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
      showToast("Application updated!", "success");
      loadMyApplications();
    } else {
      showToast("Failed to update application", "error");
    }
  } catch (err) {
    console.log(err);
    showToast("Error updating application", "error");
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
      showToast("Application withdrawn!", "success");
      loadMyApplications();
    } else {
      showToast("Failed to withdraw application", "error");
    }
  } catch (err) {
    console.log(err);
    showToast("Error withdrawing application", "error");
  }
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.removeItem("user");
  showToast("Logging out...", "info");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 800);
}