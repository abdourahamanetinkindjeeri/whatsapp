// contact.js - Gestion de la liste des contacts

// ===== IMPORTS =====
import { createElement } from "../../../utils/element.js";
import { readData } from "../../../utils/data.js";
import {
  getSelectedContacts,
  resetSelectedContacts,
  addSelectedContact,
  removeSelectedContact,
} from "./selectedContactsManager.js";
import { showNotification } from "../../../utils/notifications.js";

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
  const isSelected = getSelectedContacts().includes(String(contact.id));
  return createElement(
    "div",
    {
      class: [
        "contact-item",
        "p-3",
        "hover:bg-gray-100",
        "cursor-pointer",
        "transition",
        "flex",
        "items-center",
        "gap-3",
        isSelected ? "bg-blue-100" : "",
      ],
      "data-contact-id": contact.id,
      ondblclick: (e) => {
        e.stopPropagation();
        const contactId = String(contact.id);
        if (isSelected) {
          removeSelectedContact(contactId);
        } else {
          addSelectedContact(contactId);
        }
        // Mettre à jour l'apparence de l'élément
        e.currentTarget.classList.toggle("bg-blue-100");
      },
      onclick: (e) => {
        if (!e.ctrlKey && !e.metaKey) {
          // Si on clique sans Ctrl/Cmd, on désélectionne tout et on sélectionne uniquement ce contact
          resetSelectedContacts();
          document
            .querySelectorAll(".contact-item")
            .forEach((el) => el.classList.remove("bg-blue-100"));
          addSelectedContact(String(contact.id));
          e.currentTarget.classList.add("bg-blue-100");
        }
        handleContactClick(e, contact);
      },
      oncontextmenu: (e) => {
        e.preventDefault();
        showContactContextMenu(e, contact);
      },
    },
    [
      createElement(
        "div",
        {
          class: [
            "w-10",
            "h-10",
            "rounded-full",
            "bg-gray-300",
            "flex",
            "items-center",
            "justify-center",
          ],
        },
        [
          createElement(
            "span",
            {
              class: ["text-gray-600", "font-semibold"],
            },
            (contact.nom || contact.name || "?").charAt(0).toUpperCase()
          ),
        ]
      ),
      createElement(
        "div",
        {
          class: ["flex-1"],
        },
        [
          createElement(
            "div",
            {
              class: ["font-medium"],
            },
            contact.nom || contact.name || "Sans nom"
          ),
          createElement(
            "div",
            {
              class: ["text-sm", "text-gray-500"],
            },
            contact.telephone || "Pas de numéro"
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

// Fonction pour afficher le menu contextuel
const showContactContextMenu = async (event, contact) => {
  const menu = createElement(
    "div",
    {
      class: [
        "fixed",
        "bg-white",
        "rounded-lg",
        "shadow-lg",
        "py-2",
        "min-w-[200px]",
        "z-50",
      ],
      style: {
        top: `${event.clientY}px`,
        left: `${event.clientX}px`,
      },
    },
    [
      createElement(
        "button",
        {
          class: [
            "w-full",
            "px-4",
            "py-2",
            "text-left",
            "hover:bg-gray-100",
            "flex",
            "items-center",
            "gap-2",
          ],
          onclick: async () => {
            try {
              await archiveContacts([contact.id]);
              await updateContactList();
              showNotification("Contact archivé avec succès", "success");
            } catch (error) {
              console.error("Erreur lors de l'archivage du contact:", error);
              showNotification(
                "Erreur lors de l'archivage du contact",
                "error"
              );
            }
          },
        },
        [
          createElement("i", { class: ["fas", "fa-box-archive"] }),
          "Archiver le contact",
        ]
      ),
      createElement(
        "button",
        {
          class: [
            "w-full",
            "px-4",
            "py-2",
            "text-left",
            "hover:bg-gray-100",
            "flex",
            "items-center",
            "gap-2",
          ],
          onclick: async () => {
            try {
              await desarchiveContacts([contact.id]);
              await updateContactListArchive();
              showNotification("Contact désarchivé avec succès", "success");
            } catch (error) {
              console.error("Erreur lors du désarchivage du contact:", error);
              showNotification(
                "Erreur lors du désarchivage du contact",
                "error"
              );
            }
          },
        },
        [
          createElement("i", { class: ["fas", "fa-box-open"] }),
          "Désarchiver le contact",
        ]
      ),
    ]
  );

  // Fermer le menu en cliquant ailleurs
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener("click", closeMenu);
    }
  };

  document.addEventListener("click", closeMenu);
  document.body.appendChild(menu);
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
