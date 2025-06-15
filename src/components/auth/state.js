// STATE MANAGEMENT
// =============================================================================
// =============================================================================

import { OTP_EXPIRATION_TIME } from "./constants";

let authenticationState = {
  isAuthenticated: false,
  currentUser: null,
  currentUserContact: null,
  generatedOTP: null,
  otpExpirationTime: null,
};

function resetAuthState() {
  authenticationState = {
    isAuthenticated: false,
    currentUser: null,
    currentUserContact: null,
    generatedOTP: null,
    otpExpirationTime: null,
  };
}

function setUserAuthenticated(user, contact) {
  authenticationState.isAuthenticated = true;
  authenticationState.currentUser = user;
  authenticationState.currentUserContact = contact;
}

function setOTP(otp) {
  authenticationState.generatedOTP = otp;
  authenticationState.otpExpirationTime = Date.now() + OTP_EXPIRATION_TIME;
}

function clearOTP() {
  authenticationState.generatedOTP = null;
  authenticationState.otpExpirationTime = null;
}

export {
  authenticationState,
  resetAuthState,
  setUserAuthenticated,
  setOTP,
  clearOTP,
};
