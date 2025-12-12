// main.js - cart logic, session management, shared functionality

// cart management
let cart = []
if (localStorage.insidelautech_cart) {
    cart = JSON.parse(localStorage.getItem('insidelautech_cart'))
} else {
    cart = []
}

const updateCartCount = () => {
    const cartCount = document.getElementById('cartCount')
    if (cartCount) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0)
        cartCount.textContent = total
    }
}

const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
        existing.quantity += 1
    } else {
        cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem('insidelautech_cart', JSON.stringify(cart))
    updateCartCount()
    alert('Added to cart!')
}

const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId)
    localStorage.setItem('insidelautech_cart', JSON.stringify(cart))
    updateCartCount()
}

const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(item => item.id === productId)
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId)
        } else {
            item.quantity = newQuantity
            localStorage.setItem('insidelautech_cart', JSON.stringify(cart))
        }
    }
}

const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

// session management
const checkSession = () => {
    const session = localStorage.getItem('insidelautech_session')
    if (session) {
        try {
            const user = JSON.parse(session)
            return user.loggedIn ? user : null
        } catch (err) {
            return null
        }
    }
    return null
}

const logout = () => {
    localStorage.removeItem('insidelautech_session')
    window.location.href = '../index.html'
}

// update nav based on session
const updateNav = () => {
    const user = checkSession()
    const loginLink = document.getElementById('loginLink')
    const signupLink = document.getElementById('signupLink')

    if (user && loginLink && signupLink) {
        loginLink.innerHTML = '<i class="bi bi-person-circle"></i> Dashboard'
        loginLink.href = 'dashboard.html'
        signupLink.innerHTML = 'Logout'
        signupLink.href = '#'
        signupLink.onclick = (e) => {
            e.preventDefault()
            logout()
        }
    }
}

// sample products data
const products = [
    { id: 1, name: 'Calculus Textbook', category: 'textbooks', price: 3500, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', rating: 4.5, description: 'Engineering Mathematics by K.A. Stroud' },
    { id: 2, name: 'HP Laptop', category: 'electronics', price: 185000, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', rating: 4.8, description: 'HP Pavilion 15, 8GB RAM, 256GB SSD' },
    { id: 3, name: 'Scientific Calculator', category: 'electronics', price: 12000, image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400', rating: 4.3, description: 'Casio FX-991EX ClassWiz' },
    { id: 4, name: 'LAUTECH Hoodie', category: 'fashion', price: 8500, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', rating: 4.6, description: 'Official LAUTECH branded hoodie' },
    { id: 5, name: 'Backpack', category: 'fashion', price: 6500, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', rating: 4.2, description: 'Durable laptop backpack with multiple compartments' },
    { id: 6, name: 'Organic Chemistry', category: 'textbooks', price: 4200, image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400', rating: 4.7, description: 'Organic Chemistry by Morrison & Boyd' },
    { id: 7, name: 'Wireless Mouse', category: 'electronics', price: 3500, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', rating: 4.4, description: 'Logitech wireless optical mouse' },
    { id: 8, name: 'USB Flash Drive 32GB', category: 'electronics', price: 2800, image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400', rating: 4.1, description: 'Sandisk 32GB USB 3.0' },
    { id: 9, name: 'Note Taking Bundle', category: 'stationery', price: 2500, image: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=400', rating: 4.5, description: '5 notebooks + pens set' },
    { id: 10, name: 'Campus Sneakers', category: 'fashion', price: 15000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', rating: 4.6, description: 'Comfortable walking sneakers' },
    { id: 11, name: 'Physics Textbook', category: 'textbooks', price: 3800, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', rating: 4.4, description: 'University Physics by Young & Freedman' },
    { id: 12, name: 'Earphones', category: 'electronics', price: 4500, image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400', rating: 4.3, description: 'JBL wired earphones with mic' }
]

// init
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount()
    updateNav()
})
