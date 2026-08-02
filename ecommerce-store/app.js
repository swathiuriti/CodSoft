const API = 'http://localhost:3000/api';
let activeCategory = 'All';
let cart = [];

async function fetchProducts() {
    const search = document.getElementById('search-input').value;
    const res = await fetch(`${API}/products?category=${activeCategory}&search=${encodeURIComponent(search)}`);
    const products = await res.json();

    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    products.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <div class="product-icon">${p.icon}</div>
                <h3>${p.name}</h3>
                <div class="price">$${p.price.toFixed(2)}</div>
                <button class="btn-add" onclick="addToCart(${p.id}, '${p.name}', ${p.price})">Add to Cart</button>
            </div>
        `;
    });
}

function filterCategory(btn, category) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = category;
    fetchProducts();
}

function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cart-count').innerText = count;

    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        container.innerHTML += `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <p>$${item.price} x ${item.qty}</p>
                </div>
                <strong>$${itemTotal.toFixed(2)}</strong>
            </div>
        `;
    });

    document.getElementById('cart-total').innerText = total.toFixed(2);
}

function toggleCart() {
    document.getElementById('cart-modal').classList.toggle('hidden');
}

function openCheckout() {
    if (cart.length === 0) return alert('Cart is empty!');
    toggleCart();
    document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckout() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

async function handlePayment(e) {
    e.preventDefault();
    const totalAmount = parseFloat(document.getElementById('cart-total').innerText);

    const res = await fetch(`${API}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, totalAmount })
    });

    const data = await res.json();
    alert(`Order Confirmed! Order ID: ${data.order.orderId}`);

    cart = [];
    updateCartUI();
    closeCheckout();
}

fetchProducts();