const PRODUCT_API_URL = "http://localhost:5001/api/products";

document.addEventListener("DOMContentLoaded", loadProductDetails);

async function loadProductDetails() {
  const productDetails = document.getElementById("product-details");
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId || !/^\d+$/.test(productId)) {
    showError("A valid product was not selected.");
    return;
  }

  try {
    const response = await fetch(`${PRODUCT_API_URL}/${productId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Product not found.");
      }

      throw new Error("Unable to load the product.");
    }

    const product = await response.json();

    document.title = `${product.name} | Grand Slam Gear`;

    productDetails.innerHTML = `
      <div class="product-details-image">
        <img
          src="${product.image_url || "images/placeholder.jpg"}"
          alt="${escapeHtml(product.name)}"
        >
      </div>

      <div class="product-details-content">
        <p class="product-category">
          ${escapeHtml(product.category)}
        </p>

        <h1>${escapeHtml(product.name)}</h1>

        <p class="product-details-description">
          ${escapeHtml(product.description || "No description available.")}
        </p>

        <p class="product-details-price">
          $${Number(product.price).toFixed(2)}
        </p>

        <p class="product-details-stock">
          ${getStockMessage(product.stock_quantity)}
        </p>

        <div class="quantity-control">
          <label for="quantity">Quantity</label>

          <input
            id="quantity"
            type="number"
            min="1"
            max="${Number(product.stock_quantity)}"
            value="1"
            ${Number(product.stock_quantity) <= 0 ? "disabled" : ""}
          >
        </div>

        <button
          id="add-to-cart-button"
          class="button"
          type="button"
          ${Number(product.stock_quantity) <= 0 ? "disabled" : ""}
        >
          Add to Cart
        </button>

        <p id="cart-message" aria-live="polite"></p>
      </div>
    `;

    productDetails.setAttribute("aria-busy", "false");

    const addToCartButton = document.getElementById("add-to-cart-button");

    if (addToCartButton) {
      addToCartButton.addEventListener("click", () => {
        const quantity = Number(
          document.getElementById("quantity").value
        );

        addProductToCart(product, quantity);
      });
    }
  } catch (error) {
    showError(error.message);
  }
}

function addProductToCart(product, quantity) {
  const cartMessage = document.getElementById("cart-message");

  if (!Number.isInteger(quantity) || quantity < 1) {
    cartMessage.textContent = "Please enter a valid quantity.";
    return;
  }

  if (quantity > Number(product.stock_quantity)) {
    cartMessage.textContent = "That quantity is not available.";
    return;
  }

  const cart = JSON.parse(localStorage.getItem("grandSlamCart")) || [];

  const existingItem = cart.find(
    (item) => item.productId === product.id
  );

  if (existingItem) {
    const updatedQuantity = existingItem.quantity + quantity;

    if (updatedQuantity > Number(product.stock_quantity)) {
      cartMessage.textContent =
        "You cannot add more than the available stock.";
      return;
    }

    existingItem.quantity = updatedQuantity;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.image_url,
      quantity
    });
  }

  localStorage.setItem("grandSlamCart", JSON.stringify(cart));
  if (typeof updateCartStatus === "function") {
    updateCartStatus();
}

  cartMessage.textContent = `${product.name} was added to your cart.`;
}

function getStockMessage(stockQuantity) {
  const stock = Number(stockQuantity);

  if (stock <= 0) {
    return "Out of stock";
  }

  if (stock <= 5) {
    return `Only ${stock} remaining`;
  }

  return `${stock} in stock`;
}

function showError(message) {
  const productDetails = document.getElementById("product-details");

  productDetails.innerHTML = `
    <div class="product-error" role="alert">
      <h1>Product unavailable</h1>
      <p>${escapeHtml(message)}</p>
      <a href="index.html" class="button">Return Home</a>
    </div>
  `;

  productDetails.setAttribute("aria-busy", "false");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}