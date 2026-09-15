// ======================================================
// CONNECTO LOGIN
// ======================================================

const loginForm =
    document.getElementById("loginForm");



loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        clearLoginErrors();


        const identifier =
            document
                .getElementById("loginIdentifier")
                .value
                .trim();

        const password =
            document
                .getElementById("loginPassword")
                .value;

        const rememberMe =
            document
                .getElementById("rememberMe")
                .checked;


        let valid = true;


        if (identifier === "") {

            document
                .getElementById("identifierError")
                .textContent =
                "Enter your email or username.";

            valid = false;
        }


        if (password === "") {

            document
                .getElementById("passwordError")
                .textContent =
                "Enter your password.";

            valid = false;

        } else if (password.length < 6) {

            document
                .getElementById("passwordError")
                .textContent =
                "Password must contain at least 6 characters.";

            valid = false;
        }


        if (!valid) {
            return;
        }


        setLoginLoading(true);


        try {

            await ConnectoAPI.AuthAPI.login(
                identifier,
                password,
                rememberMe
            );


            showLoginMessage(
                "Login successful. Opening Connecto...",
                true
            );


            // JWT cookie is now stored by the browser.
            // Go to the main Connecto frontend.
            setTimeout(function() {

                window.location.href =
                    "index.html";

            }, 500);


        } catch (error) {

            showLoginMessage(
                error.message,
                false
            );

        } finally {

            setLoginLoading(false);
        }
    }
);



function togglePassword() {

    const input =
        document.getElementById("loginPassword");

    const icon =
        document.getElementById("passwordEye");


    if (input.type === "password") {

        input.type = "text";

        icon.className =
            "fa-regular fa-eye-slash";

    } else {

        input.type = "password";

        icon.className =
            "fa-regular fa-eye";
    }
}



function clearLoginErrors() {

    document
        .getElementById("identifierError")
        .textContent = "";

    document
        .getElementById("passwordError")
        .textContent = "";

    const message =
        document.getElementById("loginMessage");

    message.classList.add("hidden");
}



function showLoginMessage(
    text,
    success
) {

    const message =
        document.getElementById("loginMessage");

    message.textContent =
        text;

    message.classList.remove(
        "hidden",
        "success"
    );

    if (success) {
        message.classList.add("success");
    }
}



function setLoginLoading(loading) {

    const button =
        document.getElementById("loginButton");

    const text =
        document.getElementById("loginButtonText");

    const spinner =
        document.getElementById("loginSpinner");


    button.disabled =
        loading;

    text.textContent =
        loading
            ? "Signing In..."
            : "Sign In";

    spinner.classList.toggle(
        "hidden",
        !loading
    );
}



// ======================================================
// FORGOT PASSWORD
// ======================================================

function openForgotPassword() {

    document
        .getElementById("forgotPasswordModal")
        .classList.remove("hidden");
}



function closeForgotPassword() {

    document
        .getElementById("forgotPasswordModal")
        .classList.add("hidden");
}



async function submitForgotPassword() {

    const email =
        document
            .getElementById("forgotEmail")
            .value
            .trim();

    const message =
        document
            .getElementById("forgotMessage");


    message.classList.add("hidden");


    if (email === "") {

        message.textContent =
            "Enter your email address.";

        message.classList.remove(
            "hidden"
        );

        return;
    }


    try {

        await ConnectoAPI.AuthAPI
            .forgotPassword(email);


        message.textContent =
            "Password reset instructions have been sent.";

        message.classList.add(
            "success"
        );

        message.classList.remove(
            "hidden"
        );


    } catch (error) {

        message.textContent =
            error.message;

        message.classList.remove(
            "success",
            "hidden"
        );
    }
}
