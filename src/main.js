import createSidebar from "./components/Sidebar.js";
import { createElement } from "./utils/element";
import "./assets/css/input.css";
import createDiscussion from "./components/discussion/Discussion.js";
import createMessage from "./components/messages/Message.js";
import { createRegisterModal } from "./components/discussion/contacts/RegisterModal.js";
import createRegisterModalGroups from "./components/discussion/groups/RegisterModalGroups.js";
import { createRegisterForm } from "./components/auth/RegisterForm.js";
import { hideElement, showElement } from "./components/auth/domUtil.js";
import { displayMessage } from "./components/auth/optDisplayMessage.js";
import {
  validateContactForm,
  validateGroupForm,
  handleModalClose,
} from "./eventHandlers.js";
import { authManager } from "./components/auth/authManager.js";
import {
  fetchMessages,
  sendMessage,
  loadContactsData,
} from "./components/auth/accesData.js";

// 🔐 Variables globales pour l'état de l'app
let appInitialized = false;
let appContainer = null;
let currentUserData = null;

// 🆕 NOUVEAU : Fonction pour récupérer les données complètes de l'utilisateur
const getCurrentUserData = () => currentUserData;

// 🆕 NOUVEAU : Écran de connexion obligatoire
const createWelcomeScreen = () => {
  let formContainer = createElement("div", {
    id: "formContainer",
    class: ["mt-6"],
  });

  function showLogin() {
    formContainer.innerHTML = "";
    authManager.showLogin();
    // The login modal will be handled by authManager
  }

  function showRegister() {
    formContainer.innerHTML = "";
    const registerForm = createRegisterForm((newUser) => {
      displayMessage(
        `Bienvenue ${newUser.prenom} ! Vous pouvez maintenant vous connecter.`,
        "success"
      );
      showLogin();
    });
    // Add a 'Retour' button
    const backBtn = createElement(
      "button",
      {
        type: "button",
        class: [
          "mt-4",
          "w-full",
          "bg-gray-300",
          "text-gray-800",
          "py-2",
          "px-4",
          "rounded-md",
          "hover:bg-gray-400",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-gray-500",
          "focus:ring-offset-2",
        ],
        onclick: showLogin,
      },
      "⬅️ Retour"
    );
    formContainer.appendChild(registerForm);
    formContainer.appendChild(backBtn);
  }

  // Main welcome layout
  const welcomeScreen = createElement(
    "div",
    {
      class: ["flex", "items-center", "justify-center", "w-full", "h-screen"],
      style: { backgroundColor: "#f0f6f0" },
      "data-screen": "welcome",
    },
    [
      createElement(
        "div",
        {
          class: [
            "text-center",
            "p-10",
            "bg-white",
            "rounded-2xl",
            "shadow-2xl",
            "max-w-md",
            "w-full",
            "border",
            "border-gray-100",
          ],
        },
        [
          createElement("div", { class: ["mb-6"] }, [
            createElement("i", {
              class: [
                "fas",
                "fa-comments",
                "text-6xl",
                "text-blue-500",
                "mb-4",
              ],
            }),
          ]),
          createElement(
            "h1",
            { class: ["text-3xl", "font-bold", "text-gray-800", "mb-2"] },
            "Bienvenue !"
          ),
          createElement(
            "p",
            { class: ["text-gray-600", "mb-6"] },
            "Veuillez choisir une option pour continuer :"
          ),
          createElement(
            "div",
            { class: ["flex", "justify-center", "space-x-4", "mb-6"] },
            [
              createElement(
                "button",
                {
                  id: "loginButton",
                  class: [
                    "bg-blue-500",
                    "text-white",
                    "px-8",
                    "py-3",
                    "rounded-full",
                    "text-lg",
                    "font-medium",
                    "hover:bg-blue-600",
                    "transition",
                    "shadow-lg",
                    "hover:shadow-xl",
                  ],
                  onclick: showLogin,
                },
                "🔐 Se connecter"
              ),
              createElement(
                "button",
                {
                  id: "registerButton",
                  class: [
                    "bg-green-500",
                    "text-white",
                    "px-8",
                    "py-3",
                    "rounded-full",
                    "text-lg",
                    "font-medium",
                    "hover:bg-green-600",
                    "transition",
                    "shadow-lg",
                    "hover:shadow-xl",
                  ],
                  onclick: showRegister,
                },
                "➕ Créer un compte"
              ),
            ]
          ),
          formContainer,
          createElement(
            "div",
            { class: ["mt-4", "text-sm", "text-gray-500"] },
            [
              createElement("p", {}, "Système d'authentification sécurisé"),
              createElement("p", {}, "avec code OTP"),
            ]
          ),
        ]
      ),
    ]
  );

  // Show login by default
  setTimeout(showLogin, 0);

  return welcomeScreen;
};

const initSecureApp = async () => {
  try {
    const {
      body: discussion,
      update: updateDiscussionList,
      updateContactList,
      updateGroupsList,
    } = createDiscussion();

    const app = createElement(
      "div",
      { class: ["flex", "w-[95vw]", "h-[95vh]", "bg-white"] },
      [
        createSidebar(updateContactList, updateGroupsList),
        discussion,
        createMessage(),
      ]
    );

    // Création et ajout des modales
    const contactModal = await createRegisterModal(validateContactForm);
    const groupModal = await createRegisterModalGroups(() =>
      validateGroupForm(updateDiscussionList)
    );

    // Ajout des éléments au DOM
    document.body.appendChild(app);
    document.body.appendChild(contactModal);
    document.body.appendChild(groupModal);

    // Initialisation des listes avec les nouvelles fonctions
    try {
      const { users } = await loadContactsData();
      updateContactList(users);
    } catch (error) {
      console.error("Erreur lors du chargement des contacts:", error);
    }

    window.addEventListener("click", handleModalClose);

    // Marquer l'app comme initialisée
    appInitialized = true;
    appContainer = app;

    console.log("✅ Application sécurisée initialisée");
    console.log("👤 Utilisateur connecté:", getCurrentUserData());
  } catch (error) {
    console.error("Erreur lors de l'initialisation de l'application:", error);
  }
};

// 🆕 NOUVEAU : Gestionnaire de l'état d'authentification
const handleAuthenticationState = () => {
  window.addEventListener("userAuthenticated", (event) => {
    const { username, id, phone, fullContact } = event.detail;
    currentUserData = {
      name: username,
      id: id,
      phone: phone,
      fullContact: fullContact,
      connectedAt: new Date().toISOString(),
    };

    console.log(`🎉 Utilisateur connecté: ${username}`);
    console.log(`📱 Téléphone: ${phone || "Non spécifié"}`);
    console.log(`🆔 ID: ${id || "Non spécifié"}`);
    console.log(`📊 Données complètes:`, currentUserData);

    // Supprimer l'écran de bienvenue
    const welcomeScreen = document.querySelector('[data-screen="welcome"]');
    if (welcomeScreen) welcomeScreen.remove();

    // Initialiser l'application si pas déjà fait
    if (!appInitialized) {
      initSecureApp();
    } else if (appContainer) {
      appContainer.style.display = "flex";
    }
  });

  window.addEventListener("userLoggedOut", (event) => {
    const { username, timestamp } = event.detail;
    console.log(`👋 Utilisateur déconnecté: ${username}`);
    console.log(`⏰ Heure de déconnexion: ${timestamp}`);
    currentUserData = null;

    if (appContainer) appContainer.style.display = "none";

    const welcomeScreen = createWelcomeScreen();
    document.body.appendChild(welcomeScreen);
  });
};

// 🆕 NOUVEAU : Fonction d'initialisation principale
const initApp = () => {
  document.body.style.backgroundColor = "white";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.fontFamily = "system-ui, -apple-system, sans-serif";

  handleAuthenticationState();

  if (authManager.isAuthenticated()) {
    console.log("🔄 Utilisateur déjà connecté, chargement de l'app...");
    const username = authManager.getCurrentUser();
    const userContact = authManager.getCurrentUserContact();
    currentUserData = {
      name: username,
      id: userContact?.id || null,
      phone: userContact?.phone || null,
      fullContact: userContact,
      connectedAt: new Date().toISOString(),
    };
    console.log("👤 Données utilisateur récupérées:", currentUserData);
    initSecureApp();
  } else {
    console.log(
      "🔐 Utilisateur non connecté, affichage de l'écran de connexion"
    );
    document.body.appendChild(createWelcomeScreen());
  }

  const statusIndicator = createElement(
    "div",
    {
      // class: [
      //   "fixed",
      //   "bottom-4",
      //   "left-4",
      //   "bg-gray-800",
      //   "text-white",
      //   "px-3",
      //   "py-1",
      //   "rounded-full",
      //   "text-xs",
      //   "z-50",
      //   "transition",
      //   "cursor-pointer",
      // ],
      // id: "connectionStatus",
      // title: "Cliquez pour voir les détails",
    }
    // "🔒 Non connecté"
  );

  statusIndicator.onclick = () => {
    if (currentUserData) {
      console.group("👤 Informations utilisateur connecté");
      console.log("Nom:", currentUserData.name);
      console.log("Téléphone:", currentUserData.phone || "Non spécifié");
      console.log("ID:", currentUserData.id || "Non spécifié");
      console.log("Connecté depuis:", currentUserData.connectedAt);
      console.groupEnd();
    } else {
      console.log("❌ Aucun utilisateur connecté");
    }
  };

  document.body.appendChild(statusIndicator);

  const updateStatusIndicator = () => {
    const indicator = document.getElementById("connectionStatus");
    if (!indicator) return;

    if (authManager.isAuthenticated() && currentUserData) {
      const displayName = currentUserData.name || authManager.getCurrentUser();
      indicator.textContent = `✅ ${displayName}`;
      indicator.className = indicator.className.replace(
        "bg-gray-800",
        "bg-green-600"
      );
    } else {
      indicator.textContent = "🔒 Non connecté";
      indicator.className = indicator.className.replace(
        "bg-green-600",
        "bg-gray-800"
      );
    }
  };

  window.addEventListener("userAuthenticated", updateStatusIndicator);
  window.addEventListener("userLoggedOut", updateStatusIndicator);
  updateStatusIndicator();
};

const getFullUserInfoFromDB = (username) => {
  if (!username) return null;
  try {
    const data = JSON.parse(localStorage.getItem("data") || "{}");
    const users = data.users || [];
    const user = users.find((u) => {
      const userName = u.name || u.nom || "";
      return userName === username && u.delete === false && u.archive === false;
    });

    if (user) {
      return {
        name: user.name || user.nom,
        phone: user.telephone || user.phone,
        id: user.id,
        email: user.email || null,
        connectedAt: new Date().toISOString(),
        originalData: user,
      };
    }
    return {
      name: username,
      connectedAt: new Date().toISOString(),
      phone: null,
      id: null,
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des données utilisateur:",
      error
    );
    return {
      name: username,
      connectedAt: new Date().toISOString(),
      phone: null,
      id: null,
    };
  }
};

const getUserInfo = () => ({
  isAuthenticated: authManager.isAuthenticated(),
  userData: currentUserData,
  username: authManager.getCurrentUser(),
  phone: currentUserData?.phone || null,
  id: currentUserData?.id || null,
});

const logUserAction = (action, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    user: userData?.name || "Inconnu",
    userId: userData?.id || null,
    action: action,
    details: details,
  };

  try {
    const logs = JSON.parse(localStorage.getItem("userActionLogs") || "[]");
    logs.push(logEntry);
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    localStorage.setItem("userActionLogs", JSON.stringify(logs));
  } catch (error) {
    console.warn("⚠️ Impossible de sauvegarder le log:", error);
  }
};

// 🚀 LANCEMENT DE L'APPLICATION
document.addEventListener("DOMContentLoaded", () => {
  initApp();

  // Recherche sécurisée
  const waitForSearch = () => {
    const search = document.querySelector("#search");
    if (search) {
      const originalEventListener = search.addEventListener;
      search.addEventListener = function (event, handler) {
        const secureHandler = (e) => {
          authManager.requireAuth(() => {
            logUserAction("Recherche", { query: e.target.value });
            handler(e);
          });
        };
        originalEventListener.call(this, event, secureHandler);
      };
    } else {
      setTimeout(waitForSearch, 100);
    }
  };
  waitForSearch();
});

export {
  getCurrentUserData,
  getUserInfo,
  logUserAction,
  getFullUserInfoFromDB,
};
export default initApp;
