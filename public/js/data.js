document.getElementById("contactform")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const sub = document.getElementById("subject").value;
  const message= document.getElementById("msg").value;
  
  const res = await fetch("http://localhost:5000/api/contact/send", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, email, phone, sub, message}),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("Thank you! Your message has been sent.");
  document.getElementById("contactform").reset();
});
