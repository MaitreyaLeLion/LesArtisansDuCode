class password_check {
	private password: string;

	constructor(password: string) {
		this.password = password;
	}

	public isPasswordAlright(): boolean {
		if (!this.isLengthOk()) return false;
		if (!this.isEvenIndexUppercase()) return false;
		if (!this.isDigitSumOk()) return false;
		if (!this.hasCyrillicChars()) return false;
		if (!this.hasEmojis()) return false;
		if (!this.containsLastPresidentName()) return false;
		if (!this.containsMoonLandingMonthBinary()) return false;
		if (!this.containsIPAddress()) return false;

		return true;
	}

	private isLengthOk(): boolean {
		return this.password.length >= 32;
	}

	private isEvenIndexUppercase(): boolean {
		for (let i = 0; i < this.password.length; i += 2) {
			const char = this.password[i];
			if (/[a-zA-Z]/.test(char) && char !== char.toUpperCase()) {
				return false;
			}
		}
		return true;
	}

	private isDigitSumOk(): boolean {
		const digits = this.password.match(/\d/g);
		if (!digits) return false;

		const sum = digits.map(Number).reduce((a, b) => a + b, 0);
		return sum === 8;
	}

	private hasCyrillicChars(): boolean {
		const matches = this.password.match(/[\u0400-\u04FF]/g);
		return matches !== null && matches.length >= 3;
	}

	private hasEmojis(): boolean {
		const matches = this.password.match(/[\p{Emoji}]/gu);
		return matches !== null && matches.length >= 3;
	}

	private containsLastPresidentName(): boolean {
		const password = this.password.toLowerCase();
		return password.includes("rené") || password.includes("rene");
	}

	private containsMoonLandingMonthBinary(): boolean {
		return this.password.includes("0111");
	}

	private containsIPAddress(): boolean {
		const regex =
			/\b(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/;
		return regex.test(this.password);
	}
}
