document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetPasswordForm");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const confirmPasswordHint = document.getElementById("confirmPasswordHint");
    const submitBtn = document.getElementById("submitBtn");
    const passwordToggleButtons = document.querySelectorAll(".password-toggle");

    // Get reset token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
        const messageDiv = document.querySelector(".form-subtitle");
        messageDiv.textContent = "Invalid or missing password reset link.";
        messageDiv.style.color = "#dc3545";
        form.style.display = "none";
        return;
    }

    // Setup password visibility toggle
    const setupPasswordVisibilityToggles = () => {
        passwordToggleButtons.forEach((btn) => {
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

    const updateConfirmPasswordHint = () => {
        if (!passwordInput.value) {
            confirmPasswordHint.textContent = "Re-enter your password exactly.";
            confirmPasswordHint.style.color = "#6c757d";
            return;
        }

        if (!confirmPasswordInput.value) {
            confirmPasswordHint.textContent = "Re-enter your password exactly.";
            confirmPasswordHint.style.color = "#6c757d";
            return;
        }

        if (passwordInput.value === confirmPasswordInput.value) {
            confirmPasswordHint.textContent = "Passwords match.";
            confirmPasswordHint.style.color = "#198754";
        } else {
            confirmPasswordHint.textContent = "Passwords do not match yet.";
            confirmPasswordHint.style.color = "#dc3545";
        }
    };

    setupPasswordVisibilityToggles();

    passwordInput.addEventListener("input", updateConfirmPasswordHint);
    confirmPasswordInput.addEventListener("input", updateConfirmPasswordHint);

    updateConfirmPasswordHint();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!password || !confirmPassword) {
            showToast("Please enter and confirm your new password.", "warning");
            return;
        }

        if (password !== confirmPassword) {
            showToast("Passwords do not match.", "warning");
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            showToast(
                "Use a stronger password with upper/lowercase letters, a number, and at least 8 characters.",
                "warning",
            );
            return;
        }

        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Resetting...';

        try {
            if (typeof makeApiRequest !== "function" || !window.API_CONFIG) {
                throw new Error("API client is not configured.");
            }

            await makeApiRequest(API_CONFIG.endpoints.auth.resetPassword, {
                method: "POST",
                includeAuth: false,
                body: { token, password },
            });

            showToast("Password reset successfully! Redirecting to login...", "success");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } catch (err) {
            showToast(err.message || "Failed to reset password. Please try again.", "error");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
});
