document.addEventListener("DOMContentLoaded", displayAccount);

function displayAccount() {
  const accountContent = document.getElementById("account-content");
  const savedUser = localStorage.getItem("grandSlamUser");

  if (!savedUser) {
    accountContent.innerHTML = `
      <p>You are not currently logged in.</p>

      <a href="login.html" class="button">
        Log In
      </a>

      <a href="register.html" class="secondary-button">
        Create Account
      </a>
    `;

    return;
  }

  const user = JSON.parse(savedUser);

  accountContent.innerHTML = `
    <div class="account-card">
      <h2>
        Welcome, ${escapeHtml(user.firstName)}
      </h2>

      <p>
        <strong>Name:</strong>
        ${escapeHtml(user.firstName)}
        ${escapeHtml(user.lastName)}
      </p>

      <p>
        <strong>Email:</strong>
        ${escapeHtml(user.email)}
      </p>

      <a href="orders.html" class="button">
        View Purchase History
      </a>

      <a href="edit-account.html" class="secondary-button">
        Edit Account
        </a>

      <button
        id="logout-button"
        class="secondary-button"
        type="button"
      >
        Log Out
      </button>
    </div>
  `;

  document
    .getElementById("logout-button")
    .addEventListener("click", logout);
}

function logout() {
  localStorage.removeItem("grandSlamToken");
  localStorage.removeItem("grandSlamUser");

  window.location.href = "login.html";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}