// authManager.js - Système d'authentification avec vérification téléphone
import { createElement } from "../../utils/element.js";

// État de l'authentification
let isAuthenticated = false;
let currentUser = null;
let currentUserContact = null; // 🆕 NOUVEAU : Stocker les données complètes du contact
let generatedOTP = null;
let otpExpirationTime = null;

// Fonction de lecture des données
const readData = () => {
  const data = localStorage.getItem("data");
  return data ? JSON.parse(data) : {};
};

// Fonction pour normaliser un numéro de téléphone pour la comparaison
const normalizePhoneNumber = (phone) => {
  if (!phone || typeof phone !== "string") return "";
  // Supprimer tous les espaces, tirets, parenthèses, points et le +
  return phone.replace(/[\s\-\(\)\.\+]/g, "").toLowerCase();
};

// Fonction pour vérifier si le numéro existe dans la base de contacts
const checkPhoneExists = (phoneToCheck) => {
  console.log(`🔍 Vérification du numéro: ${phoneToCheck}`);

  // Récupérer les contacts actifs (non supprimés, non archivés)
  const contacts = (readData().users || []).filter(
    (item) =>
      typeof item.delete === "boolean" &&
      item.delete === false &&
      typeof item.archive === "boolean" &&
      item.archive === false
  );

  console.log(`👥 ${contacts.length} contacts actifs dans la base`);

  // Normaliser le numéro à vérifier
  const normalizedInput = normalizePhoneNumber(phoneToCheck);

  if (normalizedInput.length === 0) {
    return { exists: false, contact: null, error: "Numéro invalide" };
  }

  // Chercher le contact correspondant
  const matchingContact = contacts.find((contact) => {
    const contactPhone = contact.telephone || contact.phone || "";
    const normalizedContactPhone = normalizePhoneNumber(contactPhone);

    console.log(
      `Comparaison: "${normalizedInput}" vs "${normalizedContactPhone}" (${
        contact.name || contact.nom || "Nom inconnu"
      })`
    );

    return normalizedContactPhone === normalizedInput;
  });

  if (matchingContact) {
    console.log(
      `✅ Contact trouvé: ${
        matchingContact.name || matchingContact.nom || "Nom inconnu"
      }`
    );

    // 🔧 CORRECTION : Créer un objet contact complet avec toutes les propriétés
    const completeContact = {
      name: matchingContact.name || matchingContact.nom || "Utilisateur",
      phone: matchingContact.telephone || matchingContact.phone,
      id: matchingContact.id || null,
      email: matchingContact.email || null,
      // 🆕 NOUVEAU : Ajouter d'autres propriétés utiles
      originalData: matchingContact, // Garder une référence aux données originales
      // Ajouter d'autres champs selon votre structure de données
      address: matchingContact.address || matchingContact.adresse || null,
      company: matchingContact.company || matchingContact.entreprise || null,
      notes: matchingContact.notes || matchingContact.remarques || null,
    };

    console.log(`📋 Contact complet créé:`, completeContact);

    return {
      exists: true,
      contact: completeContact,
    };
  } else {
    console.log(`❌ Aucun contact trouvé pour le numéro: ${phoneToCheck}`);
    return {
      exists: false,
      contact: null,
      error: "Numéro non trouvé dans les contacts",
    };
  }
};

// Génération d'un OTP à 6 chiffres
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Vérification si l'OTP est encore valide (5 minutes)
const isOTPValid = () => {
  return otpExpirationTime && Date.now() < otpExpirationTime;
};

// Modal de connexion avec votre style
const createLoginModal = () =>
  createElement(
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
          // En-tête
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
                {
                  class: ["text-xl", "font-semibold", "text-gray-800"],
                },
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

          // Instructions
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
                {
                  class: ["text-sm", "text-blue-800", "text-center"],
                },
                "Entrez votre numéro de téléphone pour recevoir un code OTP"
              ),
            ]
          ),

          // Formulaire numéro de téléphone
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

          // Bouton vérifier téléphone
          createAuthButton(
            "Vérifier le numéro",
            "blue-500",
            "blue-600",
            checkPhoneHandler
          ),

          // Section OTP (cachée initialement)
          createElement(
            "div",
            {
              id: "otpSection",
              class: ["hidden", "mt-4"],
            },
            [
              // Informations utilisateur trouvé
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

              // Affichage OTP
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

              // Champ saisie OTP
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

              // Bouton vérifier OTP
              createAuthButton(
                "Vérifier et se connecter",
                "green-500",
                "green-600",
                verifyOTPHandler
              ),
            ]
          ),

          // Zone de messages
          createElement("div", {
            id: "authMessage",
            class: ["mt-4", "text-center", "text-sm", "min-h-5"],
          }),
        ]
      ),
    ]
  );

// Créer un bouton avec votre style
const createAuthButton = (text, bgColor, hoverColor, onClick) =>
  createElement(
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

// Interface utilisateur connecté (style minimaliste)
const createUserStatus = () =>
  createElement(
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
        {
          class: ["text-sm", "font-medium", "text-gray-700"],
        },
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

// Gestionnaires d'événements
const checkPhoneHandler = () => {
  const phoneInput = document.getElementById("phoneInput");
  const phoneNumber = phoneInput?.value?.trim() || "";

  if (!phoneNumber) {
    showAuthMessage("Veuillez entrer un numéro de téléphone", "error");
    return;
  }

  // Vérifier si le numéro existe dans la base
  const phoneCheck = checkPhoneExists(phoneNumber);

  if (!phoneCheck.exists) {
    showAuthMessage(
      phoneCheck.error || "Numéro non trouvé dans les contacts",
      "error"
    );
    return;
  }

  // 🆕 NOUVEAU : Stocker les données complètes du contact
  currentUserContact = phoneCheck.contact;
  currentUser = phoneCheck.contact.name;

  // Générer l'OTP
  generatedOTP = generateOTP();
  otpExpirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes

  console.log(`📋 Contact complet trouvé:`, currentUserContact);

  // Afficher les informations utilisateur
  const foundUserName = document.getElementById("foundUserName");
  if (foundUserName) {
    foundUserName.textContent = currentUserContact.name;
  }

  // Afficher l'OTP
  const otpDisplay = document.getElementById("otpDisplay");
  if (otpDisplay) {
    otpDisplay.textContent = generatedOTP;
  }

  const otpSection = document.getElementById("otpSection");
  if (otpSection) {
    otpSection.classList.remove("hidden");
  }

  showAuthMessage(`OTP généré pour ${currentUserContact.name}`, "success");
  console.log(
    `🔐 OTP généré: ${generatedOTP} pour ${currentUserContact.name} (${currentUserContact.phone})`
  );

  // Focus sur le champ OTP
  setTimeout(() => {
    const otpInput = document.getElementById("otpInput");
    if (otpInput) {
      otpInput.focus();
    }
  }, 100);
};

const verifyOTPHandler = () => {
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
    // Connexion réussie
    isAuthenticated = true;

    // 🔧 CORRECTION : Vérifier que nous avons les données
    console.log(`🔍 Debug avant événement:`);
    console.log(`  - currentUser: "${currentUser}"`);
    console.log(`  - currentUserContact:`, currentUserContact);

    // 🔧 CORRECTION : Si les données sont perdues, les récupérer
    if (!currentUser || !currentUserContact) {
      console.log(`⚠️ Données perdues, récupération...`);
      const phoneInput = document.getElementById("phoneInput");
      const phoneNumber = phoneInput?.value?.trim() || "";
      if (phoneNumber) {
        const phoneCheck = checkPhoneExists(phoneNumber);
        if (phoneCheck.exists) {
          currentUser = phoneCheck.contact.name;
          currentUserContact = phoneCheck.contact;
          console.log(`🔄 Données récupérées:`, currentUserContact);
        }
      }
    }

    console.log(`✅ Connexion réussie: ${currentUser}`);
    console.log(`📋 Données utilisateur complètes:`, currentUserContact);

    showAuthMessage("Connexion réussie !", "success");

    setTimeout(() => {
      closeLoginModal();
      document.body.appendChild(createUserStatus());

      // 🔧 CORRECTION : Vérification finale avant envoi événement
      console.log(`📤 Envoi événement avec:`, {
        username: currentUser,
        id: currentUserContact?.id,
        phone: currentUserContact?.phone,
        fullContact: currentUserContact,
      });

      // 🆕 NOUVEAU : Événement avec toutes les données
      window.dispatchEvent(
        new CustomEvent("userAuthenticated", {
          detail: {
            username: currentUser,
            id: currentUserContact?.id || null,
            phone: currentUserContact?.phone || null,
            fullContact: currentUserContact, // 🆕 Données complètes
          },
        })
      );
    }, 1000);
  } else {
    showAuthMessage("Code OTP incorrect", "error");
  }
};

const handleLogout = () => {
  const previousUser = currentUser;
  const previousContact = currentUserContact;

  isAuthenticated = false;
  currentUser = null;
  currentUserContact = null; // 🆕 NOUVEAU : Nettoyer les données contact
  generatedOTP = null;
  otpExpirationTime = null;

  // Supprimer l'interface utilisateur
  const userStatus = document.getElementById("userStatus");
  if (userStatus) {
    userStatus.remove();
  }

  console.log(`🚪 Déconnexion: ${previousUser}`);

  // Événement personnalisé
  window.dispatchEvent(
    new CustomEvent("userLoggedOut", {
      detail: {
        username: previousUser,
        previousContact: previousContact,
        timestamp: new Date().toISOString(),
      },
    })
  );
};

// Utilitaires
const showAuthMessage = (message, type) => {
  const messageArea = document.getElementById("authMessage");
  if (!messageArea) return;

  const textColor = type === "error" ? "text-red-600" : "text-green-600";
  messageArea.innerHTML = "";
  messageArea.appendChild(
    createElement("p", { class: [textColor, "font-medium"] }, message)
  );
};

const resetOTPSection = () => {
  generatedOTP = null;
  otpExpirationTime = null;
  // 🆕 NOUVEAU : Ne pas effacer currentUser et currentUserContact ici
  // car ils peuvent être nécessaires pour d'autres opérations

  // Vérifier que les éléments existent avant de les manipuler
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
};

const closeLoginModal = () => {
  const modal = document.getElementById("loginModal");
  if (modal) {
    // Reset des données temporaires seulement
    generatedOTP = null;
    otpExpirationTime = null;
    // 🆕 NOUVEAU : Ne pas effacer currentUser et currentUserContact si connecté
    if (!isAuthenticated) {
      currentUser = null;
      currentUserContact = null;
    }
    modal.remove();
  }
};

const showLoginModal = () => {
  if (!isAuthenticated) {
    document.body.appendChild(createLoginModal());
  }
};

// Sécuriser vos boutons existants (votre code existant)
const createSecureMessageButtons = () =>
  createElement("ul", { class: ["flex", "gap-x-2", "items-center"] }, [
    createSecureButton("fa-delete-left", "red-500", "red-300", () =>
      console.log("Supprimer - action sécurisée")
    ),

    createSecureButton("fa-box-archive", "gray-400", "gray-400", () => {
      // Votre logique d'archivage existante ici
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

// Bouton sécurisé avec votre style
const createSecureButton = (iconClass, textColor, borderColor, secureAction) =>
  createElement(
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

// Fonction principale pour sécuriser les actions
const requireAuth = (action) => {
  if (isAuthenticated) {
    action();
  } else {
    showLoginModal();
  }
};

// Modifier votre createMessage pour utiliser les boutons sécurisés
const createSecureMessage = () =>
  createElement("div", { class: ["flex", "flex-col", "w-2/3", "h-screen"] }, [
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
        createSecureMessageButtons(), // Boutons sécurisés
      ]
    ),
    createElement(
      "div",
      { class: ["flex-1"], style: { backgroundColor: "#f0f6f0" } },
      "Interface sécurisée - Connecté comme: " + (currentUser || "Non connecté")
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
          [createElement("i", { class: ["fas", "fa-arrow-right", "text-sm"] })]
        ),
      ]
    ),
  ]);

// API publique
export const authManager = {
  isAuthenticated: () => isAuthenticated,
  getCurrentUser: () => currentUser,
  getCurrentUserContact: () => currentUserContact, // 🆕 NOUVEAU : Accès aux données complètes
  showLogin: showLoginModal,
  logout: handleLogout,
  requireAuth,
  checkPhoneExists, // Fonction exportée
};

export { createSecureMessage, createSecureMessageButtons };
export default authManager;
