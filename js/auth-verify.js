async function verifyAccount() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const messageElement = document.getElementById("verifyMessage");

    if (!messageElement) {
        return;
    }

    if (!token) {
        messageElement.textContent = "Invalid verification link.";
        messageElement.style.color = "#dc3545";
        return;
    }

    try {
        if (typeof makeApiRequest !== "function" || !window.API_CONFIG) {
            throw new Error("API client is not configured.");
        }

        await makeApiRequest(
            `${API_CONFIG.endpoints.auth.verify}?token=${encodeURIComponent(token)}`,
            { method: "GET", includeAuth: false },
        );
        messageElement.textContent = "Email verified! You can now log in.";
        messageElement.style.color = "#198754";
    } catch (err) {
        messageElement.textContent = err.message || "Network error. Please try again.";
        messageElement.style.color = "#dc3545";
    }
}

verifyAccount();
