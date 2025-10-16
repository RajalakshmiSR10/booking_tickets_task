const selectedType = localStorage.getItem("selectedType");
const selectedName = localStorage.getItem("selectedName");
const selectedPrice = Number(localStorage.getItem("selectedPrice"));

document.getElementById("selectedItem").textContent = selectedName;

const numTicketsInput = document.getElementById("numTickets");
const totalPriceP = document.getElementById("totalPrice");
const bookBtn = document.getElementById("bookBtn");

//price
numTicketsInput.addEventListener("input", () => {
  const tickets = Number(numTicketsInput.value);
  totalPriceP.textContent = `Total Price: ₹${tickets * selectedPrice}`;
});

// Book ticket
bookBtn.addEventListener("click", async () => {
  const tickets = Number(numTicketsInput.value);
  const date = document.getElementById("date").value;

  if (!date) return alert("Please select a date");
  if (!tickets || tickets <= 0) return alert("Please enter number of tickets");

  try {
    const res = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        type: selectedType,
        item_name: selectedName,
        tickets,
        date
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Booking successful! Total: ₹${data.booking.price}`);
      window.location.href = "available.html";
    } else {
      alert(data.message || "Booking failed");
    }
  } catch (err) {
    console.error(err);
    alert("Network error. Try again.");
  }
});

//back
function goBack() {
  window.location.href = "available.html";
}
