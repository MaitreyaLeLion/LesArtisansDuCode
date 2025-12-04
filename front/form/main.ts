import { password_check } from "./check.js"; // ton checker déjà existant

const formButton = document.getElementById("submitBtn") as HTMLButtonElement;
const message = document.getElementById("message") as HTMLParagraphElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;

formButton.addEventListener("click", async (e) => {
	e.preventDefault(); // empêche le submit si c'est un <form>

	const password = passwordInput.value;
	const checker = new password_check(password);
	const result = await checker.isPasswordAlright();

	if (!result.success) {
		message.className = "error";
		passwordInput.value = "";
	} else {
		message.className = "success";
	}

	message.textContent = result.message;
});
