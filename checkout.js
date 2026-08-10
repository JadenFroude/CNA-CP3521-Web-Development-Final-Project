const ORDER_API_URL = "http://localhost:5001/api/orders";
const CART_KEY = "grandSlamCart";
const USER_KEY = "grandSlamUser";
const TOKEN_KEY = "grandSlamToken";

document.addEventListener("DOMContentLoaded", () => {
    displayCheckoutSummary();

    const checkoutForm = document.getElementById("checkout-form");

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", submitOrder);
    }
});

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
        console.error("Unable to read cart:", error);
        return [];
    }
}

function getLoggedInUser() {
    try {
        const savedUser = localStorage.getItem(USER_KEY);

        return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
        console.error("Unable to read logged-in user:", error);
        return null;
    }
}

function displayCheckoutSummary() {
    const cart = getCart();

    const itemsContainer =
        document.getElementById("checkout-items");

    const totalElement =
        document.getElementById("checkout-total");

    const submitButton =
        document.getElementById("submit-order-button");

    if (!itemsContainer || !totalElement || !submitButton) {
        return;
    }

    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <p>Your cart is empty.</p>

            <a
                href="bats.html"
                class="button"
            >
                Browse Products
            </a>
        `;

        totalElement.textContent = "$0.00";
        submitButton.disabled = true;

        return;
    }

    itemsContainer.innerHTML = cart
        .map(
            (item) => `
                <div class="checkout-item">

                    <span>
                        ${escapeHtml(item.name)}
                        × ${Number(item.quantity)}
                    </span>

                    <strong>
                        $${(
                            Number(item.price) *
                            Number(item.quantity)
                        ).toFixed(2)}
                    </strong>

                </div>
            `
        )
        .join("");

    const total = cart.reduce(
        (sum, item) =>
            sum +
            Number(item.price) *
            Number(item.quantity),
        0
    );

    totalElement.textContent =
        `$${total.toFixed(2)}`;

    submitButton.disabled = false;
}

async function submitOrder(event) {
    event.preventDefault();

    const cart = getCart();
    const user = getLoggedInUser();
    const token = localStorage.getItem(TOKEN_KEY);

    const message =
        document.getElementById("checkout-message");

    const submitButton =
        document.getElementById("submit-order-button");

    if (!message || !submitButton) {
        return;
    }

    // User must be logged in
    if (!user || !token) {
        message.textContent =
            "You must log in before submitting an order.";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

        return;
    }

    if (cart.length === 0) {
        message.textContent =
            "Your cart is empty.";

        return;
    }

    const formData =
        new FormData(event.target);

    const shippingAddress =
        String(
            formData.get("shippingAddress") || ""
        ).trim();

    const shippingCity =
        String(
            formData.get("shippingCity") || ""
        ).trim();

    const shippingProvince =
        String(
            formData.get("shippingProvince") || ""
        ).trim();

    const shippingPostalCode =
        String(
            formData.get("shippingPostalCode") || ""
        ).trim();

    if (
        !shippingAddress ||
        !shippingCity ||
        !shippingProvince ||
        !shippingPostalCode
    ) {
        message.textContent =
            "Please complete all shipping fields.";

        return;
    }

    const orderData = {
        userId: Number(user.id),

        shippingAddress,
        shippingCity,
        shippingProvince,
        shippingPostalCode,

        items: cart.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity)
        }))
    };

    submitButton.disabled = true;

    message.textContent =
        "Submitting your order...";

    try {
        const response = await fetch(
            ORDER_API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(orderData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Order submission failed."
            );
        }

        // Clear cart after successful purchase
        localStorage.removeItem(CART_KEY);

        // Update cart badge immediately
        if (typeof updateCartStatus === "function") {
            updateCartStatus();
        }

        const checkoutSection =
            document.querySelector(
                ".checkout-section"
            );

        if (!checkoutSection) {
            return;
        }

        /*
         * Switches the checkout section from the
         * normal two-column checkout layout to a
         * centered order-confirmation layout.
         */
        checkoutSection.classList.add(
            "order-complete"
        );

        checkoutSection.innerHTML = `
            <div class="order-confirmation-card">

                <div class="order-success-icon">

                    <i
                        class="fa-solid fa-check"
                        aria-hidden="true"
                    ></i>

                </div>

                <p class="order-success-label">
                    Order Confirmed
                </p>

                <h1>
                    Thank You,
                    ${escapeHtml(user.firstName)}!
                </h1>

                <p class="order-success-message">
                    Your order has been successfully submitted.
                </p>

                <div class="order-confirmation-details">

                    <div>

                        <span>
                            Order Number
                        </span>

                        <strong>
                            #${escapeHtml(result.orderId)}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Order Total
                        </span>

                        <strong>
                            $${Number(
                                result.totalAmount
                            ).toFixed(2)}
                        </strong>

                    </div>

                </div>

                <p class="order-confirmation-note">
                    You can view this order at any time
                    from your purchase history.
                </p>

                <div class="order-confirmation-actions">

                    <a
                        href="index.html"
                        class="secondary-button"
                    >
                        <i
                            class="fa-solid fa-bag-shopping"
                            aria-hidden="true"
                        ></i>

                        Continue Shopping
                    </a>

                    <a
                        href="orders.html"
                        class="secondary-button"
                    >
                        <i
                            class="fa-solid fa-clock-rotate-left"
                            aria-hidden="true"
                        ></i>

                        View Purchase History
                    </a>

                </div>

            </div>
        `;

    } catch (error) {
        console.error(
            "Checkout failed:",
            error
        );

        message.textContent =
            error.message ||
            "Unable to submit the order.";

        submitButton.disabled = false;
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