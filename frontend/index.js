const API_BASE = "http://localhost:5000/api";
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const signInBtn = document.getElementById("signInBtn");

signInBtn.addEventListener("click", () => {
  signupForm.classList.toggle("hidden");
  loginForm.classList.toggle("hidden");
});

// signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (res.status === 201) {
      alert("Signup successful! You can now login.");
      signupForm.reset();
      signupForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
    } else if (res.status === 409) {
      alert("Email already registered! Try login.");
    } else {
      const err = await res.json();
      alert(err.message || "Signup failed");
    }
  } catch (err) {
    console.error(err);
    alert("Network error. Try again.");
  }
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.name);
      alert(`Welcome, ${data.name}!`);
      window.location.href = "available.html";
    } else {
      const err = await res.json();
      alert(err.message || "Invalid credentials");
    }
  } catch (err) {
    console.error(err);
    alert("Network error. Try again.");
  }
});
