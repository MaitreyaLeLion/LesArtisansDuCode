class password_check {
    constructor(password) {
        this.password = password;
    }
    isPasswordAlright() {
        if (!this.isLengthOk())
            return false;
        if (!this.isEvenIndexUppercase())
            return false;
        if (!this.isDigitSumOk())
            return false;
        if (!this.hasCyrillicChars())
            return false;
        if (!this.hasEmojis())
            return false;
        if (!this.containsLastPresidentName())
            return false;
        if (!this.containsMoonLandingMonthBinary())
            return false;
        if (!this.containsIPAddress())
            return false;
        return true;
    }
    isLengthOk() {
        return this.password.length >= 32;
    }
    isEvenIndexUppercase() {
        for (let i = 0; i < this.password.length; i += 2) {
            const char = this.password[i];
            if (/[a-zA-Z]/.test(char) && char !== char.toUpperCase()) {
                return false;
            }
        }
        return true;
    }
    isDigitSumOk() {
        const digits = this.password.match(/\d/g);
        if (!digits)
            return false;
        const sum = digits.map(Number).reduce((a, b) => a + b, 0);
        return sum === 8;
    }
    hasCyrillicChars() {
        const matches = this.password.match(/[\u0400-\u04FF]/g);
        return matches !== null && matches.length >= 3;
    }
    hasEmojis() {
        const matches = this.password.match(/[\p{Emoji}]/gu);
        return matches !== null && matches.length >= 3;
    }
    containsLastPresidentName() {
        const password = this.password.toLowerCase();
        return password.includes("rené") || password.includes("rene");
    }
    containsMoonLandingMonthBinary() {
        return this.password.includes("0111");
    }
    containsIPAddress() {
        const regex = /\b(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/;
        return regex.test(this.password);
    }
}
export {};
//# sourceMappingURL=check.js.map