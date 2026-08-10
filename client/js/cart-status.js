document.addEventListener("DOMContentLoaded", updateCartStatus);

function updateCartStatus() {
    const cartLink = document.querySelector(
        ".icons a[href='cart.html']"
    );

    if (!cartLink) {
        return;
    }

    const cart = getCart();

    const totalQuantity = cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    cartLink.innerHTML = `
        <i
            class="fa-solid fa-cart-shopping"
            aria-hidden="true"
        ></i>

        ${
            totalQuantity > 0
                ? `<span class="cart-count">${totalQuantity}</span>`
                : ""
        }
    `;

    cartLink.setAttribute(
        "aria-label",
        `Shopping cart with ${totalQuantity} item${totalQuantity === 1 ? "" : "s"}`
    );
}

function getCart() {
    try {
        return JSON.parse(
            localStorage.getItem("grandSlamCart")
        ) || [];
    } catch (error) {
        console.error("Unable to read shopping cart:", error);
        return [];
    }
}