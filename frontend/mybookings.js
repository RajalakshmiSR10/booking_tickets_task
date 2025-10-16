const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

document.getElementById("welcomeMsg").textContent = username ? `Hello, ${username}` : "";

// Fetch user's bookings
async function loadBookings() {
  try {
    const res = await fetch("http://localhost:5000/api/bookings", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();

    const listDiv = document.getElementById("bookingsList");
    listDiv.innerHTML = "";

    if (data.length === 0) {
      listDiv.innerHTML = "<p>No bookings yet.</p>";
      return;
    }

    data.forEach(b => {
      const div = document.createElement("div");
      div.className = "booking-item";
      div.innerHTML = `
        <strong>${b.type.toUpperCase()}: ${b.item_name}</strong><br>
        Date: ${b.date}<br>
        Tickets: ${b.tickets}<br>
        Total Price: ₹${b.price}
      `;
      listDiv.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load bookings");
  }
}

function goBack() {
  window.location.href = "available.html";
}

loadBookings();
