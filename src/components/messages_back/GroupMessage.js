import { createElement } from "../../utils/element.js";
import { readData, addData } from "../../utils/data.js";
import { authManager } from "../auth/authManager.js";
import { updateChatHeader } from "./Message.js";

// Fonction pour envoyer un message dans un groupe
const sendGroupMessage = async (groupId, content) => {
  if (!groupId || !content?.trim()) {
    return { success: false, error: "Données manquantes pour l'envoi" };
  }

  try {
    const currentUser = authManager.getCurrentUserContact();
    const currentUserId = currentUser?.id;
    const users = await readData("users");
    const groups = await readData("groups");

    // Vérifier si l'utilisateur est membre du groupe
    const group = groups.find((g) => String(g.id) === String(groupId));
    if (!group) {
      return { success: false, error: "Groupe non trouvé" };
    }

    const isMember = group.membres?.some(
      (m) => String(m.userId) === String(currentUserId)
    );
    if (!isMember) {
      return { success: false, error: "Vous n'êtes pas membre de ce groupe" };
    }

    const sender = users.find((u) => String(u.id) === String(currentUserId));

    // Créer le message de groupe
    const groupMessage = {
      id: `group_msg_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      groupId: String(groupId),
      senderId: String(currentUserId),
      senderName:
        `${sender?.prenom || ""} ${sender?.nom || ""}`.trim() || "Utilisateur",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: "group",
      readBy: [String(currentUserId)],
    };

    // Sauvegarder le message de groupe
    await addData("groupMessages", groupMessage);

    // Créer un message individuel pour chaque membre du groupe
    const messages = (await readData("messages")) || [];
    const newMessages = group.membres
      .filter((member) => String(member.userId) !== String(currentUserId)) // Exclure l'expéditeur
      .map((member) => ({
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        senderId: String(currentUserId),
        recipientId: String(member.userId),
        content: content.trim(),
        timestamp: new Date().toISOString(),
        status: "sent",
        type: "text",
        isSelfMessage: false,
        groupId: String(groupId), // Ajouter l'ID du groupe pour référence
        groupName: group.nom || "Groupe sans nom", // Ajouter le nom du groupe
        senderName:
          `${sender?.prenom || ""} ${sender?.nom || ""}`.trim() ||
          "Utilisateur",
      }));

    // Ajouter tous les nouveaux messages
    await addData("messages", [...messages, ...newMessages]);

    return { success: true, message: groupMessage };
  } catch (error) {
    console.error("Erreur lors de l'envoi du message de groupe:", error);
    return { success: false, error: error.message };
  }
};

// Fonction pour récupérer les messages d'un groupe
const getGroupMessages = async (groupId) => {
  try {
    const currentUser = authManager.getCurrentUserContact();
    const currentUserId = currentUser?.id;
    const groups = await readData("groups");

    // Vérifier si l'utilisateur est membre du groupe
    const group = groups.find((g) => String(g.id) === String(groupId));
    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    const isMember = group.membres?.some(
      (m) => String(m.userId) === String(currentUserId)
    );
    if (!isMember) {
      throw new Error("Vous n'êtes pas membre de ce groupe");
    }

    // Récupérer les messages de groupe
    const groupMessages = (await readData("groupMessages")) || [];
    const groupMessagesList = groupMessages
      .filter((msg) => String(msg.groupId) === String(groupId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Récupérer les messages individuels liés au groupe
    const messages = (await readData("messages")) || [];
    const individualMessages = messages
      .filter(
        (msg) =>
          String(msg.groupId) === String(groupId) &&
          (String(msg.senderId) === String(currentUserId) ||
            String(msg.recipientId) === String(currentUserId))
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Combiner et dédupliquer les messages
    const allMessages = [...groupMessagesList, ...individualMessages];
    const uniqueMessages = allMessages.filter(
      (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
    );

    return uniqueMessages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
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

  const currentUser = authManager.getCurrentUserContact();
  const currentUserId = currentUser?.id;
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
                    '<i class="text-sm text-gray-600 fas fa-user"></i>';
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
  console.log("=== initGroupChat ===");
  console.log("Group ID:", groupId);

  try {
    const currentUser = authManager.getCurrentUserContact();
    const currentUserId = currentUser?.id;
    console.log("Current User:", currentUser);
    console.log("Current User ID:", currentUserId);

    const groups = await readData("groups");
    console.log("All groups:", groups);

    const group = groups.find((g) => String(g.id) === String(groupId));
    console.log("Found group:", group);

    if (!group) {
      console.error("Group not found!");
      throw new Error("Groupe non trouvé");
    }

    // Vérifier si l'utilisateur est membre du groupe
    const isMember = group.membres?.some(
      (m) => String(m.userId) === String(currentUserId)
    );
    console.log("Is member:", isMember);

    if (!isMember) {
      console.error("User is not a member of the group!");
      throw new Error("Vous n'êtes pas membre de ce groupe");
    }

    console.log("Calling updateChatHeader with:", { group, type: "group" });
    // Mettre à jour l'en-tête et le composant de message
    updateChatHeader(group, "group");

    // Charger et afficher les messages
    const messages = await getGroupMessages(groupId);
    console.log("Group messages:", messages);

    const messagesContainer = document.getElementById("messagesContainer");
    console.log("Messages container:", messagesContainer);

    if (messagesContainer && messages.length > 0) {
      messagesContainer.innerHTML = "";
      for (const message of messages) {
        await displayGroupMessage(message);
      }
    }
  } catch (error) {
    console.error("Error in initGroupChat:", error);
    throw new Error(error.message);
  }

  console.log("=== End initGroupChat ===");
};

export {
  sendGroupMessage,
  getGroupMessages,
  displayGroupMessage,
  initGroupChat,
};
