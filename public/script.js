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
      alert(result.message || "Request එක යවන්න බැරි වෙන්නෙ නෑ.😓🐉");
    }
  } catch (error) {
    alert("Server එකට connect වෙන්න බැරි වෙන්නෙ නෑ. ආයෙ උත්සාහ කරපන් 😒🎈.");
  }
});
