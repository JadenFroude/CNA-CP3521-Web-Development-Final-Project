const REGISTER_URL = "http://localhost:5001/api/auth/register";

document
  .getElementById("register-form")
  .addEventListener("submit", registerUser);

async function registerUser(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const message = document.getElementById("register-message");

  const userData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    province: formData.get("province"),
    postalCode: formData.get("postalCode")
  };

  message.textContent = "Creating account...";

  try {
    const response = await fetch(REGISTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Registration failed.");
    }

    message.textContent = "Account created successfully.";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  } catch (error) {
    message.textContent = error.message;
  }
}