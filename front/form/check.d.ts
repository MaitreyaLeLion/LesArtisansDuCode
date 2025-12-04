export declare class password_check {
    password: string;
    constructor(password: string);
    private result;
    isPasswordAlright(): {
        success: boolean;
        message: string;
    };
    private isLengthOk;
    private isEvenIndexUppercase;
    private isDigitSumOk;
    private hasCyrillicChars;
    private hasEmojis;
    private containsLastPresidentName;
    private containsMoonLandingMonthBinary;
    private containsIPAddress;
}
//# sourceMappingURL=check.d.ts.map