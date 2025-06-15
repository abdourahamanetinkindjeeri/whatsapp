// =============================================================================
// PURE FUNCTIONS - VALIDATION
// =============================================================================

function validatePhoneInput(phone) {
  if (!phone) {
    return createValidationResult(
      false,
      "Veuillez entrer un numéro de téléphone"
    );
  }
  return createValidationResult(true, null);
}

function validateOTPInput(otp) {
  if (!otp) {
    return createValidationResult(false, "Veuillez entrer le code OTP");
  }
  return createValidationResult(true, null);
}

function createValidationResult(isValid, errorMessage) {
  return { isValid, errorMessage };
}

export { validateOTPInput, validatePhoneInput };
