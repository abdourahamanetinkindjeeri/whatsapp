import {
  updateContactList,
  updateContactListArchive,
} from "../discussion/contacts/contact.js";
import { readData, addData } from "../../utils/data.js";
import {
  getSelectedContacts,
  resetSelectedContacts,
} from "../discussion/contacts/selectedContactsManager.js";
import { createElement } from "../../utils/element.js";
import { authManager } from "../auth/authManager.js";

// ===== VARIABLES GLOBALES =====
let currentRecipient = null;
let currentlySelectedContactElement = null;

// ===== FONCTIONS PRINCIPALES =====

const sendMessage = async (idEnvoyeur, userSelection, msg) => {
  console.log("📤 Envoi de message...");
  console.log(`👤 Envoyeur: ${idEnvoyeur}`);
  console.log(`🎯 Destinataire: ${userSelection}`);
  console.log(`💬 Message: "${msg}"`);

  if (!idEnvoyeur || !userSelection || !msg?.trim()) {
    const error = "Données manquantes pour l'envoi";
    console.error("❌", error);
    return { success: false, error };
  }

  if (String(idEnvoyeur) === String(userSelection)) {
    console.warn("⚠️ Tentative d'envoi de message à soi-même");
    console.log("💭 Message à soi-même autorisé (note personnelle)");
  }

  try {
    const messageObj = {
      id: generateMessageId(),
      senderId: String(idEnvoyeur),
      recipientId: String(userSelection),
      content: msg.trim(),
      timestamp: new Date().toISOString(),
      status: "sent",
      type: "text",
      isSelfMessage: String(idEnvoyeur) === String(userSelection),
    };

    const saved = await saveNewMessage(messageObj);
    if (saved) {
      console.log("✅ Message envoyé avec succès !");
      window.dispatchEvent(
        new CustomEvent("messageSent", { detail: messageObj })
      );
      return { success: true, message: messageObj };
    } else {
      throw new Error("Échec de la sauvegarde");
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi:", error);
    return { success: false, error: error.message };
  }
};

const saveNewMessage = async (messageObj) => {
  try {
    const messages = (await readData("messages")) || [];
    messages.push(messageObj);
    await addData("messages", messages);
    console.log("💾 Message sauvegardé");
    return true;
  } catch (error) {
    console.error("❌ Erreur de sauvegarde:", error);
    return false;
  }
};

const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

const getCurrentUserId = () => {
  if (!authManager.isAuthenticated()) {
    console.warn("Utilisateur non authentifié. Retourne null.");
    return null;
  }
  const userContact = authManager.getCurrentUserContact();
  return userContact?.id || authManager.getCurrentUser();
};

const getAvailableContacts = async () => {
  try {
    const users = (await readData("users")) || [];
    return users
      .filter(
        (contact) => contact.delete === false && contact.archive === false
      )
      .map((contact) => ({
        id: String(contact.id || contact.nom),
        name: contact.nom || contact.name,
      }));
  } catch (error) {
    console.error("❌ Erreur récupération contacts:", error);
    return [];
  }
};

const getMessages = async (userId1, userId2) => {
  try {
    const messages = (await readData("messages")) || [];

    return messages
      .filter(
        (msg) =>
          msg &&
          typeof msg === "object" &&
          msg.id &&
          msg.content &&
          ((String(msg.senderId) === String(userId1) &&
            String(msg.recipientId) === String(userId2)) ||
            (String(msg.senderId) === String(userId2) &&
              String(msg.recipientId) === String(userId1)))
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } catch (error) {
    console.error("❌ Erreur récupération messages:", error);
    return [];
  }
};

const displayMessage = (messageObj, isSentByMe = false) => {
  const messagesContainer = document.getElementById("messagesContainer");
  if (!messagesContainer) {
    console.error("❌ messagesContainer non trouvé");
    return;
  }

  const isSelfMessage =
    messageObj.isSelfMessage ||
    String(messageObj.senderId) === String(messageObj.recipientId);

  const messageElement = createElement(
    "div",
    { class: ["flex", isSentByMe ? "justify-end" : "justify-start", "mb-3"] },
    [
      createElement(
        "div",
        {
          class: [
            "max-w-xs",
            "lg:max-w-md",
            "px-4",
            "py-2",
            "rounded-lg",
            "shadow-sm",
            "border",
            isSelfMessage
              ? "bg-yellow-100 text-gray-800 border-yellow-300"
              : isSentByMe
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-800 border-gray-200",
          ],
        },
        [
          ...(isSelfMessage
            ? [
                createElement(
                  "div",
                  { class: ["flex", "items-center", "gap-1", "mb-1"] },
                  [
                    createElement("i", {
                      class: [
                        "fas",
                        "fa-sticky-note",
                        "text-yellow-600",
                        "text-xs",
                      ],
                    }),
                    createElement(
                      "span",
                      { class: ["text-xs", "text-yellow-600", "font-medium"] },
                      "Note personnelle"
                    ),
                  ]
                ),
              ]
            : []),
          createElement(
            "p",
            { class: ["text-sm", "break-words"] },
            messageObj.content
          ),
          createElement(
            "p",
            {
              class: [
                "text-xs",
                "mt-1",
                "opacity-70",
                isSentByMe ? "text-right" : "text-left",
              ],
            },
            new Date(messageObj.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          ),
        ]
      ),
    ]
  );

  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

const loadConversation = async (recipientId) => {
  const messagesContainer = document.getElementById("messagesContainer");
  if (!messagesContainer) {
    console.error("❌ messagesContainer non trouvé");
    return;
  }

  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    console.error("❌ Utilisateur non défini.");
    return;
  }

  console.log(
    `🔍 Chargement de la conversation entre ${currentUserId} et ${recipientId}`
  );

  messagesContainer.innerHTML = `
    <div class="flex justify-center items-center h-full">
      <div class="text-center text-gray-500">
        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
        <p>Chargement des messages...</p>
      </div>
    </div>
  `;

  try {
    const messages = await getMessages(currentUserId, recipientId);

    messagesContainer.innerHTML = "";

    if (messages.length === 0) {
      messagesContainer.appendChild(
        createElement(
          "div",
          { class: ["text-center", "text-gray-500", "mt-8"] },
          [
            createElement("p", {}, "💬 Aucun message"),
            createElement(
              "p",
              { class: ["text-sm", "mt-2"] },
              "Commencez une conversation !"
            ),
          ]
        )
      );
    } else {
      messages.forEach((msg) =>
        displayMessage(msg, String(msg.senderId) === String(currentUserId))
      );
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    currentRecipient = recipientId;
    console.log(`💬 Conversation chargée avec: ${recipientId}`);
  } catch (error) {
    console.error("❌ Erreur lors du chargement des messages:", error);
    messagesContainer.innerHTML = `
      <div class="text-center text-red-500 mt-8">
        <p>❌ Erreur lors du chargement des messages</p>
        <p class="text-sm mt-2">${error.message}</p>
      </div>
    `;
  }
};

const selectContact = async (contactId, contactName) => {
  console.log(`👤 Contact sélectionné: ${contactName} (${contactId})`);

  const normalizedContactId = String(contactId);
  currentRecipient = normalizedContactId;

  await loadConversation(normalizedContactId);
  updateChatHeader(contactName);
  highlightSelectedContact(normalizedContactId);
  closeContactSelector();

  const inputMessage = document.getElementById("inputMessage");
  if (inputMessage) {
    inputMessage.focus();
    inputMessage.style.backgroundColor = "#f0f9ff";
    setTimeout(() => {
      inputMessage.style.backgroundColor = "#f9fafb";
    }, 1500);
  }

  window.dispatchEvent(
    new CustomEvent("messageRecipientSelected", {
      detail: {
        contactId: normalizedContactId,
        contactName: contactName,
        timestamp: new Date().toISOString(),
      },
    })
  );

  console.log(
    `✅ Contact ${contactName} sélectionné avec succès pour la messagerie`
  );
};

const handleSecureMessageSend = () => {
  authManager.requireAuth(_performSendMessage);
};

const _performSendMessage = async () => {
  const messageInput = document.getElementById("inputMessage");
  const message = messageInput?.value?.trim();

  if (!message) {
    console.warn("⚠️ Message vide.");
    if (messageInput) {
      messageInput.style.backgroundColor = "#fef2f2";
      messageInput.placeholder = "Veuillez écrire un message...";
      setTimeout(() => {
        messageInput.style.backgroundColor = "#f9fafb";
        messageInput.placeholder = "Écrire un message...";
      }, 2000);
    }
    return;
  }

  if (!currentRecipient) {
    console.warn("⚠️ Aucun destinataire sélectionné.");
    if (messageInput) {
      messageInput.style.backgroundColor = "#fef3cd";
      messageInput.placeholder = "Sélectionnez un contact...";
      setTimeout(() => {
        messageInput.style.backgroundColor = "#f9fafb";
        messageInput.placeholder = "Écrire un message...";
      }, 3000);
    }
    showContactSelector();
    return;
  }

  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    console.error("❌ Utilisateur non défini.");
    return;
  }

  console.log(`📤 Envoi du message vers ${currentRecipient}: "${message}"`);
  const result = await sendMessage(currentUserId, currentRecipient, message);

  if (result.success) {
    messageInput.value = "";
    messageInput.style.backgroundColor = "#f0fdf4";
    setTimeout(() => {
      messageInput.style.backgroundColor = "#f9fafb";
    }, 1000);
    console.log("✅ Message envoyé avec succès !");
  } else {
    console.error("❌ Échec envoi:", result.error);
    messageInput.style.backgroundColor = "#fef2f2";
    setTimeout(() => {
      messageInput.style.backgroundColor = "#f9fafb";
    }, 2000);
  }
};

const showContactSelector = async () => {
  const contacts = await getAvailableContacts();

  if (contacts.length === 0) {
    console.warn("⚠️ Aucun contact disponible.");
    alert("Aucun contact disponible pour commencer une conversation.");
    return;
  }

  const modal = createElement(
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
      id: "contactSelectorModal",
    },
    [
      createElement(
        "div",
        {
          class: ["bg-white", "rounded-lg", "p-6", "max-w-md", "w-full", "m-4"],
        },
        [
          createElement(
            "h3",
            {
              class: ["text-lg", "font-semibold", "mb-4"],
            },
            "Sélectionner un contact"
          ),
          createElement(
            "div",
            {
              class: ["space-y-2", "max-h-64", "overflow-y-auto"],
            },
            contacts.map((contact) =>
              createElement(
                "button",
                {
                  class: [
                    "w-full",
                    "text-left",
                    "p-3",
                    "hover:bg-gray-100",
                    "rounded",
                    "border",
                    "transition",
                    "flex",
                    "items-center",
                    "gap-3",
                  ],
                  onclick: () => selectContact(contact.id, contact.name),
                },
                [
                  createElement(
                    "div",
                    {
                      class: [
                        "w-8",
                        "h-8",
                        "rounded-full",
                        "bg-gray-200",
                        "flex",
                        "items-center",
                        "justify-center",
                        "text-gray-600",
                      ],
                    },
                    [
                      createElement("i", {
                        class: ["fas", "fa-user", "text-sm"],
                      }),
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
                        contact.name
                      ),
                    ]
                  ),
                ]
              )
            )
          ),
          createElement(
            "button",
            {
              class: [
                "mt-4",
                "w-full",
                "bg-gray-500",
                "text-white",
                "py-2",
                "rounded",
                "hover:bg-gray-600",
              ],
              onclick: closeContactSelector,
            },
            "Annuler"
          ),
        ]
      ),
    ]
  );

  document.body.appendChild(modal);
};

const closeContactSelector = () => {
  const modal = document.getElementById("contactSelectorModal");
  if (modal) modal.remove();
};

const updateChatHeader = (contactName) => {
  const headerElement = document.getElementById("chatHeaderName");
  if (headerElement) {
    headerElement.textContent = contactName;
  }
};

const highlightSelectedContact = (contactId) => {
  if (currentlySelectedContactElement) {
    currentlySelectedContactElement.classList.remove(
      "bg-blue-100",
      "ring",
      "ring-blue-300"
    );
  }

  const newSelectedElement = document.querySelector(
    `[data-contact-id="${contactId}"]`
  );
  if (newSelectedElement) {
    newSelectedElement.classList.add("bg-blue-100", "ring", "ring-blue-300");
    currentlySelectedContactElement = newSelectedElement;
  }
};

const createMessageButtons = () =>
  createElement("ul", { class: ["flex", "gap-x-2", "items-center"] }, [
    createSecureButton("fa-delete-left", () =>
      console.log("Action: Supprimer les messages de la conversation")
    ),
    createSecureButton("fa-box-archive", () => {
      authManager.requireAuth(async () => {
        const selectedContactIds = getSelectedContacts().map(String);
        if (selectedContactIds.length === 0) {
          console.log(
            "Aucun contact sélectionné pour l'archivage/désarchivage."
          );
          alert(
            "Veuillez sélectionner au moins un contact pour archiver ou désarchiver."
          );
          return;
        }

        const users = (await readData("users")) || [];
        let changed = false;
        let archivedCount = 0;
        let unarchivedCount = 0;

        selectedContactIds.forEach((contactId) => {
          const userIndex = users.findIndex((u) => String(u.id) === contactId);
          if (userIndex !== -1) {
            if (users[userIndex].archive === false) {
              users[userIndex].archive = true;
              archivedCount++;
              changed = true;
            } else {
              users[userIndex].archive = false;
              unarchivedCount++;
              changed = true;
            }
          }
        });

        if (changed) {
          await addData("users", users);
          console.info(
            `${archivedCount} contacts archivés, ${unarchivedCount} contacts désarchivés.`
          );
          updateContactList();
          updateContactListArchive();
          resetSelectedContacts();
          alert("Contacts archivés/désarchivés avec succès.");
        } else {
          console.log(
            "Aucun changement de statut d'archive pour les contacts sélectionnés."
          );
        }
      });
    }),
    createSecureButton("fa-square", () =>
      console.log("Action: Marquer comme lu/non lu")
    ),
    createSecureButton("fa-trash", () =>
      console.log("Action: Mettre à la corbeille")
    ),
  ]);

const createSecureButton = (iconClass, onClick) =>
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
          "border-gray-300",
          "rounded-full",
          "flex",
          "items-center",
          "justify-center",
          "transition",
          "hover:bg-gray-100",
          "hover:scale-105",
        ],
        onclick: onClick,
      },
      [
        createElement("i", {
          class: ["block", "text-sm", "fa-solid", iconClass, "text-gray-700"],
        }),
      ]
    )
  );

const renderContactListInPanel = () => {
  updateContactList();
};

const createMessage = () => {
  const chatHeaderName = createElement(
    "span",
    {
      class: ["font-medium", "text-gray-800"],
      id: "chatHeaderName",
      "data-chat-header": true,
    },
    "Sélectionner un contact"
  );

  const messageComponent = createElement(
    "div",
    { class: ["flex", "w-full", "h-screen", "border-t", "border-gray-200"] },
    [
      createElement(
        "div",
        { class: ["flex", "flex-col", "w-full", "h-full"] },
        [
          createElement(
            "div",
            {
              class: [
                "h-16",
                "flex",
                "justify-between",
                "items-center",
                "px-6",
                "border-b",
                "border-gray-200",
                "bg-white",
                "shadow-sm",
              ],
            },
            [
              createElement(
                "div",
                {
                  class: ["flex", "items-center", "gap-3"],
                },
                [
                  createElement(
                    "div",
                    {
                      class: [
                        "w-10",
                        "h-10",
                        "rounded-full",
                        "bg-blue-100",
                        "flex",
                        "items-center",
                        "justify-center",
                      ],
                    },
                    [
                      createElement("i", {
                        class: ["fas", "fa-user", "text-blue-600", "text-lg"],
                      }),
                    ]
                  ),
                  createElement(
                    "div",
                    {
                      class: ["flex", "flex-col"],
                    },
                    [
                      chatHeaderName,
                      createElement(
                        "span",
                        { class: ["text-xs", "text-gray-500"] },
                        "En ligne"
                      ),
                    ]
                  ),
                ]
              ),
              createMessageButtons(),
            ]
          ),
          createElement(
            "div",
            {
              class: [
                "flex-1",
                "overflow-y-auto",
                "bg-gray-50",
                "min-h-[200px]",
              ],
              id: "messagesContainer",
            },
            [
              createElement(
                "div",
                {
                  class: ["text-center", "text-gray-500", "mt-8", "p-4"],
                },
                [
                  createElement(
                    "p",
                    {},
                    "💬 Sélectionnez un contact pour commencer"
                  ),
                  createElement(
                    "button",
                    {
                      class: [
                        "mt-3",
                        "bg-blue-500",
                        "text-white",
                        "px-4",
                        "py-2",
                        "rounded-lg",
                        "hover:bg-blue-600",
                        "transition",
                        "text-sm",
                        "font-medium",
                      ],
                      onclick: () =>
                        authManager.requireAuth(showContactSelector),
                    },
                    "Choisir un contact"
                  ),
                ]
              ),
            ]
          ),
          createElement(
            "div",
            {
              class: [
                "py-3",
                "px-6",
                "bg-white",
                "border-t",
                "border-gray-200",
              ],
            },
            [
              createElement(
                "div",
                { class: ["flex", "items-center", "gap-2"] },
                [
                  createElement(
                    "button",
                    {
                      class: [
                        "w-10",
                        "h-10",
                        "rounded-full",
                        "bg-gray-100",
                        "flex",
                        "items-center",
                        "justify-center",
                        "text-gray-600",
                        "hover:bg-gray-200",
                      ],
                    },
                    [
                      createElement("i", {
                        class: ["fas", "fa-plus", "text-sm"],
                      }),
                    ]
                  ),
                  createElement("input", {
                    type: "text",
                    class: [
                      "flex-1",
                      "h-10",
                      "rounded-full",
                      "border",
                      "border-gray-300",
                      "px-4",
                      "text-sm",
                      "focus:outline-none",
                      "focus:ring-2",
                      "focus:ring-blue-400",
                    ],
                    id: "inputMessage",
                    placeholder: "Écrire un message...",
                    style: { backgroundColor: "#f9fafb" },
                    onkeypress: (e) => {
                      if (e.key === "Enter") {
                        handleSecureMessageSend();
                      }
                    },
                  }),
                  createElement(
                    "button",
                    {
                      class: [
                        "w-10",
                        "h-10",
                        "bg-blue-500",
                        "rounded-full",
                        "flex",
                        "items-center",
                        "justify-center",
                        "text-white",
                        "hover:bg-blue-600",
                      ],
                      id: "envoyer",
                      onclick: handleSecureMessageSend,
                    },
                    [
                      createElement("i", {
                        class: ["fas", "fa-paper-plane", "text-sm"],
                      }),
                    ]
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
    ]
  );

  // Écouter les nouveaux messages
  window.addEventListener("messageSent", (event) => {
    const msg = event.detail;
    const currentUserId = getCurrentUserId();

    if (!currentUserId || !currentRecipient) return;

    const isRelevant =
      (String(msg.senderId) === currentUserId &&
        String(msg.recipientId) === currentRecipient) ||
      (String(msg.recipientId) === currentUserId &&
        String(msg.senderId) === currentRecipient);

    if (isRelevant) {
      const messagesContainer = document.getElementById("messagesContainer");
      if (messagesContainer) {
        displayMessage(msg, String(msg.senderId) === currentUserId);
      }
    }
  });

  return messageComponent;
};

// ===== ÉCOUTEURS D'ÉVÉNEMENTS =====
window.addEventListener("contactSelected", (event) => {
  const { contactId, contactName } = event.detail;
  selectContact(contactId, contactName);
});

// ===== API PUBLIQUE =====
export const messageAPI = {
  sendMessage,
  getCurrentUserId,
  getAvailableContacts,
  getMessages,
  loadConversation,
  selectContact,
  highlightSelectedContact,
  renderContactList: renderContactListInPanel,
  showContactSelector,
  getCurrentRecipient: () => currentRecipient,
  isRecipientSelected: () => Boolean(currentRecipient),
  clearRecipient: () => {
    currentRecipient = null;
    console.log("🔄 Destinataire effacé");
  },
  debugAllMessages: async () => {
    try {
      const messages = (await readData("messages")) || [];
      console.group("📧 TOUS LES MESSAGES SAUVEGARDÉS");
      console.log(`📊 Total: ${messages.length} messages`);
      messages
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .forEach((msg, index) => {
          const time = new Date(msg.timestamp).toLocaleString();
          const selfMsg = msg.isSelfMessage ? " (Note personnelle)" : "";
          console.log(
            `${index + 1}. [${time}] ${msg.senderId} → ${msg.recipientId}: "${
              msg.content
            }"${selfMsg}`
          );
        });
      console.groupEnd();
      return messages;
    } catch (error) {
      console.error("❌ Erreur debug messages:", error);
      return [];
    }
  },
  debugCurrentState: () => {
    console.group("🔍 ÉTAT ACTUEL DE LA MESSAGERIE");
    console.log("Utilisateur actuel:", getCurrentUserId());
    console.log("Destinataire sélectionné:", currentRecipient);
    console.groupEnd();
  },
  clearAllMessages: async () => {
    try {
      console.log("🗑️ Suppression de tous les messages...");
      await addData("messages", []);
      console.log("✅ Tous les messages ont été supprimés");
      const messagesContainer = document.getElementById("messagesContainer");
      if (messagesContainer) {
        messagesContainer.innerHTML = "";
        messagesContainer.appendChild(
          createElement(
            "div",
            { class: ["text-center", "text-gray-500", "mt-8"] },
            [
              createElement("p", {}, "💬 Aucun message pour l'instant"),
              createElement(
                "p",
                { class: ["text-sm", "mt-2"] },
                "Envoyez un message pour commencer la conversation !"
              ),
            ]
          )
        );
      }
    } catch (error) {
      console.error("❌ Erreur suppression messages:", error);
    }
  },
  testGetMessages: async (userId1, userId2) => {
    const messages = await getMessages(userId1, userId2);
    console.table(messages);
    return messages;
  },
};

// ===== EXPORTS =====
export default createMessage;
export {
  sendMessage,
  getCurrentUserId,
  getAvailableContacts,
  getMessages,
  loadConversation,
  selectContact,
  highlightSelectedContact,
  showContactSelector,
  handleSecureMessageSend,
  createMessage,
  renderContactListInPanel,
};
export const testContactSelection = (contactId, contactName) => {
  console.log("🧪 Test de sélection de contact...");
  selectContact(contactId, contactName);
  setTimeout(() => {
    console.log("📊 État après sélection:");
    messageAPI.debugCurrentState();
  }, 100);
};
if (typeof window !== "undefined") {
  window.messageAPI = messageAPI;
  window.testContactSelection = testContactSelection;
}
