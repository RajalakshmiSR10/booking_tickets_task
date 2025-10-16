const username = localStorage.getItem("username");
document.getElementById("welcomeMsg").textContent = username ? `Hello, ${username}` : "";

// Fetch
async function loadAvailable() {
  try {
    const res = await fetch("http://localhost:5000/api/available");
    const data = await res.json();

    const busesDiv = document.getElementById("buses");
    const moviesDiv = document.getElementById("movies");

    busesDiv.innerHTML = "";
    moviesDiv.innerHTML = "";

    // Display buses
    data.buses.forEach(bus => {
      const btn = document.createElement("button");
      btn.textContent = `${bus.name} (${bus.available} seats) - ₹${bus.price}`;
      btn.addEventListener("click", () => {
        localStorage.setItem("selectedType", "bus");
        localStorage.setItem("selectedName", bus.name);
        localStorage.setItem("selectedPrice", bus.price);
        window.location.href = "book.html";
      });
      busesDiv.appendChild(btn);
    });

    // Display movies
    data.movies.forEach(movie => {
      const btn = document.createElement("button");
      btn.textContent = `${movie.name} (${movie.available} seats) - ₹${movie.price}`;
      btn.addEventListener("click", () => {
        localStorage.setItem("selectedType", "movie");
        localStorage.setItem("selectedName", movie.name);
        localStorage.setItem("selectedPrice", movie.price);
        window.location.href = "book.html";
      });
      moviesDiv.appendChild(btn);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load available tickets");
  }
}

loadAvailable();

function goBack() {
  window.location.href = "index.html";
}
