document.addEventListener("DOMContentLoaded", () => {
    const email =
        new URLSearchParams(window.location.search).get("email") ||
        localStorage.getItem("verification_pending_email") ||
        "your-email@example.com";

    const resendBtn = document.getElementById("resendBtn");
    const cooldownTimer = document.getElementById("cooldownTimer");
    const emailDisplay = document.getElementById("emailDisplay");
    const resendText = document.getElementById("resendText");

    if (!resendBtn || !cooldownTimer || !emailDisplay || !resendText) {
        return;
    }

    const cooldownKey = `resend_cooldown_${email}`;
    const cooldownDuration = 60;

    emailDisplay.textContent = email;
    localStorage.setItem("verification_pending_email", email);

    const updateCooldown = () => {
        const cooldownUntil = localStorage.getItem(cooldownKey);
        if (!cooldownUntil) {
            resendBtn.disabled = false;
            resendText.textContent = "Resend Verification Email";
            cooldownTimer.textContent = "";
            return;
        }

        const now = Date.now();
        const remaining = Math.ceil((parseInt(cooldownUntil, 10) - now) / 1000);

        if (remaining > 0) {
            resendBtn.disabled = true;
            resendText.textContent = `Resend in ${remaining}s`;
            cooldownTimer.textContent = `Please wait ${remaining} seconds before resending.`;
            setTimeout(updateCooldown, 1000);
            return;
        }

        localStorage.removeItem(cooldownKey);
        resendBtn.disabled = false;
        resendText.textContent = "Resend Verification Email";
        cooldownTimer.textContent = "";
    };

    resendBtn.addEventListener("click", async () => {
        if (resendBtn.disabled) {
            return;
        }

        resendBtn.disabled = true;
        resendText.textContent = "Sending...";

        try {
            if (typeof makeApiRequest !== "function" || !window.API_CONFIG) {
                throw new Error("API client is not configured.");
            }

            await makeApiRequest(API_CONFIG.endpoints.auth.resendVerification, {
                method: "POST",
                includeAuth: false,
                body: { email },
            });

            showToast("Verification email sent! Check your inbox.", "success");
            localStorage.setItem(cooldownKey, String(Date.now() + cooldownDuration * 1000));
            updateCooldown();
        } catch (err) {
            showToast(err.message || "Network error. Please try again.", "error");
            resendBtn.disabled = false;
            resendText.textContent = "Resend Verification Email";
        }
    });

    updateCooldown();
});
