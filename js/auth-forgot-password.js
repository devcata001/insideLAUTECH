document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgotPasswordForm");
    const emailInput = document.getElementById("email");
    const resetBtn = document.getElementById("resetBtn");
    const remembered =
        localStorage.getItem("shoponcampus_remembered_email") ||
        localStorage.getItem("shoponcampus_rememberedEmail");

    if (remembered) {
        emailInput.value = remembered;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim().toLowerCase();

        if (!email) {
            showToast("Please enter your email address.", "warning");
            return;
        }

        resetBtn.disabled = true;
        const originalText = resetBtn.innerHTML;
        resetBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';

        try {
            if (typeof makeApiRequest !== "function" || !window.API_CONFIG) {
                throw new Error("API client is not configured.");
            }

            await makeApiRequest(API_CONFIG.endpoints.auth.forgotPassword, {
                method: "POST",
                includeAuth: false,
                body: { email },
            });

            showToast(
                "If your email is registered, you'll receive a password reset link shortly.",
                "success",
            );

            setTimeout(() => {
                emailInput.value = "";
                window.location.href = "login.html";
            }, 2000);
        } catch (err) {
            showToast(err.message || "Failed to send reset link. Please try again.", "error");
            resetBtn.disabled = false;
            resetBtn.innerHTML = originalText;
        }
    });
});
