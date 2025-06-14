document.getElementById("unbanForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const phoneNumber = document.getElementById("phoneNumber").value;
  const reason = document.getElementById("reason").value;

  try {
    const response = await fetch("/send-unban-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, reason }),
    });
    const result = await response.json();
    if (response.ok) {
      document.getElementById("unbanForm").style.display = "none";
      document.getElementById("confirmation").style.display = "block";
      document.getElementById("userNumber").textContent = phoneNumber;
    } else {
      alert(result.message || "Error sending request.");
    }
  } catch (error) {
    alert("Error connecting to server. Try again later.");
  }
});
