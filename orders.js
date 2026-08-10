const ORDER_HISTORY_URL =
  "http://localhost:5001/api/orders/history";

document.addEventListener("DOMContentLoaded", loadPurchaseHistory);

async function loadPurchaseHistory() {
  const container = document.getElementById("orders-container");
  const token = localStorage.getItem("grandSlamToken");

  if (!token) {
    container.innerHTML = `
      <div class="empty-orders">
        <h2>Log in required</h2>
        <p>You must log in to view your purchase history.</p>
        <a href="login.html" class="button">Log In</a>
      </div>
    `;

    container.setAttribute("aria-busy", "false");
    return;
  }

  try {
    const response = await fetch(ORDER_HISTORY_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to load purchase history."
      );
    }

    displayOrders(result);
  } catch (error) {
    container.innerHTML = `
      <div class="empty-orders" role="alert">
        <h2>Purchase history unavailable</h2>
        <p>${escapeHtml(error.message)}</p>
        <a href="login.html" class="button">Log In Again</a>
      </div>
    `;
  }

  container.setAttribute("aria-busy", "false");
}

function displayOrders(orders) {
  const container = document.getElementById("orders-container");

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-orders">
        <h2>No purchases yet</h2>
        <p>Your completed purchases will appear here.</p>
        <a href="bats.html" class="button">Browse Products</a>
      </div>
    `;

    return;
  }

  container.innerHTML = orders
    .map(
      (order) => `
        <article class="order-card">
          <div class="order-header">
            <div>
              <h2>Order #${order.id}</h2>
              <p>${formatDate(order.created_at)}</p>
            </div>

            <div class="order-header-summary">
              <span class="order-status">
                ${escapeHtml(order.status)}
              </span>

              <strong>
                $${Number(order.total_amount).toFixed(2)}
              </strong>
            </div>
          </div>

          <div class="order-items">
            ${order.items
              .map(
                (item) => `
                  <div class="order-item">
                    <span>
                      ${escapeHtml(item.product_name)}
                      × ${Number(item.quantity)}
                    </span>

                    <strong>
                      $${(
                        Number(item.price_at_purchase) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </strong>
                  </div>
                `
              )
              .join("")}
          </div>

          <div class="order-shipping">
            <h3>Shipping address</h3>

            <p>
              ${escapeHtml(order.shipping_address)}<br>
              ${escapeHtml(order.shipping_city)},
              ${escapeHtml(order.shipping_province)}<br>
              ${escapeHtml(order.shipping_postal_code)}
            </p>
          </div>
        </article>
      `
    )
    .join("");
}

function formatDate(dateValue) {
  const date = new Date(dateValue);

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}