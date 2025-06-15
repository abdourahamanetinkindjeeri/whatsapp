// =============================================================================
// UI COMPONENTS BUILDERS
// =============================================================================
import { createElement } from "../../utils/element.js";
import { CSS_CLASSES, ELEMENT_IDS, OTP_LENGTH } from "./constants.js";
import {
  handleLogout,
  handleModalClose,
  handleOTPVerification,
  handlePhoneVerification,
} from "./handlersOtp.js";

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

export {
  createModalOverlay,
  createModalContent,
  createModalHeader,
  createInstructionsSection,
  createPhoneInputSection,
  createPhoneVerificationButton,
  createOTPSection,
  createUsernameDisplay,
  createUserStatusDisplay,
};
