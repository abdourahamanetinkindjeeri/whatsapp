// contact.js - Gestion de la liste des contacts

// ===== IMPORTS =====
import { createElement } from "../../../utils/element.js";
import { readData } from "../../../utils/data.js";
import {
  getSelectedContacts,
  resetSelectedContacts,
} from "./selectedContactsManager.js";

// Import de l'API de messagerie (ajustez le chemin selon votre structure)
// Si Message.js est dans le même dossier : './Message.js'
// Si Message.js est dans un dossier parent : '../Message.js'
// Si Message.js est dans discussion/message/ : '../message/Message.js'
import { messageAPI } from "../../messages/Message.js";

// ===== VARIABLES GLOBALES =====
let currentlySelectedContactElement = null;

// ===== FONCTIONS =====

// Fonction pour créer un élément de contact avec gestion du clic
const createContactElement = (contact) => {
  console.log("Contact data:", contact); // Log pour voir les données du contact

  return createElement(
    "div",
    {
      class: [
        "contact-item",
        "p-3",
        "cursor-pointer",
        "hover:bg-gray-50",
        "transition",
        "border-b",
        "border-gray-100",
      ],
      "data-contact-id": contact.id, // Important pour highlightSelectedContact
      onclick: (event) => handleContactClick(event, contact),
    },
    [
      createElement(
        "div",
        {
          class: ["flex", "items-center", "gap-3"],
        },
        [
          // Avatar du contact
          createElement(
            "div",
            {
              class: [
                "w-10",
                "h-10",
                "rounded-full",
                "bg-gray-200",
                "flex",
                "items-center",
                "justify-center",
                "flex-shrink-0",
                "overflow-hidden",
              ],
            },
            contact.profile && contact.profile.avatar
              ? createElement("img", {
                  src: contact.profile.avatar,
                  alt: contact.nom || contact.name || `Contact ${contact.id}`,
                  class: ["w-full", "h-full", "object-cover"],
                  onerror: (e) => {
                    console.error("Erreur de chargement de l'avatar:", e);
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<i class="fas fa-user text-gray-600 text-sm"></i>';
                  },
                })
              : createElement("i", {
                  class: ["fas", "fa-user", "text-gray-600", "text-sm"],
                })
          ),

          // Informations du contact
          createElement(
            "div",
            {
              class: ["flex-1", "min-w-0"], // min-w-0 pour éviter l'overflow
            },
            [
              createElement(
                "div",
                {
                  class: ["font-medium", "text-gray-900", "truncate"],
                },
                contact.nom || contact.name || `Contact ${contact.id}`
              ),
              createElement(
                "div",
                {
                  class: ["text-sm", "text-gray-500", "truncate"],
                },
                contact.telephone || contact.phone || "Pas de téléphone"
              ),
            ]
          ),

          // Indicateur de statut (optionnel)
          createElement(
            "div",
            {
              class: ["flex-shrink-0"],
            },
            [
              createElement("div", {
                class: [
                  "w-3",
                  "h-3",
                  "rounded-full",
                  contact.online ? "bg-green-400" : "bg-gray-300",
                ],
              }),
            ]
          ),
        ]
      ),
    ]
  );
};

// Gestionnaire de clic sur un contact
const handleContactClick = (event, contact) => {
  console.log("🖱️ Clic sur contact:", contact);

  // 1. Gestion de la surbrillance visuelle
  document
    .querySelectorAll(".contact-item")
    .forEach((el) =>
      el.classList.remove("bg-blue-100", "ring", "ring-blue-300")
    );

  event.currentTarget.classList.add("bg-blue-100", "ring", "ring-blue-300");

  // Mettre à jour la référence de l'élément sélectionné
  currentlySelectedContactElement = event.currentTarget;

  // 2. Focus sur l'input de message et indication visuelle
  const inputMessage = document.querySelector("#inputMessage");
  if (inputMessage) {
    inputMessage.style.backgroundColor = "#fef2f2"; // Rouge clair au lieu de rouge vif
    inputMessage.focus();

    // Retirer la couleur après 1 seconde
    setTimeout(() => {
      inputMessage.style.backgroundColor = "#f9fafb";
    }, 1000);
  } else {
    console.warn("⚠️ Élément 'inputMessage' non trouvé !");
  }

  // 3. ✨ CRUCIAL: Sélectionner le contact dans le système de messagerie
  if (contact && contact.id) {
    const contactName = contact.nom || contact.name || `Contact ${contact.id}`;
    const contactId = String(contact.id); // S'assurer que l'ID est une string

    console.log(`🎯 Sélection du contact: ${contactName} (ID: ${contactId})`);

    try {
      // Vérifier que messageAPI est disponible
      if (!messageAPI || typeof messageAPI.selectContact !== "function") {
        throw new Error("messageAPI non disponible ou selectContact manquant");
      }

      // Appeler l'API de messagerie pour sélectionner le contact
      messageAPI.selectContact(contactId, contactName);

      // Log pour debug
      const currentUser = messageAPI.getCurrentUserId
        ? messageAPI.getCurrentUserId()
        : "Non défini";
      console.log(`✅ Contact sélectionné avec succès!`);
      console.log(
        `👤 Contact: ${contactId}, Utilisateur actuel: ${currentUser}`
      );

      // Émettre un événement personnalisé pour d'autres composants
      window.dispatchEvent(
        new CustomEvent("contactSelected", {
          detail: {
            contactId: contactId,
            contactName: contactName,
            contact: contact,
          },
        })
      );
    } catch (error) {
      console.error("❌ Erreur lors de la sélection du contact:", error);
      console.error(
        "📋 Vérifiez que Message.js est bien importé et que messageAPI est exporté"
      );
    }
  } else {
    console.error("❌ Données de contact manquantes:", contact);
  }
};

// Fonction pour mettre à jour la liste des contacts
// const updateContactList = () => {
//   console.log("🔄 Mise à jour de la liste des contacts...");

//   try {
//     const data = readData();
//     console.clear();
//     console.table(readData("users").then);
//     const contacts = (data.users || []).filter(
//       (contact) => contact.delete === false && contact.archive === false
//     );

//     const contactListPanel = document.getElementById("discussionList");
//     if (!contactListPanel) {
//       console.warn("⚠️ Panneau de liste des contacts non trouvé");
//       return;
//     }

//     // Vider le panneau
//     contactListPanel.innerHTML = "";

//     // if (contacts.length === 0) {
//     //   contactListPanel.appendChild(
//     //     createElement("div", {
//     //       class: ["text-center", "text-gray-500", "py-8"]
//     //     }, [
//     //       createElement("i", {
//     //         class: ["fas", "fa-users", "text-3xl", "mb-3", "block"]
//     //       }),
//     //       createElement("p", {}, "Aucun contact disponible"),
//     //       createElement("p", {
//     //         class: ["text-sm", "mt-1"]
//     //       }, "Ajoutez des contacts pour commencer")
//     //     ])
//     //   );
//     //   return;
//     // }

//     // Ajouter les contacts
//     contacts.forEach((contact) => {
//       contactListPanel.appendChild(createContactElement(contact));
//     });

//     console.log(`✅ ${contacts.length} contacts affichés`);
//   } catch (error) {
//     console.error("❌ Erreur lors de la mise à jour des contacts:", error);
//   }
// };
const updateContactList = async () => {
  console.log("🔄 Mise à jour de la liste des contacts...");

  try {
    const usersData = await readData("users");
    console.log("Données utilisateurs reçues:", usersData); // Log des données utilisateurs

    const contacts = (usersData || []).filter(
      (contact) => contact.delete === false && contact.archive === false
    );
    console.log("Contacts filtrés:", contacts); // Log des contacts filtrés

    const contactListPanel = document.getElementById("discussionList");
    if (!contactListPanel) {
      console.warn("⚠️ Panneau de liste des contacts non trouvé");
      return;
    }

    // Vider le panneau
    contactListPanel.innerHTML = "";

    // Gestion du cas où il n'y a pas de contacts
    if (contacts.length === 0) {
      contactListPanel.appendChild(
        createElement(
          "div",
          {
            class: ["text-center", "text-gray-500", "py-8"],
          },
          [
            createElement("i", {
              class: ["fas", "fa-users", "text-3xl", "mb-3", "block"],
            }),
            createElement("p", {}, "Aucun contact disponible"),
            createElement(
              "p",
              {
                class: ["text-sm", "mt-1"],
              },
              "Ajoutez des contacts pour commencer"
            ),
          ]
        )
      );
      return;
    }

    // Ajouter les contacts
    contacts.forEach((contact) => {
      contactListPanel.appendChild(createContactElement(contact));
    });

    console.log(`✅ ${contacts.length} contacts affichés`);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des contacts:", error);
  }
};

// Exemple d'appel (si nécessaire)
// updateContactList();
// Fonction pour les contacts archivés
const updateContactListArchive = () => {
  console.log("🗄️ Mise à jour de la liste des contacts archivés...");

  try {
    const data = readData();
    const archivedContacts = (data.users || []).filter(
      (contact) => contact.delete === false && contact.archive === true
    );

    const archiveListPanel = document.getElementById("archiveListPanel");
    if (!archiveListPanel) {
      console.warn("⚠️ Panneau de liste des contacts archivés non trouvé");
      return;
    }

    // Vider le panneau
    archiveListPanel.innerHTML = "";

    if (archivedContacts.length === 0) {
      archiveListPanel.appendChild(
        createElement(
          "div",
          {
            class: ["text-center", "text-gray-500", "py-8"],
          },
          "Aucun contact archivé"
        )
      );
      return;
    }

    // Ajouter les contacts archivés
    archivedContacts.forEach((contact) => {
      archiveListPanel.appendChild(createContactElement(contact));
    });

    console.log(`✅ ${archivedContacts.length} contacts archivés affichés`);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la mise à jour des contacts archivés:",
      error
    );
  }
};

// Fonction pour forcer la sélection d'un contact (utilisable depuis l'extérieur)
const selectContactFromOutside = (contactId, contactName) => {
  console.log(`🔗 Sélection externe du contact: ${contactName} (${contactId})`);

  // Trouver l'élément du contact dans la liste
  const contactElement = document.querySelector(
    `[data-contact-id="${contactId}"]`
  );
  if (contactElement) {
    // Simuler un clic sur l'élément
    contactElement.click();
  } else {
    console.warn(
      `⚠️ Élément de contact avec ID ${contactId} non trouvé dans la liste`
    );
    // Sélectionner directement via l'API si l'élément n'est pas trouvé
    if (messageAPI && messageAPI.selectContact) {
      messageAPI.selectContact(contactId, contactName);
    }
  }
};

// Fonction de diagnostic pour vérifier les imports
const diagnoseMesagingIntegration = () => {
  console.group("🔍 DIAGNOSTIC INTÉGRATION MESSAGERIE");
  console.log("messageAPI importé:", !!messageAPI);
  console.log(
    "selectContact disponible:",
    !!(messageAPI && messageAPI.selectContact)
  );
  console.log(
    "Type de selectContact:",
    typeof (messageAPI && messageAPI.selectContact)
  );

  if (messageAPI) {
    console.log(
      "Fonctions disponibles dans messageAPI:",
      Object.keys(messageAPI)
    );
  }

  console.groupEnd();
};

// ===== EXPORTS =====

// Exports nommés principaux
export {
  updateContactList,
  updateContactListArchive,
  handleContactClick,
  selectContactFromOutside,
  createContactElement,
  diagnoseMesagingIntegration,
};

// Export par défaut (pour compatibilité avec votre code existant)
export default {
  updateContactList,
  updateContactListArchive,
  handleContactClick,
  selectContactFromOutside,
  createContactElement,
  diagnoseMesagingIntegration,
};
