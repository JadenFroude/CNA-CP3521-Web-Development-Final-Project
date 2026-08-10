document.addEventListener("DOMContentLoaded", updateAuthStatus);

function updateAuthStatus() {
    const savedUser = localStorage.getItem("grandSlamUser");

    // Find the account link in the header
    const accountLink = document.querySelector(
        ".icons a[href='account.html']"
    );

    if (!accountLink) {
        return;
    }

    // User is not logged in
    if (!savedUser) {
        accountLink.innerHTML = `
            <i class="fa-solid fa-user"></i>
        `;

        accountLink.href = "login.html";
        accountLink.setAttribute("aria-label", "Log in");

        return;
    }

    // User is logged in
    try {
        const user = JSON.parse(savedUser);

        const firstName = user.firstName || "User";

        accountLink.innerHTML = `
            <i class="fa-solid fa-user"></i>

            <span class="logged-in-name">
                Hi, ${escapeHtml(firstName)}
            </span>
        `;

        accountLink.href = "account.html";

        accountLink.setAttribute(
            "aria-label",
            `Logged in as ${firstName}. View account.`
        );

    } catch (error) {
        console.error("Unable to read logged-in user:", error);

        localStorage.removeItem("grandSlamUser");

        accountLink.innerHTML = `
            <i class="fa-solid fa-user"></i>
        `;

        accountLink.href = "login.html";
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}