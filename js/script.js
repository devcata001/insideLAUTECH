let allUsers = []
if (localStorage.insidelautechUsers) {
    allUsers = JSON.parse(localStorage.getItem('insidelautechUsers'))
}

const signUp = (event) => {
    event.preventDefault()

    if (!fullname || !email || !password || !confirmPassword) {
        alert('Form elements not found. Please refresh the page.')
        return
    }

    if (fullname.value.trim() === '' || email.value.trim() === '' || password.value.trim() === '' || confirmPassword.value.trim() === '') {
        alert('Please fill in all required fields.')
        return
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const validEmail = emailPattern.test(email.value.trim())

    if (!validEmail) {
        alert('Please enter a valid email address.')
        return
    }

    if (password.value.length < 8) {
        alert('Password must be at least 8 characters.')
        return
    }

    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match.')
        return
    }

    if (!terms.checked) {
        alert('You must agree to the Terms & Conditions.')
        return
    }

    const userObj = {
        name: fullname.value,
        email: email.value.trim(),
        phone: phone.value,
        matric: matric.value,
        password: password.value
    }

    let found = false
    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i].email === userObj.email) {
            found = true
            break
        }
    }

    if (found) {
        alert('An account with this email already exists.')
        return
    }

    allUsers.push(userObj)
    localStorage.setItem('insidelautechUsers', JSON.stringify(allUsers))

    alert('Account created successfully! Please login.')

    fullname.value = ''
    email.value = ''
    phone.value = ''
    matric.value = ''
    password.value = ''
    confirmPassword.value = ''
    terms.checked = false

    window.location.href = 'login.html'
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form.auth-form')
    if (form) {
        form.addEventListener('submit', signUp)
    }
})
