import { createElement } from "../../utils/element.js";

/**
 * @typedef {Object} Contact
 * @property {string} name - Nom de l'utilisateur.
 * @property {string} phone - Numéro de téléphone.
 * @property {string|null} id - Identifiant du contact.
 * @property {string|null} email - Adresse email.
 * @property {Object} originalData - Données originales du contact.
 * @property {string|null} address - Adresse du contact.
 * @property {string|null} company - Entreprise du contact.
 * @property {string|null} notes - Notes associées au contact.
 */

/** @type {boolean} */
let isAuthenticated = false;
/** @type {string|null} */
let currentUser = null;
/** @type {Contact|null} */
let currentUserContact = null;
/** @type {string|null} */
let generatedOTP = null;
/** @type {number|null} */
let otpExpirationTime = null;

/**
 * Récupère les données depuis le stockage local.
 * @returns {Object} Données parsées ou objet vide.
 */
function loadData() {
  const data = localStorage.getItem("data");
  return data ? JSON.parse(data) : {};
}

/**
 * Normalise un numéro de téléphone pour la comparaison.
 * @param {string} phone - Numéro de téléphone à normaliser.
 * @returns {string} Numéro normalisé.
 */
function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/[\s\-\(\)\.\+]/g, "").toLowerCase();
}

/**
 * Vérifie si un numéro existe dans les contacts actifs.
 * @param {string} phone - Numéro de téléphone à vérifier.
 * @returns {{ exists: boolean, contact: Contact|null, error?: string }} Résultat de la vérification.
 */
function checkPhoneExists(phone) {
  const contacts = (loadData().users || []).filter(
    (item) => !item.delete && !item.archive
  );
  const normalizedInput = normalizePhoneNumber(phone);

  if (!normalizedInput) {
    return { exists: false, contact: null, error: "Numéro invalide" };
  }

  const matchingContact = contacts.find((contact) => {
    const contactPhone = contact.telephone || contact.phone || "";
    return normalizePhoneNumber(contactPhone) === normalizedInput;
  });

  if (!matchingContact) {
    return {
      exists: false,
      contact: null,
      error: "Numéro non trouvé dans les contacts",
    };
  }

  return {
    exists: true,
    contact: {
      name: matchingContact.name || matchingContact.nom || "Utilisateur",
      phone: matchingContact.telephone || matchingContact.phone,
      id: matchingContact.id || null,
      email: matchingContact.email || null,
      originalData: matchingContact,
      address: matchingContact.address || matchingContact.adresse || null,
      company: matchingContact.company || matchingContact.entreprise || null,
      notes: matchingContact.notes || matchingContact.remarques || null,
    },
  };
}

/**
 * Génère un OTP à 6 chiffres.
 * @returns {string} Code OTP généré.
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Vérifie si l'OTP est encore valide (5 minutes).
 * @returns {boolean} Validité de l'OTP.
 */
function isOTPValid() {
  return otpExpirationTime && Date.now() < otpExpirationTime;
}

/**
 * Crée une modale de connexion.
 * @returns {HTMLElement} Élément de la modale.
 */
function createLoginModal() {
  return createElement(
    "div",
    {
      class: [
        "fixed",
        "inset-0",
        "bg-black",
        "bg-opacity-50",
        "flex",
        "items-center",
        "justify-center",
        "z-50",
      ],
      id: "loginModal",
    },
    [
      createElement(
        "div",
        {
          class: ["bg-white", "rounded-lg", "shadow-xl", "w-96", "p-6"],
          style: { backgroundColor: "#f9fafb" },
        },
        [
          createElement(
            "div",
            {
              class: [
                "flex",
                "justify-between",
                "items-center",
                "mb-6",
                "pb-3",
                "border-b",
                "border-gray-200",
              ],
            },
            [
              createElement(
                "h2",
                { class: ["text-xl", "font-semibold", "text-gray-800"] },
                "Connexion sécurisée"
              ),
              createElement(
                "button",
                {
                  class: ["text-gray-400", "hover:text-gray-600"],
                  onclick: closeLoginModal,
                },
                [createElement("i", { class: ["fas", "fa-times"] })]
              ),
            ]
          ),
          createElement(
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
                { class: ["text-sm", "text-blue-800", "text-center"] },
                "Entrez votre numéro de téléphone pour recevoir un code OTP"
              ),
            ]
          ),
          createElement("div", { class: ["mb-4"] }, [
            createElement("input", {
              type: "tel",
              id: "phoneInput",
              class: [
                "w-full",
                "h-9",
                "rounded-full",
                "border",
                "border-gray-300",
                "px-3",
                "text-sm",
                "focus:outline-none",
                "focus:ring-1",
                "focus:ring-blue-400",
              ],
              placeholder: "Ex: +221 77 123 45 67",
              style: { backgroundColor: "#ffffff" },
            }),
          ]),
          createAuthButton(
            "Vérifier le numéro",
            "blue-500",
            "blue-600",
            checkPhoneHandler
          ),
          createElement(
            "div",
            { id: "otpSection", class: ["hidden", "mt-4"] },
            [
              createElement(
                "div",
                {
                  id: "userInfo",
                  class: [
                    "mb-4",
                    "p-3",
                    "rounded",
                    "border-2",
                    "border-green-300",
                  ],
                  style: { backgroundColor: "#f0fdf4" },
                },
                [
                  createElement(
                    "p",
                    {
                      class: [
                        "text-sm",
                        "text-green-700",
                        "mb-1",
                        "text-center",
                      ],
                    },
                    "✅ Utilisateur trouvé :"
                  ),
                  createElement("div", {
                    id: "foundUserName",
                    class: [
                      "text-base",
                      "font-semibold",
                      "text-center",
                      "text-green-800",
                    ],
                  }),
                ]
              ),
              createElement(
                "div",
                {
                  class: [
                    "mb-4",
                    "p-3",
                    "rounded",
                    "border-2",
                    "border-yellow-300",
                  ],
                  style: { backgroundColor: "#fef3c7" },
                },
                [
                  createElement(
                    "p",
                    {
                      class: [
                        "text-sm",
                        "text-gray-700",
                        "mb-2",
                        "text-center",
                      ],
                    },
                    "Code OTP généré :"
                  ),
                  createElement("div", {
                    id: "otpDisplay",
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
                      class: [
                        "text-xs",
                        "text-gray-500",
                        "text-center",
                        "mt-1",
                      ],
                    },
                    "Valide 5 minutes"
                  ),
                ]
              ),
              createElement("div", { class: ["mb-4"] }, [
                createElement("input", {
                  type: "text",
                  id: "otpInput",
                  class: [
                    "w-full",
                    "h-9",
                    "rounded-full",
                    "border",
                    "border-gray-300",
                    "px-3",
                    "text-sm",
                    "text-center",
                    "font-mono",
                    "focus:outline-none",
                    "focus:ring-1",
                    "focus:ring-green-400",
                  ],
                  placeholder: "Entrer le code OTP...",
                  maxlength: "6",
                  style: { backgroundColor: "#ffffff" },
                }),
              ]),
              createAuthButton(
                "Vérifier et se connecter",
                "green-500",
                "green-600",
                verifyOTPHandler
              ),
            ]
          ),
          createElement("div", {
            id: "authMessage",
            class: ["mt-4", "text-center", "text-sm", "min-h-5"],
          }),
        ]
      ),
    ]
  );
}

/**
 * Crée un bouton d'authentification stylisé.
 * @param {string} text - Texte du bouton.
 * @param {string} bgColor - Couleur de fond.
 * @param {string} hoverColor - Couleur au survol.
 * @param {Function} onClick - Gestionnaire d'événement.
 * @returns {HTMLElement} Élément du bouton.
 */
function createAuthButton(text, bgColor, hoverColor, onClick) {
  return createElement(
    "button",
    {
      class: [
        "w-full",
        "h-9",
        `bg-${bgColor}`,
        "text-white",
        "rounded-full",
        "text-sm",
        "font-medium",
        `hover:bg-${hoverColor}`,
        "transition",
        "flex",
        "items-center",
        "justify-center",
      ],
      onclick: onClick,
    },
    text
  );
}

/**
 * Crée l'interface de statut utilisateur.
 * @returns {HTMLElement} Élément du statut utilisateur.
 */
function createUserStatus() {
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
      id: "userStatus",
      style: { backgroundColor: "#f0e7d8" },
    },
    [
      createElement(
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
      ),
      createElement(
        "span",
        { class: ["text-sm", "font-medium", "text-gray-700"] },
        currentUser
      ),
      createElement(
        "button",
        {
          class: ["ml-2", "text-red-500", "hover:text-red-700", "text-xs"],
          onclick: handleLogout,
          title: "Se déconnecter",
        },
        [createElement("i", { class: ["fas", "fa-sign-out-alt"] })]
      ),
    ]
  );
}

/**
 * Gère la vérification du numéro de téléphone.
 */
function checkPhoneHandler() {
  const phoneInput = document.getElementById("phoneInput");
  const phoneNumber = phoneInput?.value?.trim() || "";

  if (!phoneNumber) {
    showAuthMessage("Veuillez entrer un numéro de téléphone", "error");
    return;
  }

  const phoneCheck = checkPhoneExists(phoneNumber);

  if (!phoneCheck.exists) {
    showAuthMessage(
      phoneCheck.error || "Numéro non trouvé dans les contacts",
      "error"
    );
    return;
  }

  currentUserContact = phoneCheck.contact;
  currentUser = phoneCheck.contact.name;
  generatedOTP = generateOTP();
  otpExpirationTime = Date.now() + 5 * 60 * 1000;

  const foundUserName = document.getElementById("foundUserName");
  if (foundUserName) {
    foundUserName.textContent = currentUserContact.name;
  }

  const otpDisplay = document.getElementById("otpDisplay");
  if (otpDisplay) {
    otpDisplay.textContent = generatedOTP;
  }

  const otpSection = document.getElementById("otpSection");
  if (otpSection) {
    otpSection.classList.remove("hidden");
  }

  showAuthMessage(`OTP généré pour ${currentUserContact.name}`, "success");

  setTimeout(() => {
    const otpInput = document.getElementById("otpInput");
    if (otpInput) {
      otpInput.focus();
    }
  }, 100);
}

/**
 * Gère la vérification de l'OTP.
 */
function verifyOTPHandler() {
  const enteredOTP = document.getElementById("otpInput")?.value?.trim() || "";

  if (!enteredOTP) {
    showAuthMessage("Veuillez entrer le code OTP", "error");
    return;
  }

  if (!isOTPValid()) {
    showAuthMessage("Code OTP expiré", "error");
    resetOTPSection();
    return;
  }

  if (enteredOTP === generatedOTP) {
    isAuthenticated = true;

    if (!currentUser || !currentUserContact) {
      const phoneInput = document.getElementById("phoneInput");
      const phoneNumber = phoneInput?.value?.trim() || "";
      if (phoneNumber) {
        const phoneCheck = checkPhoneExists(phoneNumber);
        if (phoneCheck.exists) {
          currentUser = phoneCheck.contact.name;
          currentUserContact = phoneCheck.contact;
        }
      }
    }

    showAuthMessage("Connexion réussie !", "success");

    setTimeout(() => {
      closeLoginModal();
      document.body.appendChild(createUserStatus());
      window.dispatchEvent(
        new CustomEvent("userAuthenticated", {
          detail: {
            username: currentUser,
            id: currentUserContact?.id || null,
            phone: currentUserContact?.phone || null,
            fullContact: currentUserContact,
          },
        })
      );
    }, 500);
  } else {
    showAuthMessage("Code OTP incorrect", "error");
  }
}

/**
 * Gère la déconnexion de l'utilisateur.
 */
function handleLogout() {
  const previousUser = currentUser;
  const previousContact = currentUserContact;

  isAuthenticated = false;
  currentUser = null;
  currentUserContact = null;
  generatedOTP = null;
  otpExpirationTime = null;

  const userStatus = document.getElementById("userStatus");
  if (userStatus) {
    userStatus.remove();
  }

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

/**
 * Affiche un message d'authentification.
 * @param {string} message - Message à afficher.
 * @param {"success"|"error"} type - Type de message.
 */
function showAuthMessage(message, type) {
  const messageArea = document.getElementById("authMessage");
  if (!messageArea) return;

  const textColor = type === "error" ? "text-red-600" : "text-green-600";
  messageArea.innerHTML = "";
  messageArea.appendChild(
    createElement("p", { class: [textColor, "font-medium"] }, message)
  );
}

/**
 * Réinitialise la section OTP.
 */
function resetOTPSection() {
  generatedOTP = null;
  otpExpirationTime = null;

  const otpSection = document.getElementById("otpSection");
  const otpInput = document.getElementById("otpInput");
  const phoneInput = document.getElementById("phoneInput");

  if (otpSection) {
    otpSection.classList.add("hidden");
  }
  if (otpInput) {
    otpInput.value = "";
  }
  if (phoneInput) {
    phoneInput.value = "";
  }
}

/**
 * Ferme la modale de connexion.
 */
function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    generatedOTP = null;
    otpExpirationTime = null;
    if (!isAuthenticated) {
      currentUser = null;
      currentUserContact = null;
    }
    modal.remove();
  }
}

/**
 * Affiche la modale de connexion si non authentifié.
 */
function showLoginModal() {
  if (!isAuthenticated) {
    document.body.appendChild(createLoginModal());
  }
}

/**
 * Crée des boutons de message sécurisés.
 * @returns {HTMLElement} Liste de boutons sécurisés.
 */
function createSecureMessageButtons() {
  return createElement("ul", { class: ["flex", "gap-x-2", "items-center"] }, [
    createSecureButton("fa-delete-left", "red-500", "red-300", () =>
      console.log("Supprimer - action sécurisée")
    ),
    createSecureButton("fa-box-archive", "gray-400", "gray-400", () => {
      const selected = getSelectedContacts().map(Number);
      if (selected.length === 0) {
        console.log("Aucun contact sélectionné.");
        return;
      }

      const isArchiving = archiveContacts(selected);
      if (isArchiving) {
        console.info("Contacts archivés avec succès !");
        updateContactList();
      } else {
        console.info("Contacts désarchivés avec succès !");
        updateContactListArchive();
      }

      resetSelectedContacts();
    }),
    createSecureButton("fa-square", "gray-700", "gray-600", () =>
      console.log("Marquer - action sécurisée")
    ),
    createSecureButton("fa-trash", "red-600", "red-600", () =>
      console.log("Corbeille - action sécurisée")
    ),
  ]);
}

/**
 * Crée un bouton sécurisé stylisé.
 * @param {string} iconClass - Classe de l'icône.
 * @param {string} textColor - Couleur du texte.
 * @param {string} borderColor - Couleur de la bordure.
 * @param {Function} secureAction - Action sécurisée à exécuter.
 * @returns {HTMLElement} Élément du bouton sécurisé.
 */
function createSecureButton(iconClass, textColor, borderColor, secureAction) {
  return createElement(
    "li",
    {},
    createElement(
      "button",
      {
        class: [
          "w-9",
          "h-9",
          "border-2",
          `border-${borderColor}`,
          "rounded-full",
          "flex",
          "items-center",
          "justify-center",
          "transition",
          "hover:bg-gray-100",
          "hover:scale-105",
          "cursor-pointer",
        ],
        onclick: () => requireAuth(secureAction),
      },
      [
        createElement("i", {
          class: [
            "block",
            "text-sm",
            "fa-solid",
            iconClass,
            `text-${textColor}`,
          ],
        }),
      ]
    ),
    true
  );
}

/**
 * Exige une authentification pour exécuter une action.
 * @param {Function} action - Action à exécuter si authentifié.
 */
function requireAuth(action) {
  if (isAuthenticated) {
    action();
  } else {
    showLoginModal();
  }
}

/**
 * Crée une interface de message sécurisée.
 * @returns {HTMLElement} Interface de message sécurisée.
 */
function createSecureMessage() {
  return createElement(
    "div",
    { class: ["flex", "flex-col", "w-2/3", "h-screen"] },
    [
      createElement(
        "div",
        {
          class: ["h-10", "flex", "justify-between", "items-center", "px-3"],
          style: { backgroundColor: "#f0e7d8" },
        },
        [
          createElement("div", {
            class: [
              "w-8",
              "h-8",
              "rounded-full",
              "border-2",
              "border-gray-500",
              "bg-gray-200",
            ],
          }),
          createSecureMessageButtons(),
        ]
      ),
      createElement(
        "div",
        { class: ["flex-1"], style: { backgroundColor: "#f0f6f0" } },
        `Interface sécurisée - Connecté comme: ${currentUser || "Non connecté"}`
      ),
      createElement(
        "div",
        { class: ["my-2", "px-3", "flex", "items-center", "gap-2"] },
        [
          createElement("input", {
            type: "text",
            class: [
              "flex-1",
              "h-9",
              "rounded-full",
              "border",
              "border-gray-300",
              "px-3",
              "text-sm",
              "focus:outline-none",
              "focus:ring-1",
              "focus:ring-blue-gray-400",
            ],
            id: "inputMessage",
            placeholder: "Écrire un message...",
            style: { backgroundColor: "#f9fafb" },
          }),
          createElement(
            "button",
            {
              class: [
                "w-9",
                "h-9",
                "bg-green-500",
                "rounded-full",
                "flex",
                "items-center",
                "justify-center",
                "text-white",
                "hover:bg-green-600",
              ],
              id: "envoyer",
              onclick: () =>
                requireAuth(() =>
                  console.log("Message envoyé par:", currentUser)
                ),
            },
            [
              createElement("i", {
                class: ["fas", "fa-arrow-right", "text-sm"],
              }),
            ]
          ),
        ]
      ),
    ]
  );
}

/**
 * Gestionnaire d'authentification.
 * @type {Object}
 * @property {Function} isAuthenticated - Vérifie si l'utilisateur est authentifié.
 * @property {Function} getCurrentUser - Récupère le nom de l'utilisateur actuel.
 * @property {Function} getCurrentUserContact - Récupère les données complètes du contact.
 * @property {Function} showLogin - Affiche la modale de connexion.
 * @property {Function} logout - Déconnecte l'utilisateur.
 * @property {Function} requireAuth - Exige une authentification pour une action.
 * @property {Function} checkPhoneExists - Vérifie si un numéro existe dans les contacts.
 */
export const authManager = {
  isAuthenticated: () => isAuthenticated,
  getCurrentUser: () => currentUser,
  getCurrentUserContact: () => currentUserContact,
  showLogin: showLoginModal,
  logout: handleLogout,
  requireAuth,
  checkPhoneExists,
};

export { createSecureMessage, createSecureMessageButtons };
export default authManager;
