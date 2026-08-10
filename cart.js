const CART_STORAGE_KEY = "grandSlamCart";

document.addEventListener("DOMContentLoaded", () => {
  displayCart();

  document
    .getElementById("clear-cart-button")
    .addEventListener("click", clearCart);

  document
    .getElementById("checkout-button")
    .addEventListener("click", goToCheckout);
});

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Unable to read cart:", error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  if (typeof updateCartStatus === "function") {
    updateCartStatus();
}
}

function displayCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const checkoutButton = document.getElementById("checkout-button");
  const clearCartButton = document.getElementById("clear-cart-button");

  const cart = getCart();

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some products before checking out.</p>
        <a href="bats.html" class="button">Browse Products</a>
      </div>
    `;

    checkoutButton.disabled = true;
    clearCartButton.disabled = true;

    updateSubtotal(cart);
    return;
  }

  checkoutButton.disabled = false;
  clearCartButton.disabled = false;

  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-item">
          <img
            src="${item.imageUrl || "images/placeholder.jpg"}"
            alt="${escapeHtml(item.name)}"
            class="cart-item-image"
          >

          <div class="cart-item-details">
            <h2>${escapeHtml(item.name)}</h2>

            <p class="cart-item-price">
              $${Number(item.price).toFixed(2)} each
            </p>
          </div>

          <div class="cart-item-controls">
            <label for="quantity-${item.productId}">
              Quantity
            </label>

            <input
              id="quantity-${item.productId}"
              type="number"
              min="1"
              value="${item.quantity}"
              data-product-id="${item.productId}"
              class="cart-quantity-input"
            >

            <button
              type="button"
              class="remove-cart-item"
              data-product-id="${item.productId}"
            >
              Remove
            </button>
          </div>

          <p class="cart-item-total">
            $${(Number(item.price) * Number(item.quantity)).toFixed(2)}
          </p>
        </article>
      `
    )
    .join("");

  addCartEventListeners();
  updateSubtotal(cart);
}

function addCartEventListeners() {
  document.querySelectorAll(".cart-quantity-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      const productId = Number(event.target.dataset.productId);
      const quantity = Number(event.target.value);

      updateCartQuantity(productId, quantity);
    });
  });

  document.querySelectorAll(".remove-cart-item").forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = Number(event.target.dataset.productId);

      removeCartItem(productId);
    });
  });
}

function updateCartQuantity(productId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    displayCart();
    return;
  }

  const cart = getCart();

  const item = cart.find(
    (cartItem) => Number(cartItem.productId) === productId
  );

  if (!item) {
    return;
  }

  item.quantity = quantity;

  saveCart(cart);
  displayCart();
}

function removeCartItem(productId) {
  const cart = getCart().filter(
    (item) => Number(item.productId) !== productId
  );

  saveCart(cart);
  displayCart();
}

function clearCart() {
  const confirmed = window.confirm(
    "Are you sure you want to remove every item from your cart?"
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(CART_STORAGE_KEY);
  displayCart();
}

function updateSubtotal(cart) {
  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  document.getElementById("cart-subtotal").textContent =
    `$${subtotal.toFixed(2)}`;
}

function goToCheckout() {
  const cart = getCart();

  if (cart.length === 0) {
    return;
  }

  window.location.href = "checkout.html";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}