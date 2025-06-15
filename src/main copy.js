import createSidebar from "./components/Sidebar.js";
import { createElement } from "./utils/element";
import "./assets/css/input.css";
import createDiscussion from "./components/discussion/Discussion.js";
import createMessage from "./components/messages/Message.js";
import createRegisterModalGroups from "./components/discussion/groups/RegisterModalGroups.js";
import { handleModalClose } from "./eventHandlers.js";

// 🆕 NOUVEAU : Import du système d'authentification
import { authManager } from "./components/auth/authManager.js"; // Ajustez le chemin selon votre structure

// 🔐 Variables globales pour l'état de l'app
let appInitialized = false;
let appContainer = null;
let currentUserData = null; // 🆕 NOUVEAU : Stocker les données utilisateur complètes

// 🆕 NOUVEAU : Fonction pour récupérer les données complètes de l'utilisateur
const getCurrentUserData = () => {
  return currentUserData;
};

// 🆕 NOUVEAU : Écran de connexion obligatoire
const createWelcomeScreen = () =>
  createElement(
    "div",
    {
      class: ["flex", "items-center", "justify-center", "w-full", "h-screen"],
      style: { backgroundColor: "#f0f6f0" },
    },
    [
      createElement(
        "div",
        {
          class: [
            "text-center",
            "p-8",
            "bg-white",
            "rounded-lg",
            "shadow-xl",
            "max-w-md",
          ],
        },
        [
          createElement(
            "div",
            {
              class: ["mb-6"],
            },
            [
              createElement("i", {
                class: [
                  "fas",
                  "fa-comments",
                  "text-6xl",
                  "text-blue-500",
                  "mb-4",
                ],
              }),
            ]
          ),
          createElement(
            "h1",
            {
              class: ["text-3xl", "font-bold", "text-gray-800", "mb-4"],
            },
            "Bienvenue dans l'Application"
          ),
          createElement(
            "p",
            {
              class: ["text-gray-600", "mb-6"],
            },
            "Connectez-vous pour accéder à vos messages et discussions"
          ),
          createElement(
            "button",
            {
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
              onclick: () => authManager.showLogin(),
            },
            "🔐 Se connecter"
          ),
          createElement(
            "div",
            {
              class: ["mt-4", "text-sm", "text-gray-500"],
            },
            [
              createElement("p", {}, "Système d'authentification sécurisé"),
              createElement("p", {}, "avec code OTP"),
            ]
          ),
        ]
      ),
    ]
  );

// 🔄 VOTRE FONCTION INITAPP MODIFIÉE
const initSecureApp = () => {
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

  // Modals
  const contactModal = createRegisterModalGroups(() =>
    validateForm(updateDiscussionList)
  );
  const groupModal = createRegisterModalGroups(() =>
    validateGroupForm(updateDiscussionList)
  );

  document.body.appendChild(app);
  document.body.appendChild(contactModal);
  document.body.appendChild(groupModal);

  window.addEventListener("click", handleModalClose);

  // Marquer l'app comme initialisée
  appInitialized = true;
  appContainer = app;

  console.log("✅ Application sécurisée initialisée");
  console.log("👤 Utilisateur connecté:", getCurrentUserData());
};

// 🆕 NOUVEAU : Gestionnaire de l'état d'authentification
const handleAuthenticationState = () => {
  // Écouter la connexion réussie
  window.addEventListener("userAuthenticated", (event) => {
    const { username, id, phone, fullContact } = event.detail;

    // 🆕 NOUVEAU : Stocker les données utilisateur complètes
    currentUserData = {
      name: username,
      id: id,
      phone: phone,
      fullContact: fullContact, // 🆕 Données complètes du contact
      connectedAt: new Date().toISOString(),
    };

    console.log(`🎉 Utilisateur connecté: ${username}`);
    console.log(`📱 Téléphone: ${phone || "Non spécifié"}`);
    console.log(`🆔 ID: ${id || "Non spécifié"}`);
    console.log(`📊 Données complètes:`, currentUserData);

    // Supprimer l'écran de bienvenue
    const welcomeScreen = document.querySelector('[data-screen="welcome"]');
    if (welcomeScreen) {
      welcomeScreen.remove();
    }

    // Initialiser l'application principale si pas déjà fait
    if (!appInitialized) {
      initSecureApp();
    } else if (appContainer) {
      // Réafficher l'app si elle était cachée
      appContainer.style.display = "flex";
    }
  });

  // Écouter la déconnexion
  window.addEventListener("userLoggedOut", (event) => {
    const { username, timestamp } = event.detail;

    console.log(`👋 Utilisateur déconnecté: ${username}`);
    console.log(`⏰ Heure de déconnexion: ${timestamp}`);

    // 🆕 NOUVEAU : Nettoyer les données utilisateur
    currentUserData = null;

    // Cacher l'application principale
    if (appContainer) {
      appContainer.style.display = "none";
    }

    // Réafficher l'écran de bienvenue
    const welcomeScreen = createWelcomeScreen();
    welcomeScreen.setAttribute("data-screen", "welcome");
    document.body.appendChild(welcomeScreen);
  });
};

// 🆕 NOUVEAU : Fonction d'initialisation principale
const initApp = () => {
  // Configurer les styles de base
  document.body.style.backgroundColor = "white";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.fontFamily = "system-ui, -apple-system, sans-serif";

  // Configurer les gestionnaires d'authentification
  handleAuthenticationState();

  // Vérifier si déjà connecté (pour les rechargements de page)
  if (authManager.isAuthenticated()) {
    console.log("🔄 Utilisateur déjà connecté, chargement de l'app...");

    // 🆕 NOUVEAU : Récupérer les données utilisateur depuis authManager
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
    // Afficher l'écran de bienvenue
    const welcomeScreen = createWelcomeScreen();
    welcomeScreen.setAttribute("data-screen", "welcome");
    document.body.appendChild(welcomeScreen);
  }

  // Ajouter un indicateur de statut de connexion discret
  const statusIndicator = createElement(
    "div",
    {
      class: [
        "fixed",
        "bottom-4",
        "left-4",
        "bg-gray-800",
        "text-white",
        "px-3",
        "py-1",
        "rounded-full",
        "text-xs",
        "z-50",
        "transition",
        "cursor-pointer",
      ],
      id: "connectionStatus",
      title: "Cliquez pour voir les détails",
    },
    "🔒 Non connecté"
  );

  // 🆕 NOUVEAU : Clic sur l'indicateur pour afficher les détails
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

  // Mettre à jour l'indicateur selon l'état
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

  // Écouter les changements d'état pour mettre à jour l'indicateur
  window.addEventListener("userAuthenticated", updateStatusIndicator);
  window.addEventListener("userLoggedOut", updateStatusIndicator);

  // Initialiser l'indicateur
  updateStatusIndicator();
};

// 🆕 NOUVEAU : Fonction pour récupérer les données complètes depuis la base
const getFullUserInfoFromDB = (username) => {
  if (!username) return null;

  try {
    const data = JSON.parse(localStorage.getItem("data") || "{}");
    const users = data.users || [];

    // Rechercher l'utilisateur dans la base
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
        // Ajoutez d'autres champs selon votre structure
        originalData: user, // Garder une référence aux données originales
      };
    }

    // Si pas trouvé dans la base, retourner les infos minimales
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

// 🆕 NOUVEAU : Fonctions utilitaires pour accéder aux données utilisateur
const getUserInfo = () => {
  return {
    isAuthenticated: authManager.isAuthenticated(),
    userData: currentUserData,
    username: authManager.getCurrentUser(),
    phone: currentUserData?.phone || null,
    id: currentUserData?.id || null,
  };
};

// 🆕 NOUVEAU : Fonction pour logger les actions utilisateur
const logUserAction = (action, details = {}) => {
  const userData = getCurrentUserData();
  const logEntry = {
    timestamp: new Date().toISOString(),
    user: userData?.name || "Inconnu",
    userId: userData?.id || null,
    action: action,
    details: details,
  };

  console.log(
    `📝 Action: ${action} par ${userData?.name || "Utilisateur inconnu"}`,
    logEntry
  );

  // Optionnel: sauvegarder dans localStorage pour historique
  try {
    const logs = JSON.parse(localStorage.getItem("userActionLogs") || "[]");
    logs.push(logEntry);

    // Garder seulement les 100 dernières actions
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }

    localStorage.setItem("userActionLogs", JSON.stringify(logs));
  } catch (error) {
    console.warn("⚠️ Impossible de sauvegarder le log:", error);
  }
};

// 🆕 NOUVEAU : Fonctions utilitaires (à définir selon vos besoins)
const validateForm = (updateCallback) => {
  logUserAction("Validation formulaire contact");
  console.log("Validation du formulaire contact");
  // Votre logique de validation existante
  if (updateCallback) updateCallback();
};

const validateGroupForm = (updateCallback) => {
  logUserAction("Validation formulaire groupe");
  console.log("Validation du formulaire groupe");
  // Votre logique de validation existante
  if (updateCallback) updateCallback();
};

// 🚀 LANCEMENT DE L'APPLICATION
initApp();

// 🔍 VOTRE RECHERCHE EXISTANTE (sécurisée)
document.addEventListener("DOMContentLoaded", () => {
  // Attendre que l'élément search existe
  const waitForSearch = () => {
    const search = document.querySelector("#search");
    if (search) {
      // Sécuriser la recherche
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
      // Réessayer dans 100ms si l'élément n'existe pas encore
      setTimeout(waitForSearch, 100);
    }
  };

  waitForSearch();
});

// 🆕 NOUVEAU : API publique pour accéder aux données utilisateur
export {
  getCurrentUserData,
  getUserInfo,
  logUserAction,
  getFullUserInfoFromDB,
};

export default initApp;
