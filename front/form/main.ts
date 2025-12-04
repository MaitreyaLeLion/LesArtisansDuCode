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
		// message.className = "success";
		showCaptcha();
	}

	message.textContent = result.message;
});

// Création de l'overlay
function showCaptcha() {
	const overlay = document.createElement("div");
	overlay.id = "captchaOverlay";
	overlay.style.position = "fixed";
	overlay.style.top = "0";
	overlay.style.left = "0";
	overlay.style.width = "100%";
	overlay.style.height = "100%";
	overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
	overlay.style.display = "flex";
	overlay.style.alignItems = "center";
	overlay.style.justifyContent = "center";
	overlay.style.zIndex = "1000";

	// Iframe du captcha
	const iframe = document.createElement("iframe");
	iframe.src = "./captcha_jeu/html/index.html"; // ton fichier HTML de captcha
	iframe.style.border = "none";
	iframe.style.width = "50%";
	iframe.style.height = "100%";
	iframe.style.borderRadius = "10px";

	overlay.appendChild(iframe);
	document.body.appendChild(overlay);
}

// Écoute les messages venant de l'iframe
window.addEventListener("message", (event) => {
	// Vérifie la provenance si nécessaire : event.origin
	if (event.data === "captchaSolved") {
		const overlay = document.getElementById("captchaOverlay");
		if (overlay) overlay.remove();
	}
});

// // Exemple : montrer le captcha quand on clique sur le bouton submit
// document.getElementById("submitBtn").addEventListener("click", (e) => {
// 	e.preventDefault(); // bloque l'envoi tant que captcha non validé
// 	showCaptcha();
// });
