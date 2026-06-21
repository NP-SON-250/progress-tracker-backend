export class OTPGenerator {
  static generateOTP(length = 6) {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  static expiryTime(minutes = 15) {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60000);
  }
}
