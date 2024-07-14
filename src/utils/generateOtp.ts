async function generateOTP() {
  const randomNumber: number = Math.floor(Math.random() * 90000 + 10000);
  const OtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  return { otp: randomNumber.toString(), otp_expires_at: OtpExpiry };
}

export { generateOTP };
