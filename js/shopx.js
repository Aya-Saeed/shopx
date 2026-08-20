const container = document.getElementById("products");
const searchInput = document.getElementById("searchInput");

const sortDefault = document.getElementById("sortDefault");
const sortAsc = document.getElementById("sortAsc");
const sortDesc = document.getElementById("sortDesc");

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const pagination = document.getElementById("pagination");

const badge = document.getElementById('cartCount');

let allProducts = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

let currentPage = 1;
const limit = 10;

let currentSearch = "";
let currentSort = "";

async function fetchAllProducts() {
    showSkeletons();

    try {
        const res = await fetch(`https://dummyjson.com/products?limit=100`);

        if (!res.ok) {
            throw new Error("Failed to load products");
        }

        const data = await res.json();

        allProducts = data.products;

        updateUI();

    } catch (error) {
        container.innerHTML = `
    <div class="empty-state">
        <h4>Something went wrong</h4>
        <p>We couldn't load the products. Please try again.</p>
        <button class="btn btn-dark" onclick="fetchAllProducts()">
            Try Again
        </button>
    </div>
`
    }
}

function renderProducts() {
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    const productsToShow = filteredProducts.slice(start, end);

    if (!productsToShow.length) {
        container.innerHTML = ` <div class="empty-state">
        <h4>No products found</h4>
        <p>Try a different search or clear your filters.</p>
    </div>`;
        return;
    }

    container.innerHTML = productsToShow
        .map((product) => `
            <div class="card h-100 shadow-sm">

                <img 
                    src="${product.thumbnail}" 
                    alt="${product.title}" 
                    class="card-img-top"
                >

                <div class="card-body d-flex flex-column">

                    <h6 class="card-title">
                        ${highlight(product.title, currentSearch)}
                    </h6>

                    <div class="accent-line"></div>

                    <p class="product-description">
                        ${product.description}
                    </p>

                    <p class="product-price">
                        price: <span class="text-success">$${product.price}</span>
                    </p>

                    <button 
                        class="btn btn-dark mt-auto" 
                        onclick="addToCart(${product.id})"
                    >
                        Add to Cart
                    </button>

                </div>

            </div>
        `)
        .join("");
}
function updateUI() {
    let data = [...allProducts];

    if (currentSearch) {
        data = data.filter((p) =>
            p.title.toLowerCase().includes(currentSearch),
        );
    }

    if (currentSort === "asc") {
        data = data.sort((a, b) => a.price - b.price);
    } else if (currentSort === "desc") {
        data = data.sort((a, b) => b.price - a.price);
    }

    filteredProducts = data;

    renderProducts();
    renderPagination();
}
let debounceTimer;

searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        currentSearch = e.target.value.toLowerCase();

        currentPage = 1;
        updateUI();
    }, 300);
});

sortDefault.addEventListener("click", () => {
    currentSort = "";
    currentPage = 1;
    updateUI();
});

sortAsc.addEventListener("click", () => {
    currentSort = "asc";
    currentPage = 1;
    updateUI();
});

sortDesc.addEventListener("click", () => {
    currentSort = "desc";
    currentPage = 1;
    updateUI();
});

nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredProducts.length / limit);

    if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
        renderPagination();
    }
});

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
        renderPagination();
    }
});

function renderPagination() {
    const paginationWrapper = document.querySelector(".pagination-wrapper");
    const totalPages = Math.ceil(filteredProducts.length / limit);

    // Hide pagination if there are no products
    if (filteredProducts.length === 0 || totalPages <= 1) {
        paginationWrapper.classList.remove("show");
        pagination.innerHTML = "";
        return;
    }

    // Show pagination when products exist
    paginationWrapper.classList.add("show");

    let buttons = "";

    // Previous button
    prevBtn.disabled = currentPage === 1;

    // First page
    buttons += `
        <button class="page-btn ${currentPage === 1 ? "active" : ""}" 
            onclick="goToPage(1)">
            1
        </button>
    `;

    // Pages
    if (totalPages <= 5) {
        for (let i = 2; i <= totalPages; i++) {
            buttons += `
                <button class="page-btn ${i === currentPage ? "active" : ""}" 
                    onclick="goToPage(${i})">
                    ${i}
                </button>
            `;
        }
    } else {
        if (currentPage <= 3) {
            buttons += `
                <button class="page-btn ${currentPage === 2 ? "active" : ""}" onclick="goToPage(2)">2</button>
                <button class="page-btn ${currentPage === 3 ? "active" : ""}" onclick="goToPage(3)">3</button>
                <span class="pagination-dots">...</span>
            `;

            buttons += `
                <button class="page-btn" onclick="goToPage(${totalPages})">
                    ${totalPages}
                </button>
            `;
        } else if (currentPage >= totalPages - 2) {
            buttons += `
                <span class="pagination-dots">...</span>
            `;

            for (let i = totalPages - 2; i <= totalPages; i++) {
                buttons += `
                    <button class="page-btn ${i === currentPage ? "active" : ""}" 
                        onclick="goToPage(${i})">
                        ${i}
                    </button>
                `;
            }
        } else {
            buttons += `
                <span class="pagination-dots">...</span>

                <button class="page-btn active">
                    ${currentPage}
                </button>

                <span class="pagination-dots">...</span>

                <button class="page-btn" onclick="goToPage(${totalPages})">
                    ${totalPages}
                </button>
            `;
        }
    }

    pagination.innerHTML = buttons;

    // Next button
    nextBtn.disabled = currentPage === totalPages;
}

function goToPage(page) {
    currentPage = page;
    renderProducts();
    renderPagination();
}


const buttons = document.querySelectorAll(".btn-group button");
buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

function highlight(text, search) {
    if (!search) return text;

    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return text.replace(
        new RegExp(safeSearch, "gi"),
        (match) => `<span class="highlight">${match}</span>`,
    );
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);

    if (!product) return;

    const existingProduct = cart.find(p => p.id === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}
function updateCartCount() {

    cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cartTotal = cart.reduce((acc, item) => acc + item.quantity, 0);

    badge.textContent = cartTotal > 50 ? "50+" : cartTotal;
    if (cartTotal === 0) {
        badge.style.display = "none";
    } else {
        badge.style.display = "inline-block";
    }

}


function showSkeletons(count = limit) {
    container.innerHTML = Array.from({ length: count }, () => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-desc"></div>
            <div class="skeleton skeleton-price"></div>
            <div class="skeleton skeleton-btn"></div>
        </div>
    `).join("");
}

fetchAllProducts();
updateCartCount();
window.addEventListener("pageshow", () => {
    updateCartCount();
});