export class password_check {
	public password: string;

	constructor(password: string) {
		this.password = password;
	}

	private result(success: boolean, message: string) {
		return { success, message };
	}

	public isPasswordAlright(): { success: boolean; message: string } {
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
			if (!check.success) return check;
		}

		return this.result(true, "Le mot de passe est valide !");
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

	// 3. Somme des chiffres = 8
	private isDigitSumOk() {
		const digits = this.password.match(/\d/g) ?? [];
		const sum = digits.reduce((a, b) => a + Number(b), 0);

		return this.result(sum === 8, "La somme des chiffres du mot de passe doit être égale à 8.");
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
		return this.result(this.password.includes("0111"), "Le mot de passe doit contenir le mois de l’alunissage en binaire.");
	}

	// 8. Contient une IP valide
	private containsIPAddress() {
		const regex =
			/\b(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/;

		return this.result(regex.test(this.password), "Le mot de passe doit contenir une adresse IP valide (format X.X.X.X de 0 à 255).");
	}
}

// module.exports = password_check;
