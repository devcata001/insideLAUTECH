// script.js - signup logic using insidelautechUsers localStorage key

let allUsers = [];
if (localStorage.insidelautechUsers) {
    try {
        const fetched = JSON.parse(localStorage.getItem('insidelautechUsers'));
        allUsers = fetched || [];
    } catch (err) {
        console.warn('Failed to parse insidelautechUsers from localStorage:', err);
        allUsers = [];
    }
} else {
    allUsers = [];
}

const signUp = (event) => {
    event.preventDefault();

    if (fullname.value.trim() === '' || email.value.trim() === '' || password.value.trim() === '' || confirmPassword.value.trim() === '') {
        showError.style.display = 'block'
        showError2.style.display = 'none'
        alert('Please fill in all required fields.')
        return
    } else {
        showError.style.display = 'none'
    }

    const regexString = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const confirmEmail = regexString.test(email.value.trim())

    if (!confirmEmail) {
        showError2.style.display = 'block'
        alert('Please enter a valid email address.')
        return
    } else {
        showError2.style.display = 'none'
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
        full_name: fullname.value,
        mail: email.value.trim(),
        phone: phone.value,
        matric: matric.value,
        pass: password.value
    }

    const found = allUsers.find(user => user.mail === userObj.mail)
    if (found) {
        alert('An account with this email already exists.')
        return
    }

    allUsers.push(userObj)
    localStorage.setItem('insidelautechUsers', JSON.stringify(allUsers))

    fullname.value = ''
    email.value = ''
    phone.value = ''
    matric.value = ''
    password.value = ''
    confirmPassword.value = ''

    window.location.href = 'login.html'
}

// Attach event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form.auth-form');
    form?.addEventListener('submit', signUp);

    // password visibility toggles
    togglePassword?.addEventListener('click', () => {
        const icon = togglePassword.querySelector('i');
        if (password.type === 'password') {
            password.type = 'text';
            icon?.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            password.type = 'password';
            icon?.classList.replace('bi-eye-slash', 'bi-eye');
        }
    });

    toggleConfirmPassword?.addEventListener('click', () => {
        const icon = toggleConfirmPassword.querySelector('i');
        if (confirmPassword.type === 'password') {
            confirmPassword.type = 'text';
            icon?.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            confirmPassword.type = 'password';
            icon?.classList.replace('bi-eye-slash', 'bi-eye');
        }
    });
});
