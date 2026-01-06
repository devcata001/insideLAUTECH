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

    // Get form elements
    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const matric = document.getElementById('matric');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');

    if (!fullname || !email || !password || !confirmPassword) {
        alert('Form elements not found. Please refresh the page.');
        return;
    }

    if (fullname.value.trim() === '' || email.value.trim() === '' || password.value.trim() === '' || confirmPassword.value.trim() === '') {
        alert('Please fill in all required fields.');
        return;
    }

    const regexString = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const confirmEmail = regexString.test(email.value.trim());

    if (!confirmEmail) {
        alert('Please enter a valid email address.');
        return;
    }

    if (password.value.length < 8) {
        alert('Password must be at least 8 characters.');
        return;
    }

    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match.');
        return;
    }

    if (!terms.checked) {
        alert('You must agree to the Terms & Conditions.');
        return;
    }

    const userObj = {
        name: fullname.value,
        email: email.value.trim(),
        phone: phone.value,
        matric: matric.value,
        password: password.value
    };

    const found = allUsers.find(user => user.email === userObj.email);
    if (found) {
        alert('An account with this email already exists.');
        return;
    }

    allUsers.push(userObj);
    localStorage.setItem('insidelautechUsers', JSON.stringify(allUsers));

    alert('Account created successfully! Please login.');

    fullname.value = '';
    email.value = '';
    phone.value = '';
    matric.value = '';
    password.value = '';
    confirmPassword.value = '';
    terms.checked = false;

    window.location.href = 'login.html';
}

// Attach event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form.auth-form');
    form?.addEventListener('submit', signUp);
});
