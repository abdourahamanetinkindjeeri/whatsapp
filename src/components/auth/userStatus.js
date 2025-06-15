// =============================================================================
// USER STATUS MANAGEMENT
// =============================================================================

import { ELEMENT_IDS } from "./constants";
import { removeElement } from "./domUtil";
import { createUserStatusDisplay } from "./otpComponentUI";
import { authenticationState } from "./state";

export function showUserStatus() {
  const userStatus = createUserStatusDisplay(authenticationState.currentUser);
  document.body.appendChild(userStatus);
}

export function hideUserStatus() {
  removeElement(ELEMENT_IDS.USER_STATUS);
}
