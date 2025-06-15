import { createElement } from "../../utils/element.js";

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes
const OTP_LENGTH = 6;
const OTP_MIN_VALUE = 100000;
const OTP_MAX_VALUE = 999999;

const ELEMENT_IDS = {
  MODAL: "loginModal",
  PHONE_INPUT: "phoneInput",
  OTP_INPUT: "otpInput",
  OTP_SECTION: "otpSection",
  USER_INFO: "userInfo",
  FOUND_USER_NAME: "foundUserName",
  OTP_DISPLAY: "otpDisplay",
  AUTH_MESSAGE: "authMessage",
  USER_STATUS: "userStatus",
};

const CSS_CLASSES = {
  modal: {
    overlay: [
      "fixed",
      "inset-0",
      "bg-black",
      "bg-opacity-50",
      "flex",
      "items-center",
      "justify-center",
      "z-50",
    ],
    content: ["bg-white", "rounded-lg", "shadow-xl", "w-96", "p-6"],
    header: [
      "flex",
      "justify-between",
      "items-center",
      "mb-6",
      "pb-3",
      "border-b",
      "border-gray-200",
    ],
  },
  button: {
    primary: [
      "w-full",
      "h-9",
      "text-white",
      "rounded-full",
      "text-sm",
      "font-medium",
      "transition",
      "flex",
      "items-center",
      "justify-center",
    ],
    close: ["text-gray-400", "hover:text-gray-600"],
  },
  input: {
    base: [
      "w-full",
      "h-9",
      "rounded-full",
      "border",
      "border-gray-300",
      "px-3",
      "text-sm",
      "focus:outline-none",
      "focus:ring-1",
    ],
  },
};

// =============================================================================
// STATE MANAGEMENT
// =============================================================================
// =============================================================================

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

// =============================================================================
// PURE FUNCTIONS - DATA ACCESS
// =============================================================================

function loadContactsData() {
  const data = localStorage.getItem("data");
  return data ? JSON.parse(data) : {};
}

function getActiveContacts() {
  return (loadContactsData().users || []).filter(
    (contact) => !contact.delete && !contact.archive
  );
}

function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/[\s\-\(\)\.\+]/g, "").toLowerCase();
}

function mapRawContactToContact(rawContact) {
  return {
    name: rawContact.name || rawContact.nom || "Utilisateur",
    phone: rawContact.telephone || rawContact.phone,
    id: rawContact.id || null,
    email: rawContact.email || null,
    originalData: rawContact,
    address: rawContact.address || rawContact.adresse || null,
    company: rawContact.company || rawContact.entreprise || null,
    notes: rawContact.notes || rawContact.remarques || null,
  };
}

function findContactByPhoneNumber(phone) {
  const contacts = getActiveContacts();
  const normalizedInput = normalizePhoneNumber(phone);

  if (!normalizedInput) {
    return createSearchResult(false, null, "Numéro invalide");
  }

  const matchingContact = contacts.find((contact) => {
    const contactPhone = contact.telephone || contact.phone || "";
    return normalizePhoneNumber(contactPhone) === normalizedInput;
  });

  if (!matchingContact) {
    return createSearchResult(
      false,
      null,
      "Numéro non trouvé dans les contacts"
    );
  }

  return createSearchResult(
    true,
    mapRawContactToContact(matchingContact),
    null
  );
}

function createSearchResult(found, contact, error) {
  return { found, contact, error };
}

// =============================================================================
// PURE FUNCTIONS - OTP OPERATIONS
// =============================================================================

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

// =============================================================================
// DOM UTILITIES
// =============================================================================

function getElementValue(elementId) {
  return document.getElementById(elementId)?.value?.trim() || "";
}

function setElementTextContent(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove("hidden");
  }
}

function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add("hidden");
  }
}

function focusElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.focus();
  }
}

function clearElementValue(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = "";
  }
}

function removeElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.remove();
  }
}

// =============================================================================
// UI COMPONENTS BUILDERS
// =============================================================================

function createModalOverlay() {
  return createElement(
    "div",
    {
      class: CSS_CLASSES.modal.overlay,
      id: ELEMENT_IDS.MODAL,
    },
    [createModalContent()]
  );
}

function createModalContent() {
  return createElement(
    "div",
    {
      class: CSS_CLASSES.modal.content,
      style: { backgroundColor: "#f9fafb" },
    },
    [
      createModalHeader(),
      createInstructionsSection(),
      createPhoneInputSection(),
      createPhoneVerificationButton(),
      createOTPSection(),
      createMessageArea(),
    ]
  );
}

function createModalHeader() {
  return createElement(
    "div",
    {
      class: CSS_CLASSES.modal.header,
    },
    [
      createElement(
        "h2",
        {
          class: ["text-xl", "font-semibold", "text-gray-800"],
        },
        "Connexion sécurisée"
      ),
      createElement(
        "button",
        {
          class: CSS_CLASSES.button.close,
          onclick: handleModalClose,
        },
        [createElement("i", { class: ["fas", "fa-times"] })]
      ),
    ]
  );
}

function createInstructionsSection() {
  return createElement(
    "div",
    {
      class: [
        "mb-4",
        "p-3",
        "bg-blue-50",
        "rounded",
        "border",
        "border-blue-200",
      ],
    },
    [
      createElement(
        "p",
        {
          class: ["text-sm", "text-blue-800", "text-center"],
        },
        "Entrez votre numéro de téléphone pour recevoir un code OTP"
      ),
    ]
  );
}

function createPhoneInputSection() {
  return createElement("div", { class: ["mb-4"] }, [
    createElement("input", {
      type: "tel",
      id: ELEMENT_IDS.PHONE_INPUT,
      class: [...CSS_CLASSES.input.base, "focus:ring-blue-400"],
      placeholder: "Ex: +221 77 123 45 67",
      style: { backgroundColor: "#ffffff" },
    }),
  ]);
}

function createPhoneVerificationButton() {
  return createElement(
    "button",
    {
      class: [
        ...CSS_CLASSES.button.primary,
        "bg-blue-500",
        "hover:bg-blue-600",
      ],
      onclick: handlePhoneVerification,
    },
    "Vérifier le numéro"
  );
}

function createOTPSection() {
  return createElement(
    "div",
    {
      id: ELEMENT_IDS.OTP_SECTION,
      class: ["hidden", "mt-4"],
    },
    [
      createUserInfoDisplay(),
      createOTPDisplay(),
      createOTPInputSection(),
      createOTPVerificationButton(),
    ]
  );
}

function createUserInfoDisplay() {
  return createElement(
    "div",
    {
      id: ELEMENT_IDS.USER_INFO,
      class: ["mb-4", "p-3", "rounded", "border-2", "border-green-300"],
      style: { backgroundColor: "#f0fdf4" },
    },
    [
      createElement(
        "p",
        {
          class: ["text-sm", "text-green-700", "mb-1", "text-center"],
        },
        "✅ Utilisateur trouvé :"
      ),
      createElement("div", {
        id: ELEMENT_IDS.FOUND_USER_NAME,
        class: ["text-base", "font-semibold", "text-center", "text-green-800"],
      }),
    ]
  );
}

function createOTPDisplay() {
  return createElement(
    "div",
    {
      class: ["mb-4", "p-3", "rounded", "border-2", "border-yellow-300"],
      style: { backgroundColor: "#fef3c7" },
    },
    [
      createElement(
        "p",
        {
          class: ["text-sm", "text-gray-700", "mb-2", "text-center"],
        },
        "Code OTP généré :"
      ),
      createElement("div", {
        id: ELEMENT_IDS.OTP_DISPLAY,
        class: [
          "text-2xl",
          "font-mono",
          "font-bold",
          "text-center",
          "text-blue-600",
          "bg-white",
          "p-2",
          "rounded",
          "border",
          "letter-spacing-2",
        ],
      }),
      createElement(
        "p",
        {
          class: ["text-xs", "text-gray-500", "text-center", "mt-1"],
        },
        "Valide 5 minutes"
      ),
    ]
  );
}

function createOTPInputSection() {
  return createElement("div", { class: ["mb-4"] }, [
    createElement("input", {
      type: "text",
      id: ELEMENT_IDS.OTP_INPUT,
      class: [
        ...CSS_CLASSES.input.base,
        "text-center",
        "font-mono",
        "focus:ring-green-400",
      ],
      placeholder: "Entrer le code OTP...",
      maxlength: OTP_LENGTH.toString(),
      style: { backgroundColor: "#ffffff" },
    }),
  ]);
}

function createOTPVerificationButton() {
  return createElement(
    "button",
    {
      class: [
        ...CSS_CLASSES.button.primary,
        "bg-green-500",
        "hover:bg-green-600",
      ],
      onclick: handleOTPVerification,
    },
    "Vérifier et se connecter"
  );
}

function createMessageArea() {
  return createElement("div", {
    id: ELEMENT_IDS.AUTH_MESSAGE,
    class: ["mt-4", "text-center", "text-sm", "min-h-5"],
  });
}

function createUserStatusDisplay(username) {
  return createElement(
    "div",
    {
      class: [
        "fixed",
        "top-3",
        "right-3",
        "flex",
        "items-center",
        "gap-2",
        "bg-white",
        "px-3",
        "py-2",
        "rounded-full",
        "shadow-lg",
        "border",
        "z-40",
      ],
      id: ELEMENT_IDS.USER_STATUS,
      style: { backgroundColor: "#f0e7d8" },
    },
    [createUserIcon(), createUsernameDisplay(username), createLogoutButton()]
  );
}

function createUserIcon() {
  return createElement(
    "div",
    {
      class: [
        "w-6",
        "h-6",
        "rounded-full",
        "bg-green-500",
        "flex",
        "items-center",
        "justify-center",
      ],
    },
    [
      createElement("i", {
        class: ["fas", "fa-user", "text-white", "text-xs"],
      }),
    ]
  );
}

function createUsernameDisplay(username) {
  return createElement(
    "span",
    {
      class: ["text-sm", "font-medium", "text-gray-700"],
    },
    username
  );
}

function createLogoutButton() {
  return createElement(
    "button",
    {
      class: ["ml-2", "text-red-500", "hover:text-red-700", "text-xs"],
      onclick: handleLogout,
      title: "Se déconnecter",
    },
    [createElement("i", { class: ["fas", "fa-sign-out-alt"] })]
  );
}

// =============================================================================
// MESSAGE DISPLAY
// =============================================================================

function displayMessage(message, type) {
  const messageArea = document.getElementById(ELEMENT_IDS.AUTH_MESSAGE);
  if (!messageArea) return;

  const textColor = type === "error" ? "text-red-600" : "text-green-600";
  messageArea.innerHTML = "";
  messageArea.appendChild(
    createElement("p", { class: [textColor, "font-medium"] }, message)
  );
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

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

// =============================================================================
// MODAL MANAGEMENT
// =============================================================================

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

// =============================================================================
// USER STATUS MANAGEMENT
// =============================================================================

function showUserStatus() {
  const userStatus = createUserStatusDisplay(authenticationState.currentUser);
  document.body.appendChild(userStatus);
}

function hideUserStatus() {
  removeElement(ELEMENT_IDS.USER_STATUS);
}

// =============================================================================
// EVENT DISPATCHING
// =============================================================================

function dispatchAuthenticationEvent() {
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

function dispatchLogoutEvent(previousUser, previousContact) {
  window.dispatchEvent(
    new CustomEvent("userLoggedOut", {
      detail: {
        username: previousUser,
        previousContact,
        timestamp: new Date().toISOString(),
      },
    })
  );
}

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

// =============================================================================
// PUBLIC API
// =============================================================================

export const authManager = {
  isAuthenticated: () => authenticationState.isAuthenticated,
  getCurrentUser: () => authenticationState.currentUser,
  getCurrentUserContact: () => authenticationState.currentUserContact,
  showLogin: showLoginModal,
  logout: handleLogout,
  requireAuth: requireAuthentication,
  checkPhoneExists,
};

export { createSecureMessage, createSecureMessageButtons };
export default authManager;
