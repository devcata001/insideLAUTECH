let cart = []
if (localStorage.insidelautech_cart) {
    cart = JSON.parse(localStorage.getItem('insidelautech_cart'))
}

const updateCartCount = () => {
    const cartCount = document.getElementById('cartCount')
    if (cartCount) {
        let total = 0
        for (let i = 0; i < cart.length; i++) {
            total = total + cart[i].quantity
        }
        cartCount.textContent = total
    }
}

const addToCart = (product) => {
    const user = checkSession()
    if (!user) {
        alert('Please login or sign up to add items to cart!')
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = 'login.html'
        } else {
            window.location.href = 'pages/login.html'
        }
        return
    }

    let found = false
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === product.id) {
            cart[i].quantity = cart[i].quantity + 1
            found = true
            break
        }
    }

    if (!found) {
        const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: 1
        }
        cart.push(newItem)
    }

    localStorage.setItem('insidelautech_cart', JSON.stringify(cart))
    updateCartCount()
    alert('Added to cart!')
}

const removeFromCart = (productId) => {
    let newCart = []
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id !== productId) {
            newCart.push(cart[i])
        }
    }
    cart = newCart
    localStorage.setItem('insidelautech_cart', JSON.stringify(cart))
    updateCartCount()
}

const updateQuantity = (productId, newQuantity) => {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) {
            if (newQuantity <= 0) {
                removeFromCart(productId)
            } else {
                cart[i].quantity = newQuantity
                localStorage.setItem('insidelautech_cart', JSON.stringify(cart))
            }
            break
        }
    }
}

const getCartTotal = () => {
    let total = 0
    for (let i = 0; i < cart.length; i++) {
        total = total + (cart[i].price * cart[i].quantity)
    }
    return total
}

const checkSession = () => {
    const session = localStorage.getItem('insidelautech_session')
    if (session) {
        const user = JSON.parse(session)
        if (user.loggedIn) {
            return user
        }
    }
    return null
}

const logout = () => {
    localStorage.removeItem('insidelautech_session')
    window.location.href = '../index.html'
}

const updateNav = () => {
    const user = checkSession()
    const loginLink = document.getElementById('loginLink')
    const signupLink = document.getElementById('signupLink')

    if (user && loginLink && signupLink) {
        loginLink.innerHTML = '<i class="bi bi-person-circle"></i> Dashboard'
        if (window.location.pathname.includes('/pages/')) {
            loginLink.href = 'dashboard.html'
        } else {
            loginLink.href = 'pages/dashboard.html'
        }
        signupLink.innerHTML = 'Logout'
        signupLink.href = '#'
        signupLink.onclick = (e) => {
            e.preventDefault()
            logout()
        }
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount()
    updateNav()
})
