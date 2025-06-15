// PURE FUNCTIONS - OTP OPERATIONS
// =============================================================================

import { OTP_MAX_VALUE, OTP_MIN_VALUE } from "./constants";

function generateRandomOTP() {
  return Math.floor(
    OTP_MIN_VALUE + Math.random() * (OTP_MAX_VALUE - OTP_MIN_VALUE + 1)
  ).toString();
}

function isOTPStillValid(expirationTime) {
  return expirationTime && Date.now() < expirationTime;
}

function verifyOTPCode(enteredOTP, expectedOTP, expirationTime) {
  return enteredOTP === expectedOTP && isOTPStillValid(expirationTime);
}

export { generateRandomOTP, isOTPStillValid, verifyOTPCode };
