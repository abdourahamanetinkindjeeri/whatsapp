// import { createElement } from "../../utils/element.js";
import {
  OTP_EXPIRATION_TIME,
  OTP_LENGTH,
  OTP_MIN_VALUE,
  OTP_MAX_VALUE,
  ELEMENT_IDS,
  CSS_CLASSES,
} from "./constants.js";
import {
  authenticationState,
  resetAuthState,
  setUserAuthenticated,
  setOTP,
  clearOTP,
} from "./state.js";
import {
  loadContactsData,
  getActiveContacts,
  normalizePhoneNumber,
  mapRawContactToContact,
  findContactByPhoneNumber,
  createSearchResult,
} from "./accesData.js";

import {
  generateRandomOTP,
  isOTPStillValid,
  verifyOTPCode,
} from "./otpService.js";

import { validateOTPInput, validatePhoneInput } from "./otpValidation.js";

import {
  getElementValue,
  setElementTextContent,
  showElement,
  hideElement,
  focusElement,
  clearElementValue,
  removeElement,
} from "./domUtil.js";
import {
  createModalOverlay,
  createModalContent,
  createModalHeader,
  createInstructionsSection,
  createPhoneInputSection,
} from "./otpComponentUI.js";

import { displayMessage } from "./optDisplayMessage.js";

import {
  handlePhoneVerification,
  processSuccessfulPhoneVerification,
  handleOTPVerification,
  processSuccessfulLogin,
  handleLogout,
  handleModalClose,
} from "./handlersOtp.js";
import {
  showLoginModal,
  closeLoginModal,
  resetOTPSection,
} from "./otpModel.js";

import { showUserStatus, hideUserStatus } from "./userStatus.js";

import {
  dispatchAuthenticationEvent,
  dispatchLogoutEvent,
} from "./eventOtp.js";

import {
  checkPhoneExists,
  createSecureMessage,
  createSecureMessageButtons,
} from "./compatibiliteOTP.js";
// =============================================================================
// AUTHENTICATION REQUIREMENTS
// =============================================================================

function requireAuthentication(action) {
  if (authenticationState.isAuthenticated) {
    action();
  } else {
    showLoginModal();
  }
}

// =============================================================================
// PUBLIC API
// =============================================================================

export const authManager = {
  isAuthenticated: () => authenticationState.isAuthenticated,
  getCurrentUser: () => {
    const user = authenticationState.currentUser;
    const contact = authenticationState.currentUserContact;

    if (!user && !contact) return null;

    return {
      ...user,
      ...contact,
      avatar: contact?.profile?.avatar || contact?.avatar || null,
      name: contact?.name || contact?.nom || contact?.prenom || "Utilisateur",
      initial: (
        contact?.name?.[0] ||
        contact?.nom?.[0] ||
        contact?.prenom?.[0] ||
        "U"
      ).toUpperCase(),
    };
  },
  getCurrentUserContact: () => authenticationState.currentUserContact,
  showLogin: showLoginModal,
  logout: handleLogout,
  requireAuth: requireAuthentication,
  checkPhoneExists,
};

// export { createSecureMessage, createSecureMessageButtons };
export default authManager;
