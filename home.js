const PRODUCTS_API_URL = "http://localhost:5001/api/products";

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");

  if (!searchForm || !searchInput) {
    console.error("Search form or search input was not found.");
    return;
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
      displayMessage("Enter a product name or category to search.");
      return;
    }

    const newUrl =
      `${window.location.pathname}?search=${encodeURIComponent(searchTerm)}`;

    window.history.pushState({}, "", newUrl);

    searchProducts(searchTerm);
  });

  loadHomepageProducts();
});

async function loadHomepageProducts() {
  const params = new URLSearchParams(window.location.search);
  const searchTerm = params.get("search");

  if (searchTerm) {
    document.getElementById("search-input").value = searchTerm;
    await searchProducts(searchTerm);
  } else {
    await loadFeaturedProducts();
  }
}

async function fetchProducts() {
  const response = await fetch(PRODUCTS_API_URL);

  if (!response.ok) {
    throw new Error(
      `Unable to load products. Server returned ${response.status}.`
    );
  }

  return response.json();
}

async function loadFeaturedProducts() {
  const productGrid = document.getElementById("product-grid");
  const heading = document.getElementById("featured-heading");

  if (!productGrid) {
    console.error('Element with id="product-grid" was not found.');
    return;
  }

  productGrid.innerHTML = "<p>Loading products...</p>";

  try {
    const products = await fetchProducts();

    if (heading) {
      heading.textContent = "Featured Products";
    }

    displayProducts(products.slice(0, 6));
  } catch (error) {
    console.error("Featured products failed:", error);

    displayMessage(
      "Products could not be loaded. Make sure the backend is running."
    );
  }
}

async function searchProducts(searchTerm) {
  const productGrid = document.getElementById("product-grid");
  const heading = document.getElementById("featured-heading");

  if (!productGrid) {
    console.error('Element with id="product-grid" was not found.');
    return;
  }

  productGrid.innerHTML = "<p>Searching products...</p>";

  try {
    const products = await fetchProducts();
    const normalizedSearch = searchTerm.toLowerCase();

    const matchingProducts = products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const description = String(product.description || "").toLowerCase();
      const category = String(product.category || "").toLowerCase();

      return (
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        category.includes(normalizedSearch)
      );
    });

    if (heading) {
      heading.textContent = `Search Results for "${searchTerm}"`;
    }

    displayProducts(matchingProducts);

    document.getElementById("featured")?.scrollIntoView({
      behavior: "smooth"
    });
  } catch (error) {
    console.error("Search failed:", error);

    displayMessage(
      "The search could not be completed. Make sure the backend is running."
    );
  }
}

function displayProducts(products) {
  const productGrid = document.getElementById("product-grid");

  if (!productGrid) {
    return;
  }

  if (!Array.isArray(products) || products.length === 0) {
    productGrid.innerHTML = `
      <p role="status">
        No products matched your search.
      </p>
    `;
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

            <h3>${escapeHtml(product.name)}</h3>

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
            >
              View Product
            </a>
          </div>
        </article>
      `
    )
    .join("");
}

function displayMessage(message) {
  const productGrid = document.getElementById("product-grid");

  if (productGrid) {
    productGrid.innerHTML = `
      <p role="alert">${escapeHtml(message)}</p>
    `;
  }
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