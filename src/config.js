// Configuration de l'API
export const API_URL =
  import.meta.env.VITE_API_URL || "https://whatsapp-clone-wmxm.onrender.com";

// Configuration des routes
export const ROUTES = {
  USERS: `${API_URL}/users`,
  MESSAGES: `${API_URL}/messages`,
  USER_MESSAGES: (userId) => `${API_URL}/messages?recipientId=${userId}`,
};

// Configuration de l'application
export const APP_CONFIG = {
  APP_NAME: "WhatsApp Clone",
  VERSION: "1.0.0",
  ENV: import.meta.env.MODE,
};
