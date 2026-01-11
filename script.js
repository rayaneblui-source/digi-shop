// Shop Application JavaScript
let currentUser = null;
let products = [
    { id: 1, code: "PROD-0001", name: "Laptop", price: 999, image: "https://via.placeholder.com/250?text=Laptop", desc: "High performance laptop", sellerContact: "https://wa.me/12345678901" },
    { id: 2, code: "PROD-0002", name: "Phone", price: 599, image: "https://via.placeholder.com/250?text=Phone", desc: "Latest smartphone", sellerContact: "https://wa.me/12345678902" },
    { id: 3, code: "PROD-0003", name: "Headphones", price: 199, image: "https://via.placeholder.com/250?text=Headphones", desc: "Wireless headphones", sellerContact: "https://wa.me/12345678903" }
];
let cart = [];
let nextProductCode = 4; // Start from 0004 for new products

// Generate next product code
function generateProductCode() {
    const code = `PROD-${nextProductCode.toString().padStart(4, '0')}`;
    nextProductCode++;
    return code;
}

// Authentication Functions
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (email === 'admin@shop.com' && password === 'admin123') {
        currentUser = { email, role: 'admin' };
        updateUI();
        closeModal('loginModal');
        alert('Admin login successful!');
    } else if (email && password) {
        currentUser = { email, role: 'user' };
        updateUI();
        closeModal('loginModal');
        alert('User login successful!');
    } else {
        alert('Please enter email and password');
    }
}

function register() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    if (name && email) {
        currentUser = { email, name, role: 'user' };
        updateUI();
        closeModal('registerModal');
    }
}

function logout() {
    currentUser = null;
    updateUI();
}

// Product Management Functions
function addProduct() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const imageFile = document.getElementById('productImage').files[0];
    const desc = document.getElementById('productDesc').value;
    const sellerContact = document.getElementById('sellerContact').value;

    if (!name || !price || !imageFile || !sellerContact) {
        alert('Please fill all fields including uploading an image and seller contact link');
        return;
    }

    // Check if file is an image
    if (!imageFile.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }

    // Check file size (limit to 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB');
        return;
    }

    // Basic URL validation for seller contact
    try {
        new URL(sellerContact);
    } catch {
        alert('Please enter a valid contact link (e.g., https://wa.me/1234567890)');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageDataUrl = e.target.result;
        const productCode = generateProductCode();
        products.push({
            id: Date.now(),
            code: productCode,
            name,
            price,
            image: imageDataUrl,
            desc,
            sellerContact
        });
        displayProducts();
        closeModal('addProductModal');

        // Clear form
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productImage').value = '';
        document.getElementById('productDesc').value = '';
        document.getElementById('sellerContact').value = '';

        alert(`Product added successfully! Product Code: ${productCode}`);
    };

    reader.readAsDataURL(imageFile);
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    displayProducts();
}

// Shopping Cart Functions
function addToCart(id) {
    const product = products.find(p => p.id === id);
    cart.push(product);
    updateCartCount();
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

function openCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = cart.map((item, idx) => `
        <div style="border-bottom: 1px solid #ddd; padding: 0.5rem 0;">
            <p><strong>${item.name}</strong> (${item.code}) - $${item.price}</p>
            <button onclick="removeFromCart(${idx})" class="btn-danger btn-small">Remove</button>
        </div>
    `).join('');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
    document.getElementById('cartModal').classList.add('show');
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    updateCartCount();
    openCart();
}

function checkout() {
    if (cart.length === 0) return alert('Cart is empty');

    // Get unique seller contacts from cart items
    const sellerContacts = [...new Set(cart.map(item => item.sellerContact))];

    if (sellerContacts.length === 1) {
        const sellerLink = sellerContacts[0];
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const itemsList = cart.map(item => `${item.name} (${item.code}) - $${item.price}`).join('\n');

        // Open seller contact link in new tab
        window.open(sellerLink, '_blank');

        alert(`Order summary:\n\n${itemsList}\n\nTotal: $${total.toFixed(2)}\n\nSeller contact link opened in new tab. Please contact them to arrange delivery.`);
    } else {
        // Multiple sellers - show message to contact individually
        alert(`Your cart has items from ${sellerContacts.length} different sellers. Please contact them individually using the "Contact Seller" links on each product.`);
        return;
    }

    cart = [];
    updateCartCount();
    closeModal('cartModal');
}

// UI Functions
function displayProducts() {
    const productsDiv = document.getElementById('products');
    productsDiv.innerHTML = products.map(p => `
        <div class="product">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p class="product-code">Code: ${p.code}</p>
            <p>${p.desc}</p>
            <div class="price">$${p.price}</div>
            <a href="${p.sellerContact}" target="_blank" class="contact-link">📞 Contact Seller</a>
            <button onclick="addToCart(${p.id})">Add to Cart</button>
            ${currentUser?.role === 'admin' ? `<div class="admin-btns" style="margin-top: 0.5rem;"><button onclick="deleteProduct(${p.id})" class="btn-danger">Delete</button></div>` : ''}
        </div>
    `).join('');
}

function updateUI() {
    document.getElementById('userDisplay').textContent = currentUser ? currentUser.email : 'Guest';
    document.getElementById('adminBtn').style.display = currentUser?.role === 'admin' ? 'block' : 'none';
    document.getElementById('logoutBtn').style.display = currentUser ? 'block' : 'none';
    displayProducts();
}

// Modal Functions
function openLoginModal() { document.getElementById('loginModal').classList.add('show'); }
function openRegisterModal() { document.getElementById('registerModal').classList.add('show'); }
function openAddProductModal() { document.getElementById('addProductModal').classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

// Event Listeners
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) e.target.classList.remove('show');
};

// Initialize the application
updateUI();