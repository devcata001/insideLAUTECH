let allUsers = [];
if (localStorage.shoponcampusUsers) {
  allUsers = JSON.parse(localStorage.getItem("shoponcampusUsers"));
}

const updateConfirmPasswordHint = (
  passwordInput,
  confirmPasswordInput,
  hintElement,
) => {
  if (!passwordInput || !confirmPasswordInput || !hintElement) {
    return;
  }

  if (!confirmPasswordInput.value) {
    hintElement.textContent = "Re-enter your password exactly.";
    hintElement.style.color = "#6c757d";
    return;
  }

  if (passwordInput.value === confirmPasswordInput.value) {
    hintElement.textContent = "Passwords match.";
    hintElement.style.color = "#198754";
  } else {
    hintElement.textContent = "Passwords do not match yet.";
    hintElement.style.color = "#dc3545";
  }
};

const setupPasswordVisibilityToggles = () => {
  const toggleButtons = document.querySelectorAll(".password-toggle");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) {
        return;
      }

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.innerHTML = isPassword
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
    });
  });
};

async function signupWithBackend(userObj) {
  try {
    if (typeof makeApiRequest !== "function" || !window.API_CONFIG) {
      throw new Error("API client is not configured.");
    }

    return await makeApiRequest(API_CONFIG.endpoints.auth.signup, {
      method: "POST",
      includeAuth: false,
      body: {
        name: userObj.name,
        email: userObj.email,
        password: userObj.password,
      },
    });
  } catch (err) {
    throw err;
  }
}

// Show toast for all signup results and errors
const signUp = async (event, formElements) => {
  event.preventDefault();
  const { fullname, email, phone, password, confirmPassword, terms } =
    formElements;
  if (!fullname || !email || !password || !confirmPassword) {
    showToast("Form elements not found. Please refresh the page.", "error");
    return false;
  }
  if (
    fullname.value.trim() === "" ||
    email.value.trim() === "" ||
    password.value.trim() === "" ||
    confirmPassword.value.trim() === ""
  ) {
    showToast("Please fill in all required fields.", "warning");
    return false;
  }
  const normalizedEmail = email.value.trim().toLowerCase();
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const validEmail = emailPattern.test(normalizedEmail);
  if (!validEmail) {
    showToast("Please enter a valid email address.", "warning");
    return false;
  }
  const normalizedPhone = phone.value.trim();
  if (!/^\+?\d{10,15}$/.test(normalizedPhone.replace(/\s+/g, ""))) {
    showToast("Enter a valid phone number (10-15 digits).", "warning");
    return false;
  }
  const hasStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(
    password.value,
  );
  if (!hasStrongPassword) {
    showToast(
      "Use a stronger password with upper/lowercase letters and a number.",
      "warning",
    );
    return false;
  }
  if (password.value !== confirmPassword.value) {
    showToast("Passwords do not match.", "warning");
    return false;
  }
  if (!terms.checked) {
    showToast("You must agree to the Terms & Conditions.", "warning");
    return false;
  }
  try {
    await signupWithBackend({
      name: fullname.value.trim(),
      email: normalizedEmail,
      password: password.value,
    });
    showToast(
      "Account created successfully! Please check your email to verify your account.",
      "success",
    );
    fullname.value = "";
    email.value = "";
    phone.value = "";
    password.value = "";
    confirmPassword.value = "";
    terms.checked = false;
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return true;
  } catch (err) {
    showToast(err.message || "Signup failed", "error");
    return false;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const activeSession = checkSession();
  if (activeSession) {
    window.location.href = "dashboard.html";
    return;
  }

  const form = document.querySelector("form#signupForm, form.auth-form");
  const formElements = {
    fullname: document.getElementById("fullname"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
    terms: document.getElementById("terms"),
  };
  const confirmPasswordHint = document.getElementById("confirmPasswordHint");

  setupPasswordVisibilityToggles();

  if (formElements.password) {
    formElements.password.addEventListener("input", () => {
      updateConfirmPasswordHint(
        formElements.password,
        formElements.confirmPassword,
        confirmPasswordHint,
      );
    });
  }

  if (formElements.confirmPassword) {
    formElements.confirmPassword.addEventListener("input", () => {
      updateConfirmPasswordHint(
        formElements.password,
        formElements.confirmPassword,
        confirmPasswordHint,
      );
    });
  }

  updateConfirmPasswordHint(
    formElements.password,
    formElements.confirmPassword,
    confirmPasswordHint,
  );

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      signUp(event, formElements);
    });
  } else {
    console.warn(
      "Signup form not found. Checking for button click fallback...",
    );
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn && !formElements.fullname) {
      showToast("Form elements not properly loaded. Please refresh.", "error");
    }
  }
});
