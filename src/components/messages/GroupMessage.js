import { createElement } from "../../../utils/element.js";
import { readData, addData } from "../../../utils/data.js";
import { authManager } from "../../auth/authManager.js";

// Fonction pour envoyer un message dans un groupe
const sendGroupMessage = async (groupId, content) => {
  if (!groupId || !content?.trim()) {
    return { success: false, error: "Données manquantes pour l'envoi" };
  }

  try {
    const currentUserId = authManager.getCurrentUserId();
    const users = await readData("users");
    const sender = users.find((u) => String(u.id) === String(currentUserId));

    const messageObj = {
      id: `group_msg_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      groupId: String(groupId),
      senderId: String(currentUserId),
      senderName: sender?.nom || sender?.name || "Utilisateur",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: "group",
      readBy: [String(currentUserId)],
    };

    await addData("groupMessages", messageObj);
    return { success: true, message: messageObj };
  } catch (error) {
    console.error("Erreur lors de l'envoi du message de groupe:", error);
    return { success: false, error: error.message };
  }
};

// Fonction pour récupérer les messages d'un groupe
const getGroupMessages = async (groupId) => {
  try {
    const messages = await readData("groupMessages");
    return messages
      .filter((msg) => String(msg.groupId) === String(groupId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des messages de groupe:",
      error
    );
    return [];
  }
};

// Fonction pour afficher un message de groupe
const displayGroupMessage = async (messageObj) => {
  const messagesContainer = document.getElementById("messagesContainer");
  if (!messagesContainer) return;

  const currentUserId = authManager.getCurrentUserId();
  const isSentByMe = String(messageObj.senderId) === String(currentUserId);

  try {
    const users = await readData("users");
    const sender = users.find(
      (u) => String(u.id) === String(messageObj.senderId)
    );

    const messageElement = createElement(
      "div",
      {
        class: [
          "flex",
          isSentByMe ? "justify-end" : "justify-start",
          "mb-3",
          "items-end",
          "gap-2",
        ],
      },
      [
        // Avatar de l'envoyeur
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
              "flex-shrink-0",
              "overflow-hidden",
            ],
          },
          sender?.profile?.avatar
            ? createElement("img", {
                src: sender.profile.avatar,
                alt: sender.nom || sender.name,
                class: ["w-full", "h-full", "object-cover"],
                onerror: (e) => {
                  console.error("Erreur de chargement de l'avatar:", e);
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<i class="fas fa-user text-gray-600 text-sm"></i>';
                },
              })
            : createElement("i", {
                class: ["fas", "fa-user", "text-sm"],
              })
        ),
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
              isSentByMe
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-800 border-gray-200",
            ],
          },
          [
            // Nom de l'envoyeur pour les messages reçus
            ...(isSentByMe
              ? []
              : [
                  createElement(
                    "div",
                    {
                      class: [
                        "text-xs",
                        "font-medium",
                        "mb-1",
                        "text-gray-600",
                      ],
                    },
                    messageObj.senderName
                  ),
                ]),
            createElement("div", { class: ["text-sm"] }, messageObj.content),
            createElement(
              "div",
              {
                class: [
                  "text-xs",
                  "mt-1",
                  "text-right",
                  isSentByMe ? "text-blue-100" : "text-gray-500",
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
  } catch (error) {
    console.error("Erreur lors de l'affichage du message de groupe:", error);
  }
};

// Fonction pour initialiser la conversation de groupe
const initGroupChat = async (groupId) => {
  try {
    const group = (await readData("groups")).find(
      (g) => String(g.id) === String(groupId)
    );
    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    // Mettre à jour l'en-tête
    const chatHeader = document.getElementById("chatHeader");
    if (chatHeader) {
      chatHeader.innerHTML = "";
      chatHeader.appendChild(
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
                  "bg-gray-500",
                  "flex",
                  "items-center",
                  "justify-center",
                  "font-bold",
                  "text-white",
                ],
              },
              (group.nom || "NN").slice(0, 2).toUpperCase()
            ),
            createElement("div", {}, [
              createElement(
                "div",
                { class: ["font-medium"] },
                group.nom || "Groupe sans nom"
              ),
              createElement(
                "div",
                { class: ["text-sm", "text-gray-500"] },
                `${group.membre?.length || 0} membres`
              ),
            ]),
          ]
        )
      );
    }

    // Vider le conteneur de messages
    const messagesContainer = document.getElementById("messagesContainer");
    if (messagesContainer) {
      messagesContainer.innerHTML = "";

      // Charger et afficher les messages
      const messages = await getGroupMessages(groupId);
      for (const message of messages) {
        await displayGroupMessage(message);
      }
    }

    // Configurer l'input pour l'envoi de messages
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");

    if (messageInput && sendButton) {
      const handleSend = async () => {
        const content = messageInput.value.trim();
        if (content) {
          const result = await sendGroupMessage(groupId, content);
          if (result.success) {
            messageInput.value = "";
            await displayGroupMessage(result.message);
          }
        }
      };

      messageInput.onkeypress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      };

      sendButton.onclick = handleSend;
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation du chat de groupe:", error);
  }
};

export {
  sendGroupMessage,
  getGroupMessages,
  displayGroupMessage,
  initGroupChat,
};
