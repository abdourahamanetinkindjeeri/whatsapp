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

export {
  OTP_EXPIRATION_TIME,
  OTP_LENGTH,
  OTP_MIN_VALUE,
  OTP_MAX_VALUE,
  ELEMENT_IDS,
  CSS_CLASSES,
}