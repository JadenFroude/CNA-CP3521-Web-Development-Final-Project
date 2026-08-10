const LOGIN_URL = "http://localhost:5001/api/auth/login";

document
  .getElementById("login-form")
  .addEventListener("submit", loginUser);

async function loginUser(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const message = document.getElementById("login-message");

  const loginData = {
    email: formData.get("email"),
    password: formData.get("password")
  };

  message.textContent = "Logging in...";

  try {
    const response = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login failed.");
    }

    localStorage.setItem("grandSlamToken", result.token);

    localStorage.setItem(
      "grandSlamUser",
      JSON.stringify(result.user)
    );

    message.textContent = "Login successful.";

    setTimeout(() => {
      window.location.href = "account.html";
    }, 800);
  } catch (error) {
    message.textContent = error.message;
  }
}