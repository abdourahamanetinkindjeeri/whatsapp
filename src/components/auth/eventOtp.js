// =============================================================================
// EVENT DISPATCHING
// =============================================================================

import { authenticationState } from "./state";

export function dispatchAuthenticationEvent() {
  window.dispatchEvent(
    new CustomEvent("userAuthenticated", {
      detail: {
        username: authenticationState.currentUser,
        id: authenticationState.currentUserContact?.id || null,
        phone: authenticationState.currentUserContact?.phone || null,
        fullContact: authenticationState.currentUserContact,
      },
    })
  );
}

export const dispatchLogoutEvent = (previousUser, previousContact) => {
  window.dispatchEvent(
    new CustomEvent("userLoggedOut", {
      detail: {
        username: previousUser,
        previousContact,
        timestamp: new Date().toISOString(),
      },
    })
  );
};
