const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const message = document.getElementById("registerMessage");

    message.classList.add("hidden");

    if (!email || password.length < 6) {
        message.textContent = "Enter a valid email. Password must be at least 6 characters.";
        message.classList.remove("hidden");
        return;
    }

    try {
        await ConnectoAPI.AuthAPI.register({
            email,
            password
        });

        message.textContent = "Registration successful. Redirecting to login...";
        message.classList.add("success");
        message.classList.remove("hidden");

        setTimeout(function() {
            window.location.href = "login.html";
        }, 700);
    } catch (error) {
        message.textContent = error.message;
        message.classList.remove("success", "hidden");
    }
});
