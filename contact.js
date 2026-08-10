const CONTACT_API_URL = "http://localhost:5001/api/contact";

document.addEventListener("DOMContentLoaded", () => {
  populateLoggedInUser();

  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", submitContactForm);
  }
});

function populateLoggedInUser() {
  const savedUser = localStorage.getItem("grandSlamUser");

  if (!savedUser) {
    return;
  }

  try {
    const user = JSON.parse(savedUser);

    document.getElementById("contact-name").value =
      `${user.firstName || ""} ${user.lastName || ""}`.trim();

    document.getElementById("contact-email").value =
      user.email || "";
  } catch (error) {
    console.error("Unable to read saved user:", error);
  }
}

async function submitContactForm(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const status = document.getElementById("contact-status");
  const submitButton = form.querySelector('button[type="submit"]');

  const contactData = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    subject: String(formData.get("subject") || "").trim(),
    message: String(formData.get("message") || "").trim()
  };

  submitButton.disabled = true;
  status.textContent = "Sending message...";

  try {
    const response = await fetch(CONTACT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(contactData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to send the message."
      );
    }

    status.textContent = result.message;
    form.reset();
    populateLoggedInUser();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
}