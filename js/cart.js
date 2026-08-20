let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartItemsContainer = document.getElementById('cartItems');

const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total')

const checkoutButton = document.querySelector('.checkout-btn');

const shipping = 5;

document.getElementById("shipping").textContent = `$${shipping.toFixed(2)}`;

function renderCart() {

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        checkoutButton.disabled = true;
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-bag-shopping"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything yet</p>
            </div>`;

        updateSummary();
        return

    }
    checkoutButton.disabled = false;
    const fragment = document.createDocumentFragment();
    cart.forEach(product => {
        const item = document.createElement('div');
        item.className = 'cart-item';

        item.innerHTML = `<img src="${product.thumbnail || 'default.jpg'}"
            alt="${product.title}"
            class="cart-item-image">
        <div class="cart-item-info">
            <div class="cart-item-title">
                ${product.title}
            </div>
            <div class="cart-item-price">
                $${product.price.toFixed(2)}
            </div>

        </div>

        <div class="quantity-control">

            <button class="quantity-btn ${product.quantity === 1 ? 'disabled' : ''} minus">
                <i class="fa-solid fa-minus"></i>
            </button>
            <span class="quantity-value">
                ${product.quantity}
            </span>
            <button class="quantity-btn plus">
                <i class="fa-solid fa-plus"></i>
            </button>

        </div>
        <button class="remove-btn" aria-label="Remove product">
            <i class="fa-regular fa-trash-can"></i>
        </button>
            `

        item.querySelector('.plus').addEventListener('click', () => {
            changeQuantity(product.id, 1);
        });

        item.querySelector('.minus').addEventListener('click', () => {
            changeQuantity(product.id, -1);
        });

        item.querySelector('.remove-btn').addEventListener('click', () => {
            removeFromCart(product.id);
        });

        fragment.appendChild(item)
    });

    cartItemsContainer.appendChild(fragment)
    updateSummary();


}
function changeQuantity(productId, change) {

    const product = cart.find(p => p.id === productId);

    if (!product) return;
    product.quantity = Math.max(1, product.quantity + change);

    saveCart();
    renderCart()

}


function removeFromCart(productId) {

    cart = cart.filter(p => p.id !== productId);

    saveCart();
    renderCart();

}

function saveCart() {

    localStorage.setItem('cart', JSON.stringify(cart))

}

function updateSummary() {

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;

    const total = cart.length > 0 ? subtotal + shipping : 0

    totalElement.textContent = `$${total.toFixed(2)}`

}

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});
window.addEventListener("pageshow", () => {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    renderCart();
});