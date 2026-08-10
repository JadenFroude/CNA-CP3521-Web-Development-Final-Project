const PROFILE_URL = "http://localhost:5001/api/users/profile";
const TOKEN_KEY = "grandSlamToken";
const USER_KEY = "grandSlamUser";

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();

  document
    .getElementById("edit-account-form")
    .addEventListener("submit", updateProfile);
});

async function loadProfile() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(PROFILE_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const user = await response.json();

    if (!response.ok) {
      throw new Error(user.message || "Unable to load account.");
    }

    document.getElementById("first-name").value = user.firstName;
    document.getElementById("last-name").value = user.lastName;
    document.getElementById("email").value = user.email;
    document.getElementById("phone").value = user.phone;
    document.getElementById("address").value = user.address;
    document.getElementById("city").value = user.city;
    document.getElementById("province").value = user.province;
    document.getElementById("postal-code").value = user.postalCode;
  } catch (error) {
    document.getElementById("edit-account-message").textContent =
      error.message;
  }
}

async function updateProfile(event) {
  event.preventDefault();

  const token = localStorage.getItem(TOKEN_KEY);
  const message = document.getElementById("edit-account-message");
  const formData = new FormData(event.target);

  const updateData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    province: formData.get("province"),
    postalCode: formData.get("postalCode")
  };

  message.textContent = "Saving changes...";

  try {
    const response = await fetch(PROFILE_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to update account.");
    }

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(result.user)
    );

    message.textContent = "Account updated successfully.";

    setTimeout(() => {
      window.location.href = "account.html";
    }, 900);
  } catch (error) {
    message.textContent = error.message;
  }
}