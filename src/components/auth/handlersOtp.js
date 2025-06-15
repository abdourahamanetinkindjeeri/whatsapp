// =============================================================================
// EVENT HANDLERS
// =============================================================================

import { findContactByPhoneNumber } from "./accesData";
import { ELEMENT_IDS } from "./constants";
import {
  focusElement,
  getElementValue,
  setElementTextContent,
  showElement,
} from "./domUtil";
import { dispatchAuthenticationEvent, dispatchLogoutEvent } from "./eventOtp";
import { displayMessage } from "./optDisplayMessage";
import { closeLoginModal } from "./otpModel";
import {
  generateRandomOTP,
  isOTPStillValid,
  verifyOTPCode,
} from "./otpService";
import { validateOTPInput, validatePhoneInput } from "./otpValidation";
import {
  authenticationState,
  resetAuthState,
  setOTP,
  setUserAuthenticated,
} from "./state";
import { hideUserStatus, showUserStatus } from "./userStatus";

function handlePhoneVerification() {
  const phoneNumber = getElementValue(ELEMENT_IDS.PHONE_INPUT);

  const phoneValidation = validatePhoneInput(phoneNumber);
  if (!phoneValidation.isValid) {
    displayMessage(phoneValidation.errorMessage, "error");
    return;
  }

  const searchResult = findContactByPhoneNumber(phoneNumber);

  if (!searchResult.found) {
    displayMessage(searchResult.error, "error");
    return;
  }

  processSuccessfulPhoneVerification(searchResult.contact);
}

function processSuccessfulPhoneVerification(contact) {
  authenticationState.currentUserContact = contact;
  authenticationState.currentUser = contact.name;

  const otp = generateRandomOTP();
  setOTP(otp);

  setElementTextContent(ELEMENT_IDS.FOUND_USER_NAME, contact.name);
  setElementTextContent(ELEMENT_IDS.OTP_DISPLAY, otp);
  showElement(ELEMENT_IDS.OTP_SECTION);

  displayMessage(`OTP généré pour ${contact.name}`, "success");

  setTimeout(() => focusElement(ELEMENT_IDS.OTP_INPUT), 100);
}

function handleOTPVerification() {
  const enteredOTP = getElementValue(ELEMENT_IDS.OTP_INPUT);

  const otpValidation = validateOTPInput(enteredOTP);
  if (!otpValidation.isValid) {
    displayMessage(otpValidation.errorMessage, "error");
    return;
  }

  if (!isOTPStillValid(authenticationState.otpExpirationTime)) {
    displayMessage("Code OTP expiré", "error");
    resetOTPSection();
    return;
  }

  if (
    verifyOTPCode(
      enteredOTP,
      authenticationState.generatedOTP,
      authenticationState.otpExpirationTime
    )
  ) {
    processSuccessfulLogin();
  } else {
    displayMessage("Code OTP incorrect", "error");
  }
}

function processSuccessfulLogin() {
  setUserAuthenticated(
    authenticationState.currentUser,
    authenticationState.currentUserContact
  );

  displayMessage("Connexion réussie !", "success");

  setTimeout(() => {
    closeLoginModal();
    showUserStatus();
    dispatchAuthenticationEvent();
  }, 500);
}

function handleLogout() {
  const previousUser = authenticationState.currentUser;
  const previousContact = authenticationState.currentUserContact;

  resetAuthState();
  hideUserStatus();

  dispatchLogoutEvent(previousUser, previousContact);
}

function handleModalClose() {
  closeLoginModal();
}

export {
  handlePhoneVerification,
  processSuccessfulPhoneVerification,
  handleOTPVerification,
  processSuccessfulLogin,
  handleLogout,
  handleModalClose,
};
