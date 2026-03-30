let cart = []
if (localStorage.insidelautech_cart) {
    cart = JSON.parse(localStorage.getItem('insidelautech_cart'))
}

const PAYSTACK_PUBLIC_KEY = localStorage.getItem('insidelautech_paystack_test_key') || 'pk_test_f56cc9f27a927af6dadbc4653123594a385a3624'

const ensureToastContainer = () => {
    let container = document.getElementById('toastContainer')
    if (!container) {
        container = document.createElement('div')
        container.id = 'toastContainer'
        container.className = 'toast-container-custom'
        document.body.appendChild(container)
    }
    return container
}

const showToast = (message, type = 'info') => {
    const container = ensureToastContainer()
    const toast = document.createElement('div')

    const typeClassMap = {
        success: 'toast-success',
        error: 'toast-error',
        warning: 'toast-warning',
        info: 'toast-info'
    }

    const toastTypeClass = typeClassMap[type] || typeClassMap.info
    toast.className = `toast-custom ${toastTypeClass}`
    toast.innerHTML = `
        <span>${message}</span>
        <button type="button" class="toast-close" aria-label="Close notification">&times;</button>
    `

    container.appendChild(toast)
    requestAnimationFrame(() => {
        toast.classList.add('show')
    })

    const removeToast = () => {
        toast.classList.remove('show')
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast)
            }
        }, 250)
    }

    const closeButton = toast.querySelector('.toast-close')
    if (closeButton) {
        closeButton.addEventListener('click', removeToast)
    }

    setTimeout(removeToast, 3000)
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
        showToast('Please login or sign up to add items to cart!', 'warning')
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
            description: product.description,
            quantity: 1
        }
        cart.push(newItem)
    }

    localStorage.setItem('insidelautech_cart', JSON.stringify(cart))
    updateCartCount()
    showToast(`${product.name} added to cart`, 'success')
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
    if (window.location.pathname.includes('/pages/')) {
        window.location.href = '../index.html'
    } else {
        window.location.href = 'index.html'
    }
}

const payWithPaystack = ({ amount, email, reference, metadata, onSuccess, onCancel }) => {
    if (!window.PaystackPop) {
        showToast('Paystack script is not loaded on this page.', 'error')
        return
    }

    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.includes('xxxxxxxx')) {
        showToast('Set your Paystack test public key before checkout.', 'warning')
        return
    }

    const amountInKobo = Math.round(Number(amount) * 100)
    if (!amountInKobo || amountInKobo <= 0) {
        showToast('Invalid payment amount.', 'error')
        return
    }

    const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: amountInKobo,
        currency: 'NGN',
        ref: reference || `INSIDE-${Date.now()}`,
        metadata: metadata || {},
        callback: (response) => {
            if (onSuccess) {
                onSuccess(response)
            }
        },
        onClose: () => {
            if (onCancel) {
                onCancel()
            }
        }
    })

    handler.openIframe()
}

const setPaystackTestKey = (publicKey) => {
    if (!publicKey || !publicKey.startsWith('pk_test_')) {
        showToast('Use a valid Paystack test public key (pk_test_...)', 'warning')
        return
    }
    localStorage.setItem('insidelautech_paystack_test_key', publicKey)
    showToast('Paystack test key saved. Refresh to use it.', 'success')
}

const updateNav = () => {
    const user = checkSession()
    const loginLink = document.getElementById('loginLink')
    const signupLink = document.getElementById('signupLink')
    const cartLink = document.getElementById('cartNavLink')
    const productsCtaLink = document.getElementById('productsCtaLink')
    const productsNavLinks = document.querySelectorAll('.navbar-nav .nav-link[href]')

    const setNavVisibility = (element, isVisible) => {
        if (!element) {
            return
        }
        const target = element.closest('.nav-item') || element
        target.style.display = isVisible ? '' : 'none'
    }

    const loginHref = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html'
    const signupHref = window.location.pathname.includes('/pages/') ? 'signup.html' : 'pages/signup.html'
    const dashboardHref = window.location.pathname.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html'

    if (cartLink) {
        setNavVisibility(cartLink, !!user)
    }

    if (productsNavLinks.length) {
        productsNavLinks.forEach(link => {
            const href = link.getAttribute('href') || ''
            if (href.includes('products.html')) {
                setNavVisibility(link, !!user)
            }
        })
    }

    if (productsCtaLink) {
        if (user) {
            productsCtaLink.href = 'pages/products.html'
            productsCtaLink.textContent = 'View All Products'
        } else {
            productsCtaLink.href = 'pages/signup.html'
            productsCtaLink.textContent = 'Sign Up to View Products'
        }
    }

    if (user) {
        if (loginLink) {
            loginLink.innerHTML = '<i class="bi bi-person-circle"></i> Dashboard'
            loginLink.href = dashboardHref
        }

        if (signupLink) {
            signupLink.innerHTML = 'Logout'
            signupLink.href = '#'
            signupLink.onclick = (e) => {
                e.preventDefault()
                logout()
            }
        }
    } else {
        if (loginLink) {
            loginLink.textContent = 'Login'
            loginLink.href = loginHref
        }

        if (signupLink) {
            signupLink.textContent = 'Sign Up'
            signupLink.href = signupHref
            signupLink.onclick = null
        }
    }
}

const highlightCurrentNavLink = () => {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href]')
    if (!navLinks.length) {
        return
    }

    const currentPath = window.location.pathname.split('/').pop() || 'index.html'

    navLinks.forEach(link => {
        const href = link.getAttribute('href') || ''
        const normalizedHref = href.split('?')[0].split('#')[0]
        const targetPath = normalizedHref.split('/').pop()

        if (!targetPath) {
            return
        }

        const shouldBeActive = targetPath === currentPath ||
            (currentPath === 'index.html' && (targetPath === 'index.html' || targetPath === ''))

        if (shouldBeActive) {
            link.classList.add('active')
            link.setAttribute('aria-current', 'page')
        }
    })
}

const setupNavbarBehavior = () => {
    const navbar = document.querySelector('.navbar')
    if (!navbar) {
        return
    }

    const handleNavbarScroll = () => {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled')
        } else {
            navbar.classList.remove('scrolled')
        }
    }

    handleNavbarScroll()
    window.addEventListener('scroll', handleNavbarScroll)

    const navLinks = document.querySelectorAll('.navbar-nav .nav-link')
    const navbarToggler = document.querySelector('.navbar-toggler')
    const navbarCollapse = document.querySelector('.navbar-collapse')

    if (navbarToggler && navbarCollapse && navLinks.length) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click()
                }
            })
        })
    }
}

const products = [
    { id: 1, name: 'Advanced Engineering Mathematics Handbook', category: 'textbooks', price: 12500, image: 'https://source.unsplash.com/700x500/?engineering,math,textbook&sig=101', rating: 4.8, description: 'Comprehensive guide covering calculus, differential equations, and numerical methods.' },
    { id: 2, name: 'Applied Thermodynamics for Mechanical Students', category: 'textbooks', price: 9800, image: 'https://source.unsplash.com/700x500/?thermodynamics,textbook,mechanical&sig=102', rating: 4.6, description: 'Updated edition with worked examples tailored to Nigerian university curriculum.' },
    { id: 3, name: 'Organic Chemistry Reaction Atlas', category: 'textbooks', price: 11200, image: 'https://source.unsplash.com/700x500/?organic,chemistry,book&sig=103', rating: 4.7, description: 'Reaction pathways, mechanisms, and practice questions for mid-semester prep.' },
    { id: 4, name: 'Medical Physiology Fundamentals', category: 'textbooks', price: 13500, image: 'https://source.unsplash.com/700x500/?medical,physiology,textbook&sig=104', rating: 4.7, description: 'Clear diagrams and chapter summaries for pre-clinical health science students.' },
    { id: 5, name: 'Digital Systems and Microprocessors', category: 'textbooks', price: 10900, image: 'https://source.unsplash.com/700x500/?microprocessor,electronics,book&sig=105', rating: 4.5, description: 'Circuit logic, assembly basics, and practical design tips for EE students.' },
    { id: 6, name: 'Structural Analysis Problem Workbook', category: 'textbooks', price: 8700, image: 'https://source.unsplash.com/700x500/?civil,engineering,textbook&sig=106', rating: 4.4, description: 'Step-by-step solved problems for trusses, beams, and frame analysis.' },
    { id: 7, name: 'Biochemistry Illustrated Revision Text', category: 'textbooks', price: 9400, image: 'https://source.unsplash.com/700x500/?biochemistry,textbook,science&sig=107', rating: 4.5, description: 'Color charts and quick revision maps for metabolism and molecular biology.' },
    { id: 8, name: 'Entrepreneurship and Innovation for Undergraduates', category: 'textbooks', price: 6500, image: 'https://source.unsplash.com/700x500/?entrepreneurship,book,startup&sig=108', rating: 4.3, description: 'Campus-relevant startup case studies, business models, and funding basics.' },

    { id: 9, name: 'Infinix Note 40 256GB Smartphone', category: 'electronics', price: 298000, image: 'https://source.unsplash.com/700x500/?smartphone,android,mobile&sig=109', rating: 4.7, description: 'Large battery smartphone with AMOLED display and smooth multitasking performance.' },
    { id: 10, name: 'Samsung Galaxy A55 5G 128GB', category: 'electronics', price: 465000, image: 'https://source.unsplash.com/700x500/?phone,5g,handset&sig=110', rating: 4.8, description: 'Reliable 5G phone with flagship-grade camera for students and creators.' },
    { id: 11, name: 'Redmi Note 13 Pro 256GB', category: 'electronics', price: 378000, image: 'https://source.unsplash.com/700x500/?mobile,smartphone,camera&sig=111', rating: 4.6, description: 'High-resolution camera, fast charging, and strong day-long battery life.' },
    { id: 12, name: 'TECNO Camon 30 256GB', category: 'electronics', price: 312000, image: 'https://source.unsplash.com/700x500/?smartphone,screen,gadget&sig=112', rating: 4.5, description: 'Balanced performance smartphone with bright screen and social-ready camera.' },
    { id: 13, name: 'Oraimo 30000mAh Power Bank', category: 'electronics', price: 32500, image: 'https://source.unsplash.com/700x500/?powerbank,charging,battery&sig=113', rating: 4.7, description: 'High-capacity power bank with dual USB output and smart charge protection.' },
    { id: 14, name: 'Anker 20000mAh 22.5W Fast Charge Bank', category: 'electronics', price: 48500, image: 'https://source.unsplash.com/700x500/?portable,charger,powerbank&sig=114', rating: 4.8, description: 'Premium fast-charging power bank built for phones, tablets, and accessories.' },
    { id: 15, name: 'HP EliteBook 840 G7 Laptop', category: 'electronics', price: 635000, image: 'https://source.unsplash.com/700x500/?laptop,notebook,computer&sig=115', rating: 4.8, description: 'Core i5 business laptop with SSD storage ideal for coding and research.' },
    { id: 16, name: 'Lenovo IdeaPad Slim 3 15"', category: 'electronics', price: 558000, image: 'https://source.unsplash.com/700x500/?laptop,workspace,technology&sig=116', rating: 4.6, description: 'Portable laptop for assignments, presentations, and online classes.' },
    { id: 17, name: 'Dell Wireless Ergonomic Mouse', category: 'electronics', price: 14500, image: 'https://source.unsplash.com/700x500/?computer,mouse,desk&sig=117', rating: 4.4, description: 'Comfort-focused silent-click mouse with stable connection and long battery life.' },
    { id: 18, name: 'Logitech K380 Multi-Device Keyboard', category: 'electronics', price: 39500, image: 'https://source.unsplash.com/700x500/?keyboard,desk,bluetooth&sig=118', rating: 4.7, description: 'Compact Bluetooth keyboard that switches between phone, tablet, and laptop.' },
    { id: 19, name: 'JBL Tune 510BT Wireless Headphones', category: 'electronics', price: 69000, image: 'https://source.unsplash.com/700x500/?headphones,audio,music&sig=119', rating: 4.6, description: 'Lightweight over-ear headphones with deep bass and long playback time.' },
    { id: 20, name: 'Baseus USB-C 65W Fast Charger', category: 'electronics', price: 23500, image: 'https://source.unsplash.com/700x500/?usb-c,charger,adapter&sig=120', rating: 4.6, description: 'Single-port compact charger for modern phones, tablets, and ultrabooks.' },
    { id: 21, name: 'SanDisk 128GB Ultra MicroSD Card', category: 'electronics', price: 18500, image: 'https://source.unsplash.com/700x500/?sdcard,memory,storage&sig=121', rating: 4.5, description: 'Reliable high-speed memory expansion for phones, action cams, and tablets.' },
    { id: 22, name: 'UGREEN 7-in-1 USB-C Hub', category: 'electronics', price: 42000, image: 'https://source.unsplash.com/700x500/?usb,hub,ports&sig=122', rating: 4.5, description: 'Useful hub with HDMI, USB, and card reader ports for productivity setups.' },
    { id: 23, name: 'Casio FX-991ES Plus Calculator', category: 'electronics', price: 15900, image: 'https://source.unsplash.com/700x500/?calculator,school,math&sig=123', rating: 4.8, description: 'Exam-friendly scientific calculator trusted by engineering and science students.' },
    { id: 24, name: 'TP-Link Archer C6 Dual-Band Router', category: 'electronics', price: 59500, image: 'https://source.unsplash.com/700x500/?wifi,router,internet&sig=124', rating: 4.4, description: 'Stable high-speed Wi-Fi router suitable for hostels and off-campus apartments.' },
    { id: 25, name: 'Syinix 32" HD Smart TV', category: 'electronics', price: 174000, image: 'https://source.unsplash.com/700x500/?smart-tv,television,living-room&sig=125', rating: 4.3, description: 'Affordable smart TV with streaming apps and crisp visuals for room relaxation.' },
    { id: 26, name: 'Xiaomi Redmi Buds 5', category: 'electronics', price: 52000, image: 'https://source.unsplash.com/700x500/?earbuds,wireless,audio&sig=126', rating: 4.5, description: 'True wireless earbuds with clear calls, good bass, and comfortable fit.' },

    { id: 27, name: 'LAUTECH Premium Embroidered Hoodie', category: 'fashion', price: 18500, image: 'https://source.unsplash.com/700x500/?hoodie,fashion,streetwear&sig=127', rating: 4.7, description: 'Thick cotton hoodie with premium embroidery and warm inner lining.' },
    { id: 28, name: 'Unisex Campus Cargo Trousers', category: 'fashion', price: 14200, image: 'https://source.unsplash.com/700x500/?cargo,pants,fashion&sig=128', rating: 4.4, description: 'Comfort-fit cargos with deep pockets, ideal for long academic days.' },
    { id: 29, name: 'Classic White Leather Sneakers', category: 'fashion', price: 26500, image: 'https://source.unsplash.com/700x500/?sneakers,shoes,white&sig=129', rating: 4.6, description: 'Easy-to-style sneakers with durable sole and all-day comfort.' },
    { id: 30, name: 'Formal Senate Outfit Combo Set', category: 'fashion', price: 35500, image: 'https://source.unsplash.com/700x500/?formal,shirt,trousers&sig=130', rating: 4.5, description: 'Ready-to-wear shirt and trouser combo for presentations and ceremonies.' },
    { id: 31, name: 'Campus Minimalist Backpack', category: 'fashion', price: 21500, image: 'https://source.unsplash.com/700x500/?backpack,student,bag&sig=131', rating: 4.5, description: 'Water-resistant backpack with laptop sleeve and anti-theft zip layout.' },
    { id: 32, name: 'Lightweight Rainproof Jacket', category: 'fashion', price: 17800, image: 'https://source.unsplash.com/700x500/?rain,jacket,clothing&sig=132', rating: 4.3, description: 'Foldable jacket suitable for sudden weather changes on campus.' },
    { id: 33, name: 'Sport Chronograph Wristwatch', category: 'fashion', price: 29800, image: 'https://source.unsplash.com/700x500/?wristwatch,watch,accessory&sig=133', rating: 4.4, description: 'Durable daily wristwatch with clean dial and water-resistant body.' },
    { id: 34, name: 'Signature Ankara Tote Bag', category: 'fashion', price: 9200, image: 'https://source.unsplash.com/700x500/?tote,bag,fashion&sig=134', rating: 4.2, description: 'Locally crafted tote bag with reinforced handles and inner compartments.' },

    { id: 35, name: 'A4 Spiral Notebook 10-Pack', category: 'stationery', price: 7800, image: 'https://source.unsplash.com/700x500/?notebook,stationery,school&sig=135', rating: 4.5, description: 'Durable ruled notebooks for lectures, tutorials, and revision notes.' },
    { id: 36, name: 'Pilot G2 Gel Pen Bundle (12 pcs)', category: 'stationery', price: 6900, image: 'https://source.unsplash.com/700x500/?pens,stationery,desk&sig=136', rating: 4.6, description: 'Smooth-writing gel pens in blue and black for clean note taking.' },
    { id: 37, name: 'Architect Scale & Drafting Tool Kit', category: 'stationery', price: 13500, image: 'https://source.unsplash.com/700x500/?drafting,tools,architecture&sig=137', rating: 4.4, description: 'Precision set for engineering drawing, geometry, and design classes.' },
    { id: 38, name: 'Desk Planner & Study Organizer', category: 'stationery', price: 5200, image: 'https://source.unsplash.com/700x500/?planner,study,desk&sig=138', rating: 4.3, description: 'Weekly planner sheets with goal tracking and exam deadline sections.' },
    { id: 39, name: 'Sticky Notes and Flags Mega Pack', category: 'stationery', price: 4600, image: 'https://source.unsplash.com/700x500/?sticky-notes,office,study&sig=139', rating: 4.2, description: 'Colorful memo set for textbook annotations and quick reminders.' },
    { id: 40, name: 'Premium Exam File Folder Set', category: 'stationery', price: 6100, image: 'https://source.unsplash.com/700x500/?folder,documents,office&sig=140', rating: 4.3, description: 'Multi-pocket organizer for assignments, printouts, and certificates.' },

    { id: 41, name: 'Jollof Rice + Turkey Combo Meal', category: 'food', price: 3800, image: 'https://source.unsplash.com/700x500/?jollof,rice,meal&sig=141', rating: 4.7, description: 'Freshly prepared spicy jollof with grilled turkey and salad sides.' },
    { id: 42, name: 'Amala, Ewedu and Gbegiri Bowl', category: 'food', price: 3200, image: 'https://source.unsplash.com/700x500/?african,food,soup&sig=142', rating: 4.5, description: 'Classic Yoruba meal combo served hot with assorted protein options.' },
    { id: 43, name: 'Chicken Shawarma Deluxe Wrap', category: 'food', price: 2900, image: 'https://source.unsplash.com/700x500/?shawarma,wrap,fastfood&sig=143', rating: 4.4, description: 'Toasted shawarma loaded with chicken strips, veggies, and creamy sauce.' },
    { id: 44, name: 'Fruit Smoothie Energy Pack (3 Bottles)', category: 'food', price: 4500, image: 'https://source.unsplash.com/700x500/?smoothie,fruit,drink&sig=144', rating: 4.2, description: 'Natural mixed-fruit smoothies designed for study breaks and hydration.' },
    { id: 45, name: 'Late-Night Indomie & Egg Tray', category: 'food', price: 2400, image: 'https://source.unsplash.com/700x500/?noodles,egg,meal&sig=145', rating: 4.3, description: 'Quick hostel meal pack with noodles, eggs, and seasoning add-ons.' },

    { id: 46, name: 'Orthopedic Hostel Mattress 4x6', category: 'room-essentials', price: 78500, image: 'https://source.unsplash.com/700x500/?mattress,bedroom,home&sig=146', rating: 4.6, description: 'Supportive foam mattress designed for comfortable sleep in student hostels.' },
    { id: 47, name: 'Rechargeable Emergency Lamp', category: 'room-essentials', price: 23500, image: 'https://source.unsplash.com/700x500/?lamp,rechargeable,light&sig=147', rating: 4.5, description: 'Long-lasting rechargeable lamp for blackout periods and night reading.' },
    { id: 48, name: 'Portable Standing Fan 16-inch', category: 'room-essentials', price: 46200, image: 'https://source.unsplash.com/700x500/?standing,fan,appliance&sig=148', rating: 4.4, description: 'Low-noise standing fan with adjustable speed and stable base.' },
    { id: 49, name: 'Two-Burner Gas Cooker Set', category: 'room-essentials', price: 36800, image: 'https://source.unsplash.com/700x500/?gas,cooker,kitchen&sig=149', rating: 4.3, description: 'Compact double burner suitable for safe hostel cooking routines.' },
    { id: 50, name: 'Bedsheet and Duvet Starter Bundle', category: 'room-essentials', price: 27500, image: 'https://source.unsplash.com/700x500/?duvet,bedsheet,bedding&sig=150', rating: 4.5, description: 'Matching duvet, bedsheet, and pillowcase set for a complete room setup.' }
]

document.addEventListener('DOMContentLoaded', () => {
    ensureToastContainer()
    updateCartCount()
    updateNav()
    highlightCurrentNavLink()
    setupNavbarBehavior()
})

window.showToast = showToast
window.payWithPaystack = payWithPaystack
window.setPaystackTestKey = setPaystackTestKey
