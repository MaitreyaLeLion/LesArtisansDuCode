// const DOMAIN_NAME = "http://winux.io/";
// const DOMAIN_NAME = "http://localhost:3001/";
const DOMAIN_NAME = "http://129.151.255.248:3001/";

export class password_check {
	public password: string;

	constructor(password: string) {
		this.password = password;
	}

	private result(success: boolean, message: string, finalStep = false) {
		return { success, message, finalStep };
	}

	public async isPasswordAlright(): Promise<{ success: boolean; message: string; finalStep: boolean }> {
		if (await this.finishedSnake()) {
			return this.result(true, "Bravo ! Vous êtes maintenant connecté. Cependant, cela ne change rien.", true);
		}

		const checks = [
			this.isLengthOk(),
			this.isEvenIndexUppercase(),
			this.isDigitSumOk(),
			this.hasCyrillicChars(),
			this.hasEmojis(),
			this.containsLastPresidentName(),
			this.containsMoonLandingMonthBinary(),
			this.containsIPAddress(),
		];

		for (const check of checks) {
			const resolvedCheck = await check;
			if (!resolvedCheck.success) return resolvedCheck;
		}

		return this.result(
			true,
			"Votre mot de passe est valide ! Cependant veuillez entrer le mot de passe fourni lorsque vous arrivez au niveau 20 dans le jeu snake."
		);
	}

	private async finishedSnake(): Promise<boolean> {
		if (this.password == "1234") {
			const response = await fetch(DOMAIN_NAME + "api/snake_password");
			const data = await response.json();
			if (data.hasRequiredLevel) {
				return true;
			}
		}
		return false;
	}

	// 1. Longueur >= 32
	private isLengthOk() {
		return this.result(this.password.length >= 32, "Le mot de passe doit être supérieur ou égal à 2^5 caractères.");
	}

	// 2. Lettre index pair en majuscule
	private isEvenIndexUppercase() {
		for (let i = 0; i < this.password.length; i += 2) {
			const char = this.password[i];
			if (!char) continue;
			if (/[a-zA-Z]/.test(char) && char !== char.toUpperCase()) {
				return this.result(false, "Chaque lettre qui est à un index pair doit être en majuscule (index de la premiere lettre:0)");
			}
		}
		return this.result(true, "");
	}

	// 3. Somme des chiffres = 56
	private isDigitSumOk() {
		const digits = this.password.match(/\d/g) ?? [];
		const sum = digits.reduce((a, b) => a + Number(b), 0);

		return this.result(sum === 56, "La somme des chiffres du mot de passe doit être égale à 56.");
	}

	// 4. Au moins 3 caractères cyrilliques
	private hasCyrillicChars() {
		const matches = this.password.match(/[\u0400-\u04FF]/g) ?? [];
		return this.result(matches.length >= 3, "Le mot de passe doit contenir au moins 3 caractères en alphabet cyrillique.");
	}

	// 5. Au moins 3 emojis
	private hasEmojis() {
		const matches = this.password.match(/[\p{Emoji}]/gu) ?? [];
		return this.result(matches.length >= 3, "Le mot de passe doit contenir au moins 3 emojis.");
	}

	// 6. Contient René (dernier président IVe République)
	private containsLastPresidentName() {
		const p = this.password.toLowerCase();
		const ok = p.includes("rené") || p.includes("rene");

		return this.result(ok, "Le mot de passe doit contenir le prénom du dernier président de la IVe République.");
	}

	// 7. Inclut 0111 (mois de juillet en binaire)
	private containsMoonLandingMonthBinary() {
		return this.result(this.password.includes("0111"), "Le mot de passe doit contenir le mois du premier alunissage en binaire.");
	}

	// 8. Contient une IP valide
	private async containsIPAddress() {
		const response = await fetch(DOMAIN_NAME + "api/get_IP");
		const data = await response.json();
		const IP = data.IP;

		// const regex =
		// 	/\b(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/;

		return this.result(this.password.includes(IP), "Le mot de passe doit contenir votre adresse IP publique (format X.X.X.X de 0 à 255).");
	}
}

// module.exports = password_check;
