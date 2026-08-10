const API_URL = "http://localhost:5001/api/products";

async function loadProducts(category = null) {
  const productGrid = document.getElementById("product-grid");

  if (!productGrid) {
    return;
  }

  productGrid.innerHTML = "<p>Loading products...</p>";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to load products.");
    }

    const products = await response.json();

    const filteredProducts = category
      ? products.filter(
          (product) =>
            product.category.toLowerCase() === category.toLowerCase()
        )
      : products;

    displayProducts(filteredProducts);
  } catch (error) {
    console.error(error);

    productGrid.innerHTML = `
      <p role="alert">
        Products could not be loaded. Make sure the backend server is running.
      </p>
    `;
  }
}

function displayProducts(products) {
  const productGrid = document.getElementById("product-grid");

  if (products.length === 0) {
    productGrid.innerHTML = "<p>No products were found.</p>";
    return;
  }

  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <img
            src="${product.image_url || "images/placeholder.jpg"}"
            alt="${escapeHtml(product.name)}"
            class="product-image"
          >

          <div class="product-card-content">
            <p class="product-category">
              ${escapeHtml(product.category)}
            </p>

            <h2>${escapeHtml(product.name)}</h2>

            <p class="product-description">
              ${escapeHtml(product.description || "")}
            </p>

            <p class="product-price">
              $${Number(product.price).toFixed(2)}
            </p>

            <p class="product-stock">
              ${getStockMessage(product.stock_quantity)}
            </p>

            <a
              href="product.html?id=${product.id}"
              class="button"
              aria-label="View ${escapeHtml(product.name)}"
            >
              View Product
            </a>
          </div>
        </article>
      `
    )
    .join("");
}

function getStockMessage(stockQuantity) {
  const stock = Number(stockQuantity);

  if (stock <= 0) {
    return "Out of stock";
  }

  if (stock <= 5) {
    return `Only ${stock} remaining`;
  }

  return "In stock";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}