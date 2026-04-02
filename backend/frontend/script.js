// REGISTER
function register() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}

// LOGIN
function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {

        // ❌ CHECK LOGIN FAILED
        if (!data.user) {
            alert("Invalid email or password ❌");
            return;
        }

        // ✅ LOGIN SUCCESS
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        alert("Login successful ✅");
        window.location.href = "dashboard.html";
    })
    .catch(err => console.log(err));
}


// LOGOUT
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

// APPLY JOB
function applyJob(job) {
    let user = JSON.parse(localStorage.getItem("loggedInUser"));

    fetch("http://localhost:3000/apply", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            email: user.email,
            job: job
        })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}

// VIEW APPLICATIONS
function viewApplications() {
    window.location.href = "applications.html";
}

// SEARCH JOB
function searchJob() {
    let input = document.getElementById("search").value.toLowerCase();
    let jobs = document.querySelectorAll("#jobList li");

    jobs.forEach(job => {
        job.style.display = job.innerText.toLowerCase().includes(input) ? "" : "none";
    });
}