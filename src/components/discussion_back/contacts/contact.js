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
      "data-contact-id": contact.id,
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
  document
    .querySelectorAll(".contact-item")
    .forEach((el) =>
      el.classList.remove("bg-blue-100", "ring", "ring-blue-300")
    );

  event.currentTarget.classList.add("bg-blue-100", "ring", "ring-blue-300");
  currentlySelectedContactElement = event.currentTarget;

  const inputMessage = document.querySelector("#inputMessage");
  if (inputMessage) {
    inputMessage.style.backgroundColor = "#fef2f2";
    inputMessage.focus();
    setTimeout(() => {
      inputMessage.style.backgroundColor = "#f9fafb";
    }, 1000);
  }

  if (contact && contact.id) {
    const contactName = contact.nom || contact.name || `Contact ${contact.id}`;
    const contactId = String(contact.id);

    try {
      if (!messageAPI || typeof messageAPI.selectContact !== "function") {
        throw new Error("messageAPI non disponible ou selectContact manquant");
      }

      messageAPI.selectContact(contactId, contactName, "contact");

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
      console.error("Erreur lors de la sélection du contact:", error);
    }
  }
};

// Fonction pour mettre à jour la liste des contacts
const updateContactList = async () => {
  try {
    const contacts = (await readData("users")).filter(
      (contact) => contact.delete === false && contact.archive === false
    );

    const contactListPanel = document.getElementById("discussionList");
    if (!contactListPanel) {
      return;
    }

    contactListPanel.innerHTML = "";

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

    contacts.forEach((contact) => {
      contactListPanel.appendChild(createContactElement(contact));
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des contacts:", error);
  }
};

// Exemple d'appel (si nécessaire)
// updateContactList();
// Fonction pour les contacts archivés
const updateContactListArchive = async () => {
  try {
    const contacts = (await readData("users")).filter(
      (contact) => contact.archive === true && contact.delete === false
    );

    const contactListPanel = document.getElementById("discussionList");
    if (!contactListPanel) {
      return;
    }

    contactListPanel.innerHTML = "";

    if (contacts.length === 0) {
      contactListPanel.appendChild(
        createElement(
          "div",
          {
            class: ["text-center", "text-gray-500", "py-8"],
          },
          [
            createElement("i", {
              class: ["fas", "fa-archive", "text-3xl", "mb-3", "block"],
            }),
            createElement("p", {}, "Aucun contact archivé"),
          ]
        )
      );
      return;
    }

    contacts.forEach((contact) => {
      contactListPanel.appendChild(createContactElement(contact));
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des contacts archivés:",
      error
    );
  }
};

// Fonction pour forcer la sélection d'un contact (utilisable depuis l'extérieur)
const selectContactFromOutside = (contactId, contactName) => {
  const contactElement = document.querySelector(
    `.contact-item[data-contact-id="${contactId}"]`
  );
  if (contactElement) {
    contactElement.click();
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
