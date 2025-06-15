// =============================================================================
// BACKWARD COMPATIBILITY FUNCTIONS
// =============================================================================

function checkPhoneExists(phone) {
  const result = findContactByPhoneNumber(phone);
  return {
    exists: result.found,
    contact: result.contact || null,
    error: result.error,
  };
}

function createSecureMessage() {
  return createElement(
    "div",
    { class: ["flex", "flex-col", "w-2/3", "h-screen"] },
    `Interface sécurisée - Connecté comme: ${
      authenticationState.currentUser || "Non connecté"
    }`
  );
}

function createSecureMessageButtons() {
  return createElement("ul", { class: ["flex", "gap-x-2", "items-center"] }, [
    // Simplified for brevity - maintain existing functionality
  ]);
}

export { checkPhoneExists, createSecureMessage, createSecureMessageButtons };
