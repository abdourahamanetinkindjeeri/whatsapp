// =============================================================================
// MODAL MANAGEMENT
// =============================================================================

import { ELEMENT_IDS } from "./constants";
import { clearElementValue, hideElement, removeElement } from "./domUtil";
import { createModalOverlay } from "./otpComponentUI";
import { authenticationState, clearOTP } from "./state";

function showLoginModal() {
  if (!authenticationState.isAuthenticated) {
    const modal = createModalOverlay();
    document.body.appendChild(modal);
  }
}

function closeLoginModal() {
  clearOTP();

  if (!authenticationState.isAuthenticated) {
    authenticationState.currentUser = null;
    authenticationState.currentUserContact = null;
  }

  removeElement(ELEMENT_IDS.MODAL);
}

function resetOTPSection() {
  clearOTP();
  hideElement(ELEMENT_IDS.OTP_SECTION);
  clearElementValue(ELEMENT_IDS.OTP_INPUT);
  clearElementValue(ELEMENT_IDS.PHONE_INPUT);
}

export { showLoginModal, closeLoginModal, resetOTPSection };
