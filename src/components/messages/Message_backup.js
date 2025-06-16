// // Message.js - Système de messagerie complet

// // ===== IMPORTS =====
// import {
//   updateContactList,
//   updateContactListArchive,
// } from "../discussion/contacts/contact.js";
// import { readData, addData } from "../../utils/data.js";
// import {
//   getSelectedContacts,
//   resetSelectedContacts,
// } from "../discussion/contacts/selectedContactsManager.js";
// import { createElement } from "../../utils/element.js";
// import { authManager } from "../auth/authManager.js";

// // ===== VARIABLES GLOBALES =====
// let currentRecipient = null;
// let messagesContainer = null;
// let currentlySelectedContactElement = null;
// let chatHeaderNameElement = null;

// // ===== FONCTIONS PRINCIPALES =====

// const sendMessage = (idEnvoyeur, userSelection, msg) => {
//   console.log("📤 Envoi de message...");
//   console.log(`👤 Envoyeur: ${idEnvoyeur}`);
//   console.log(`🎯 Destinataire: ${userSelection}`);
//   console.log(`💬 Message: "${msg}"`);

//   if (!idEnvoyeur || !userSelection || !msg?.trim()) {
//     const error = "Données manquantes pour l'envoi";
//     console.error("❌", error);
//     return { success: false, error };
//   }

//   if (String(idEnvoyeur) === String(userSelection)) {
//     console.warn("⚠️ Tentative d'envoi de message à soi-même");
//     console.log("💭 Message à soi-même autorisé (note personnelle)");
//   }

//   try {
//     const messageObj = {
//       id: generateMessageId(),
//       senderId: String(idEnvoyeur),
//       recipientId: String(userSelection),
//       content: msg.trim(),
//       timestamp: new Date().toISOString(),
//       status: "sent",
//       type: "text",
//       isSelfMessage: String(idEnvoyeur) === String(userSelection),
//     };

//     const saved = saveNewMessage(messageObj);

//     if (saved) {
//       console.log("✅ Message envoyé avec succès !");
//       displayMessage(messageObj, true);
//       window.dispatchEvent(
//         new CustomEvent("messageSent", {
//           detail: messageObj,
//         })
//       );
//       return { success: true, message: messageObj };
//     } else {
//       throw new Error("Échec de la sauvegarde");
//     }
//   } catch (error) {
//     console.error("❌ Erreur lors de l'envoi:", error);
//     return { success: false, error: error.message };
//   }
// };

// const saveNewMessage = (messageObj) => {
//   try {
//     const data = readData();

//     // Initialiser messages comme tableau vide si inexistant
//     if (!Array.isArray(data.messages)) {
//       data.messages = [];
//     }

//     // Ajouter le nouveau message
//     data.messages.push(messageObj);

//     // ✅ CORRECTION FINALE: Sauvegarder chaque clé individuellement
//     // Cela évite les problèmes de structure imbriquée
//     addData("messages", data.messages);

//     // Alternative si la première méthode ne marche pas
//     // Sauvegarder toutes les clés principales
//     if (data.users) addData("users", data.users);

//     console.log("💾 Message sauvegardé");
//     return true;
//   } catch (error) {
//     console.error("❌ Erreur de sauvegarde:", error);

//     // Méthode de fallback : sauvegarder directement
//     try {
//       console.log("🔄 Tentative de sauvegarde directe...");

//       // Lire les données actuelles
//       const freshData = readData();

//       // S'assurer que messages est un tableau plat
//       if (!Array.isArray(freshData.messages)) {
//         freshData.messages = [];
//       }

//       // Nettoyer les messages si ils sont corrompus
//       freshData.messages = freshData.messages.filter(
//         (msg) =>
//           msg &&
//           typeof msg === "object" &&
//           msg.id &&
//           msg.content &&
//           !Array.isArray(msg)
//       );

//       // Ajouter le nouveau message
//       freshData.messages.push(messageObj);

//       // Sauvegarder
//       addData("messages", freshData.messages);

//       console.log("💾 Message sauvegardé (méthode de secours)");
//       return true;
//     } catch (fallbackError) {
//       console.error("❌ Erreur sauvegarde de secours:", fallbackError);
//       return false;
//     }
//   }
// };

// const generateMessageId = () => {
//   return "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
// };

// const getCurrentUserId = () => {
//   if (!authManager.isAuthenticated()) {
//     console.warn(
//       "Utilisateur non authentifié. Retourne un ID par défaut ou null."
//     );
//     return null;
//   }
//   const userContact = authManager.getCurrentUserContact();
//   return userContact?.id || authManager.getCurrentUser();
// };

// const getAvailableContacts = () => {
//   try {
//     const data = readData();
//     const contacts = (data.users || []).filter(
//       (contact) => contact.delete === false && contact.archive === false
//     );
//     return contacts.map((contact) => ({
//       id: String(contact.id || contact.nom),
//       name: contact.nom || contact.name,
//       phone: contact.telephone || contact.phone || "N/A",
//     }));
//   } catch (error) {
//     console.error("❌ Erreur récupération contacts:", error);
//     return [];
//   }
// };

// const getMessages = (userId1, userId2) => {
//   try {
//     const data = readData();
//     let messages = data.messages || [];

//     // ✅ NETTOYAGE: S'assurer qu'on a un tableau plat de vrais messages
//     const cleanMessages = [];

//     const flattenMessages = (arr) => {
//       arr.forEach((item) => {
//         if (Array.isArray(item)) {
//           flattenMessages(item); // Récursion pour les tableaux imbriqués
//         } else if (
//           item &&
//           typeof item === "object" &&
//           item.id &&
//           item.content
//         ) {
//           cleanMessages.push(item); // Ajouter seulement les vrais messages
//         }
//       });
//     };

//     if (Array.isArray(messages)) {
//       flattenMessages(messages);
//     }

//     // Supprimer les doublons basés sur l'ID
//     const uniqueMessages = cleanMessages.filter(
//       (message, index, arr) =>
//         arr.findIndex((m) => m.id === message.id) === index
//     );

//     // Filtrer la conversation entre les deux utilisateurs
//     const conversation = uniqueMessages.filter(
//       (msg) =>
//         (String(msg.senderId) === String(userId1) &&
//           String(msg.recipientId) === String(userId2)) ||
//         (String(msg.senderId) === String(userId2) &&
//           String(msg.recipientId) === String(userId1))
//     );

//     // Trier par timestamp
//     conversation.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

//     return conversation;
//   } catch (error) {
//     console.error("❌ Erreur récupération messages:", error);
//     return [];
//   }
// };

// const displayMessage = (messageObj, isSentByMe = false) => {
//   if (!messagesContainer) {
//     console.error(
//       "messagesContainer n'est pas défini. Impossible d'afficher le message."
//     );
//     return;
//   }

//   const isSelfMessage =
//     messageObj.isSelfMessage ||
//     String(messageObj.senderId) === String(messageObj.recipientId);

//   const messageElement = createElement(
//     "div",
//     {
//       class: ["flex", isSentByMe ? "justify-end" : "justify-start", "mb-3"],
//     },
//     [
//       createElement(
//         "div",
//         {
//           class: [
//             "max-w-xs",
//             "lg:max-w-md",
//             "px-4",
//             "py-2",
//             "rounded-lg",
//             isSelfMessage
//               ? "bg-yellow-100"
//               : isSentByMe
//               ? "bg-blue-500"
//               : "bg-white",
//             isSelfMessage
//               ? "text-gray-800"
//               : isSentByMe
//               ? "text-white"
//               : "text-gray-800",
//             "shadow-sm",
//             "border",
//             isSelfMessage ? "border-yellow-300" : "border-gray-200",
//           ],
//         },
//         [
//           ...(isSelfMessage
//             ? [
//                 createElement(
//                   "div",
//                   {
//                     class: ["flex", "items-center", "gap-1", "mb-1"],
//                   },
//                   [
//                     createElement("i", {
//                       class: [
//                         "fas",
//                         "fa-sticky-note",
//                         "text-yellow-600",
//                         "text-xs",
//                       ],
//                     }),
//                     createElement(
//                       "span",
//                       {
//                         class: ["text-xs", "text-yellow-600", "font-medium"],
//                       },
//                       "Note personnelle"
//                     ),
//                   ]
//                 ),
//               ]
//             : []),
//           createElement(
//             "p",
//             {
//               class: ["text-sm", "break-words"],
//             },
//             messageObj.content
//           ),
//           createElement(
//             "p",
//             {
//               class: [
//                 "text-xs",
//                 "mt-1",
//                 "opacity-70",
//                 isSentByMe ? "text-right" : "text-left",
//               ],
//             },
//             new Date(messageObj.timestamp).toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             })
//           ),
//         ]
//       ),
//     ]
//   );

//   messagesContainer.appendChild(messageElement);
//   messagesContainer.scrollTop = messagesContainer.scrollHeight;
// };

// const loadConversation = (recipientId) => {
//   if (!messagesContainer) {
//     console.error(
//       "messagesContainer n'est pas défini lors du chargement de la conversation."
//     );
//     return;
//   }
//   const currentUserId = getCurrentUserId();
//   if (!currentUserId) {
//     console.error(
//       "Utilisateur actuel non défini. Impossible de charger la conversation."
//     );
//     return;
//   }

//   messagesContainer.innerHTML = "";
//   const messages = getMessages(currentUserId, recipientId);

//   if (messages.length === 0) {
//     messagesContainer.appendChild(
//       createElement(
//         "div",
//         {
//           class: ["text-center", "text-gray-500", "mt-8"],
//         },
//         [
//           createElement("p", {}, "💬 Aucun message pour l'instant"),
//           createElement(
//             "p",
//             {
//               class: ["text-sm", "mt-2"],
//             },
//             "Envoyez un message pour commencer la conversation !"
//           ),
//         ]
//       )
//     );
//   } else {
//     messages.forEach((msg) => {
//       const isSentByMe = String(msg.senderId) === String(currentUserId);
//       displayMessage(msg, isSentByMe);
//     });
//   }

//   currentRecipient = recipientId;
//   console.log(`💬 Conversation chargée avec: ${recipientId}`);
// };

// // ✨ FONCTION CLÉ: Sélectionner un contact (utilisée par contact.js)
// const selectContact = (contactId, contactName) => {
//   console.log(`👤 Contact sélectionné: ${contactName} (${contactId})`);

//   const normalizedContactId = String(contactId);
//   currentRecipient = normalizedContactId;

//   loadConversation(normalizedContactId);
//   updateChatHeader(contactName);
//   highlightSelectedContact(normalizedContactId);
//   closeContactSelector();

//   const inputMessage = document.getElementById("inputMessage");
//   if (inputMessage) {
//     inputMessage.focus();
//     inputMessage.style.backgroundColor = "#f0f9ff";
//     setTimeout(() => {
//       inputMessage.style.backgroundColor = "#f9fafb";
//     }, 1500);
//   }

//   window.dispatchEvent(
//     new CustomEvent("messageRecipientSelected", {
//       detail: {
//         contactId: normalizedContactId,
//         contactName: contactName,
//         timestamp: new Date().toISOString(),
//       },
//     })
//   );

//   console.log(
//     `✅ Contact ${contactName} sélectionné avec succès pour la messagerie`
//   );
// };

// const handleSecureMessageSend = () => {
//   authManager.requireAuth(() => {
//     _performSendMessage();
//   });
// };

// const _performSendMessage = () => {
//   const messageInput = document.getElementById("inputMessage");
//   const message = messageInput?.value?.trim();

//   if (!message) {
//     console.warn("⚠️ Message vide.");
//     if (messageInput) {
//       messageInput.style.backgroundColor = "#fef2f2";
//       messageInput.placeholder = "Veuillez écrire un message...";
//       setTimeout(() => {
//         messageInput.style.backgroundColor = "#f9fafb";
//         messageInput.placeholder = "Écrire un message...";
//       }, 2000);
//     }
//     return;
//   }

//   if (!currentRecipient) {
//     console.warn(
//       "⚠️ Aucun destinataire sélectionné. Affichage du sélecteur de contact."
//     );
//     if (messageInput) {
//       messageInput.style.backgroundColor = "#fef3cd";
//       messageInput.placeholder = "Sélectionnez d'abord un contact...";
//       setTimeout(() => {
//         messageInput.style.backgroundColor = "#f9fafb";
//         messageInput.placeholder = "Écrire un message...";
//       }, 3000);
//     }
//     showContactSelector();
//     return;
//   }

//   const currentUserId = getCurrentUserId();
//   if (!currentUserId) {
//     console.error(
//       "❌ Utilisateur actuel non défini. Impossible d'envoyer le message."
//     );
//     return;
//   }

//   console.log(`📤 Envoi du message vers ${currentRecipient}: "${message}"`);
//   const result = sendMessage(currentUserId, currentRecipient, message);

//   if (result.success) {
//     messageInput.value = "";
//     messageInput.style.backgroundColor = "#f0fdf4";
//     setTimeout(() => {
//       messageInput.style.backgroundColor = "#f9fafb";
//     }, 1000);
//     console.log("✅ Message envoyé avec succès !");
//   } else {
//     console.error("❌ Échec envoi:", result.error);
//     messageInput.style.backgroundColor = "#fef2f2";
//     setTimeout(() => {
//       messageInput.style.backgroundColor = "#f9fafb";
//     }, 2000);
//   }
// };

// const showContactSelector = () => {
//   const contacts = getAvailableContacts();

//   if (contacts.length === 0) {
//     console.warn("⚠️ Aucun contact disponible.");
//     console.log("Aucun contact disponible pour commencer une conversation.");
//     return;
//   }

//   const modal = createElement(
//     "div",
//     {
//       class: [
//         "fixed",
//         "inset-0",
//         "bg-black",
//         "bg-opacity-50",
//         "flex",
//         "items-center",
//         "justify-center",
//         "z-50",
//       ],
//       id: "contactSelectorModal",
//     },
//     [
//       createElement(
//         "div",
//         {
//           class: ["bg-white", "rounded-lg", "p-6", "max-w-md", "w-full", "m-4"],
//         },
//         [
//           createElement(
//             "h3",
//             {
//               class: ["text-lg", "font-semibold", "mb-4"],
//             },
//             "Sélectionner un contact"
//           ),
//           createElement(
//             "div",
//             {
//               class: ["space-y-2", "max-h-64", "overflow-y-auto"],
//             },
//             contacts.map((contact) =>
//               createElement(
//                 "button",
//                 {
//                   class: [
//                     "w-full",
//                     "text-left",
//                     "p-3",
//                     "hover:bg-gray-100",
//                     "rounded",
//                     "border",
//                     "transition",
//                     "flex",
//                     "items-center",
//                     "gap-3",
//                   ],
//                   onclick: () => selectContact(contact.id, contact.name),
//                 },
//                 [
//                   createElement(
//                     "div",
//                     {
//                       class: [
//                         "w-8",
//                         "h-8",
//                         "rounded-full",
//                         "bg-gray-200",
//                         "flex",
//                         "items-center",
//                         "justify-center",
//                         "text-gray-600",
//                       ],
//                     },
//                     [
//                       createElement("i", {
//                         class: ["fas", "fa-user", "text-sm"],
//                       }),
//                     ]
//                   ),
//                   createElement(
//                     "div",
//                     {
//                       class: ["flex-1"],
//                     },
//                     [
//                       createElement(
//                         "div",
//                         {
//                           class: ["font-medium"],
//                         },
//                         contact.name
//                       ),
//                       createElement(
//                         "div",
//                         {
//                           class: ["text-sm", "text-gray-500"],
//                         },
//                         contact.phone
//                       ),
//                     ]
//                   ),
//                 ]
//               )
//             )
//           ),
//           createElement(
//             "button",
//             {
//               class: [
//                 "mt-4",
//                 "w-full",
//                 "bg-gray-500",
//                 "text-white",
//                 "py-2",
//                 "rounded",
//                 "hover:bg-gray-600",
//               ],
//               onclick: closeContactSelector,
//             },
//             "Annuler"
//           ),
//         ]
//       ),
//     ]
//   );

//   document.body.appendChild(modal);
// };

// const closeContactSelector = () => {
//   const modal = document.getElementById("contactSelectorModal");
//   if (modal) modal.remove();
// };

// const updateChatHeader = (contactName) => {
//   if (chatHeaderNameElement) {
//     chatHeaderNameElement.textContent = contactName;
//   }
// };

// const highlightSelectedContact = (contactId) => {
//   if (currentlySelectedContactElement) {
//     currentlySelectedContactElement.classList.remove(
//       "bg-blue-100",
//       "ring",
//       "ring-blue-300"
//     );
//   }

//   const newSelectedElement = document.querySelector(
//     `[data-contact-id="${contactId}"]`
//   );
//   if (newSelectedElement) {
//     newSelectedElement.classList.add("bg-blue-100", "ring", "ring-blue-300");
//     currentlySelectedContactElement = newSelectedElement;
//   }
// };

// const createMessageButtons = () =>
//   createElement("ul", { class: ["flex", "gap-x-2", "items-center"] }, [
//     createSecureButton("fa-delete-left", "red-500", "red-300", () =>
//       console.log("Action: Supprimer les messages de la conversation")
//     ),
//     createSecureButton("fa-box-archive", "gray-400", "gray-400", () => {
//       authManager.requireAuth(() => {
//         const selectedContactIds = getSelectedContacts().map(String);
//         if (selectedContactIds.length === 0) {
//           console.log(
//             "Aucun contact sélectionné pour l'archivage/désarchivage."
//           );
//           console.log(
//             "Veuillez sélectionner au moins un contact pour archiver ou désarchiver."
//           );
//           return;
//         }

//         const data = readData();
//         let changed = false;
//         let archivedCount = 0;
//         let unarchivedCount = 0;

//         selectedContactIds.forEach((contactId) => {
//           const userIndex = data.users.findIndex(
//             (u) => String(u.id) === contactId
//           );
//           if (userIndex !== -1) {
//             if (data.users[userIndex].archive === false) {
//               data.users[userIndex].archive = true;
//               archivedCount++;
//               changed = true;
//             } else {
//               data.users[userIndex].archive = false;
//               unarchivedCount++;
//               changed = true;
//             }
//           }
//         });

//         if (changed) {
//           // ✅ CORRECTION: Sauvegarder seulement les utilisateurs modifiés
//           addData("users", data.users);
//           console.info(
//             `${archivedCount} contacts archivés, ${unarchivedCount} contacts désarchivés.`
//           );
//           updateContactList();
//           updateContactListArchive();
//           resetSelectedContacts();
//           console.log("Contacts archivés/désarchivés avec succès.");
//         } else {
//           console.log(
//             "Aucun changement de statut d'archive pour les contacts sélectionnés."
//           );
//         }
//       });
//     }),
//     createSecureButton("fa-square", "gray-700", "gray-600", () =>
//       console.log("Action: Marquer comme lu/non lu")
//     ),
//     createSecureButton("fa-trash", "red-600", "red-600", () =>
//       console.log("Action: Mettre à la corbeille")
//     ),
//   ]);

// const createSecureButton = (iconClass, textColor, borderColor, onClick) =>
//   createElement(
//     "li",
//     {},
//     createElement(
//       "button",
//       {
//         class: [
//           "w-9",
//           "h-9",
//           "border-2",
//           `border-${borderColor}`,
//           "rounded-full",
//           "flex",
//           "items-center",
//           "justify-center",
//           "transition",
//           "hover:bg-gray-100",
//           "hover:scale-105",
//           "cursor-pointer",
//         ],
//         onclick: onClick,
//       },
//       [
//         createElement("i", {
//           class: [
//             "block",
//             "text-sm",
//             "fa-solid",
//             iconClass,
//             `text-${textColor}`,
//           ],
//         }),
//       ]
//     ),
//     true
//   );

// const renderContactListInPanel = () => {
//   updateContactList(); // Appelle votre fonction existante dans contact.js
// };

// const createMessage = () => {
//   const messageComponent = createElement(
//     "div",
//     { class: ["flex", "w-full", "h-screen", "border-t", "border-gray-200"] },
//     [
//       // Panneau de gauche pour la liste des contacts
//       createElement(
//         "div",
//         {
//           class: [
//             "w-1/3",
//             "h-full",
//             "border-r",
//             "border-gray-200",
//             "bg-white",
//             "flex",
//             "flex-col",
//           ],
//         },
//         [
//           // Barre de recherche
//           createElement(
//             "div",
//             { class: ["p-3", "border-b", "border-gray-200"] },
//             [
//               createElement("input", {
//                 type: "text",
//                 placeholder: "Rechercher un contact",
//                 class: [
//                   "w-full",
//                   "p-2",
//                   "rounded-full",
//                   "border",
//                   "border-gray-300",
//                   "focus:outline-none",
//                   "focus:ring-1",
//                   "focus:ring-blue-400",
//                   "text-sm",
//                 ],
//               }),
//             ]
//           ),
//           // Conteneur des contacts
//           createElement(
//             "div",
//             {
//               class: ["flex-1", "overflow-y-auto", "p-2"],
//               id: "discussionList", // ✅ Correspond à votre contact.js
//             },
//             []
//           ),
//         ]
//       ),

//       // Panneau de droite pour la conversation
//       createElement("div", { class: ["flex", "flex-col", "w-2/3", "h-full"] }, [
//         // En-tête du chat
//         createElement(
//           "div",
//           {
//             class: [
//               "h-10",
//               "flex",
//               "justify-between",
//               "items-center",
//               "px-3",
//               "border-b",
//               "border-gray-200",
//             ],
//             style: { backgroundColor: "#f0e7d8" },
//           },
//           [
//             // En-tête avec info du contact
//             createElement(
//               "div",
//               {
//                 class: ["flex", "items-center", "gap-2"],
//               },
//               [
//                 createElement(
//                   "div",
//                   {
//                     class: [
//                       "w-8",
//                       "h-8",
//                       "rounded-full",
//                       "border-2",
//                       "border-gray-500",
//                       "bg-gray-200",
//                       "flex",
//                       "items-center",
//                       "justify-center",
//                     ],
//                   },
//                   [
//                     createElement("i", {
//                       class: ["fas", "fa-user", "text-gray-600", "text-xs"],
//                     }),
//                   ]
//                 ),
//                 (chatHeaderNameElement = createElement(
//                   "span",
//                   {
//                     class: ["text-sm", "font-medium", "text-gray-700"],
//                     "data-chat-header": true,
//                   },
//                   currentRecipient ? "Chargement..." : "Sélectionner un contact"
//                 )),
//               ]
//             ),
//             createMessageButtons(),
//           ]
//         ),

//         // Zone des messages
//         createElement(
//           "div",
//           {
//             class: ["flex-1", "overflow-y-auto", "p-4"],
//             style: { backgroundColor: "#f0f6f0" },
//             id: "messagesContainer",
//           },
//           [
//             createElement(
//               "div",
//               {
//                 class: ["text-center", "text-gray-500", "mt-8"],
//               },
//               [
//                 createElement(
//                   "p",
//                   {},
//                   "💬 Sélectionnez un contact pour commencer"
//                 ),
//                 createElement(
//                   "button",
//                   {
//                     class: [
//                       "mt-3",
//                       "bg-blue-500",
//                       "text-white",
//                       "px-4",
//                       "py-2",
//                       "rounded",
//                       "hover:bg-blue-600",
//                       "transition",
//                     ],
//                     onclick: () => authManager.requireAuth(showContactSelector),
//                   },
//                   "Choisir un contact"
//                 ),
//               ]
//             ),
//           ]
//         ),

//         // Zone de saisie du message
//         createElement(
//           "div",
//           { class: ["my-2", "px-3", "flex", "items-center", "gap-2"] },
//           [
//             createElement("input", {
//               type: "text",
//               class: [
//                 "flex-1",
//                 "h-9",
//                 "rounded-full",
//                 "border",
//                 "border-gray-300",
//                 "px-3",
//                 "text-sm",
//                 "focus:outline-none",
//                 "focus:ring-1",
//                 "focus:ring-blue-400",
//               ],
//               id: "inputMessage",
//               placeholder: "Écrire un message...",
//               style: { backgroundColor: "#f9fafb" },
//               onkeypress: (e) => {
//                 if (e.key === "Enter") {
//                   handleSecureMessageSend();
//                 }
//               },
//             }),
//             createElement(
//               "button",
//               {
//                 class: [
//                   "w-9",
//                   "h-9",
//                   "bg-green-500",
//                   "rounded-full",
//                   "flex",
//                   "items-center",
//                   "justify-center",
//                   "text-white",
//                   "hover:bg-green-600",
//                 ],
//                 id: "envoyer",
//                 onclick: handleSecureMessageSend,
//               },
//               [
//                 createElement("i", {
//                   class: ["fas", "fa-arrow-right", "text-sm"],
//                 }),
//               ]
//             ),
//           ]
//         ),
//       ]),
//     ]
//   );

//   // Initialisation des références DOM
//   setTimeout(() => {
//     messagesContainer = document.getElementById("messagesContainer");
//     renderContactListInPanel();
//   }, 0);

//   return messageComponent;
// };

// // ===== ÉCOUTEURS D'ÉVÉNEMENTS =====

// // Écouteur pour la sélection de contact depuis contact.js
// window.addEventListener("contactSelected", (event) => {
//   const { contactId, contactName } = event.detail;
//   console.log("📡 Événement de sélection de contact reçu:", event.detail);
//   selectContact(contactId, contactName);
// });

// // ===== API PUBLIQUE =====

// export const messageAPI = {
//   // Fonctions principales
//   sendMessage,
//   getCurrentUserId,
//   getAvailableContacts,
//   getMessages,
//   loadConversation,
//   selectContact, // ✅ Fonction clé pour contact.js
//   highlightSelectedContact,
//   renderContactList: renderContactListInPanel,
//   showContactSelector,

//   // Fonctions utilitaires
//   getCurrentRecipient: () => currentRecipient,
//   isRecipientSelected: () => Boolean(currentRecipient),
//   clearRecipient: () => {
//     currentRecipient = null;
//     console.log("🔄 Destinataire effacé");
//   },

//   // Fonctions de debug
//   debugAllMessages: () => {
//     try {
//       const data = readData();
//       let messages = data.messages || [];

//       // ✅ NETTOYAGE: Aplatir et nettoyer les messages pour le debug
//       const cleanMessages = [];

//       const flattenMessages = (arr) => {
//         arr.forEach((item) => {
//           if (Array.isArray(item)) {
//             flattenMessages(item);
//           } else if (
//             item &&
//             typeof item === "object" &&
//             item.id &&
//             item.content
//           ) {
//             cleanMessages.push(item);
//           }
//         });
//       };

//       if (Array.isArray(messages)) {
//         flattenMessages(messages);
//       }

//       // Supprimer les doublons
//       const uniqueMessages = cleanMessages.filter(
//         (message, index, arr) =>
//           arr.findIndex((m) => m.id === message.id) === index
//       );

//       console.group("📧 TOUS LES MESSAGES SAUVEGARDÉS");
//       console.log(`📊 Total: ${uniqueMessages.length} messages uniques`);

//       uniqueMessages
//         .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
//         .forEach((msg, index) => {
//           const time = new Date(msg.timestamp).toLocaleString();
//           const selfMsg = msg.isSelfMessage ? " (Note personnelle)" : "";
//           console.log(
//             `${index + 1}. [${time}] ${msg.senderId} → ${msg.recipientId}: "${
//               msg.content
//             }"${selfMsg}`
//           );
//         });
//       console.groupEnd();
//       return uniqueMessages;
//     } catch (error) {
//       console.error("❌ Erreur debug messages:", error);
//       return [];
//     }
//   },

//   debugCurrentState: () => {
//     console.group("🔍 ÉTAT ACTUEL DE LA MESSAGERIE");
//     console.log("Utilisateur actuel:", getCurrentUserId());
//     console.log("Destinataire sélectionné:", currentRecipient);
//     console.log("Conteneur de messages:", Boolean(messagesContainer));
//     console.log("En-tête chat:", Boolean(chatHeaderNameElement));
//     console.groupEnd();
//   },

//   clearAllMessages: () => {
//     try {
//       console.log("🗑️ Suppression de tous les messages...");

//       // Méthode simple : remplacer par un tableau vide
//       addData("messages", []);

//       console.log("✅ Tous les messages ont été supprimés");

//       // Nettoyer l'interface si une conversation est ouverte
//       if (messagesContainer) {
//         messagesContainer.innerHTML = "";
//         messagesContainer.appendChild(
//           createElement(
//             "div",
//             {
//               class: ["text-center", "text-gray-500", "mt-8"],
//             },
//             [
//               createElement("p", {}, "💬 Aucun message pour l'instant"),
//               createElement(
//                 "p",
//                 {
//                   class: ["text-sm", "mt-2"],
//                 },
//                 "Envoyez un message pour commencer la conversation !"
//               ),
//             ]
//           )
//         );
//       }
//     } catch (error) {
//       console.error("❌ Erreur suppression messages:", error);
//     }
//   },
// };

// // ===== EXPORTS =====

// // Export par défaut (composant principal)
// export default createMessage;

// // Exports nommés pour fonctions individuelles
// export {
//   sendMessage,
//   getCurrentUserId,
//   getAvailableContacts,
//   getMessages,
//   loadConversation,
//   selectContact,
//   highlightSelectedContact,
//   showContactSelector,
//   handleSecureMessageSend,
//   createMessage,
//   renderContactListInPanel,
// };

// // Fonction de test
// export const testContactSelection = (contactId, contactName) => {
//   console.log("🧪 Test de sélection de contact...");
//   selectContact(contactId, contactName);

//   setTimeout(() => {
//     console.log("📊 État après sélection:");
//     messageAPI.debugCurrentState();
//   }, 100);
// };

// // Export global pour accès depuis la console (développement)
// if (typeof window !== "undefined") {
//   window.messageAPI = messageAPI;
//   window.testContactSelection = testContactSelection;
// }

// Message.js - Système de messagerie complet

// ===== IMPORTS =====
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
let messagesContainer = null;
let currentlySelectedContactElement = null;
let chatHeaderNameElement = null;

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
      // Mettre à jour l'affichage pour l'expéditeur
      if (messagesContainer && String(idEnvoyeur) === getCurrentUserId()) {
        displayMessage(messageObj, true);
      }
      // Notifier les deux utilisateurs via un événement
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
        phone: contact.telephone || contact.phone || "N/A",
      }));
  } catch (error) {
    console.error("❌ Erreur récupération contacts:", error);
    return [];
  }
};

const getMessages = async (userId1, userId2) => {
  try {
    const messages = (await readData("messages")) || [];
    const cleanMessages = [];
    const flattenMessages = (arr) => {
      arr.forEach((item) => {
        if (Array.isArray(item)) {
          flattenMessages(item);
        } else if (
          item &&
          typeof item === "object" &&
          item.id &&
          item.content
        ) {
          cleanMessages.push(item);
        }
      });
    };

    if (Array.isArray(messages)) {
      flattenMessages(messages);
    }

    const uniqueMessages = cleanMessages.filter(
      (message, index, arr) =>
        arr.findIndex((m) => m.id === message.id) === index
    );

    const conversation = uniqueMessages
      .filter(
        (msg) =>
          (String(msg.senderId) === String(userId1) &&
            String(msg.recipientId) === String(userId2)) ||
          (String(msg.senderId) === String(userId2) &&
            String(msg.recipientId) === String(userId1))
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return conversation;
  } catch (error) {
    console.error("❌ Erreur récupération messages:", error);
    return [];
  }
};

const displayMessage = (messageObj, isSentByMe = false) => {
  if (!messagesContainer) {
    console.error("messagesContainer n'est pas défini.");
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
            isSelfMessage
              ? "bg-yellow-100"
              : isSentByMe
              ? "bg-blue-500"
              : "bg-white",
            isSelfMessage
              ? "text-gray-800"
              : isSentByMe
              ? "text-white"
              : "text-gray-800",
            "shadow-sm",
            "border",
            isSelfMessage ? "border-yellow-300" : "border-gray-200",
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
  if (!messagesContainer) {
    console.error("messagesContainer non défini.");
    return;
  }
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    console.error("Utilisateur non défini.");
    return;
  }

  messagesContainer.innerHTML = "";
  const messages = await getMessages(currentUserId, recipientId);

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
  }

  currentRecipient = recipientId;
  console.log(`💬 Conversation chargée avec: ${recipientId}`);
};

// ✨ FONCTION CLÉ: Sélectionner un contact (utilisée par contact.js)
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
    console.log("Aucun contact disponible pour commencer une conversation.");
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
                      createElement(
                        "div",
                        {
                          class: ["text-sm", "text-gray-500"],
                        },
                        contact.phone
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
  if (chatHeaderNameElement) {
    chatHeaderNameElement.textContent = contactName;
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
    createSecureButton("fa-delete-left", "red-500", "red-300", () =>
      console.log("Action: Supprimer les messages de la conversation")
    ),
    createSecureButton("fa-box-archive", "gray-400", "gray-400", () => {
      authManager.requireAuth(async () => {
        const selectedContactIds = getSelectedContacts().map(String);
        if (selectedContactIds.length === 0) {
          console.log(
            "Aucun contact sélectionné pour l'archivage/désarchivage."
          );
          console.log(
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
          console.log("Contacts archivés/désarchivés avec succès.");
        } else {
          console.log(
            "Aucun changement de statut d'archive pour les contacts sélectionnés."
          );
        }
      });
    }),
    createSecureButton("fa-square", "gray-700", "gray-600", () =>
      console.log("Action: Marquer comme lu/non lu")
    ),
    createSecureButton("fa-trash", "red-600", "red-600", () =>
      console.log("Action: Mettre à la corbeille")
    ),
  ]);

const createSecureButton = (iconClass, textColor, borderColor, onClick) =>
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
        onclick: onClick,
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

const renderContactListInPanel = () => {
  updateContactList();
};

const createMessage = () => {
  const messageComponent = createElement(
    "div",
    { class: ["flex", "w-full", "h-screen", "border-t", "border-gray-200"] },
    [
      createElement(
        "div",
        {
          class: [
            "w-1/3",
            "h-full",
            "border-r",
            "border-gray-200",
            "bg-white",
            "flex",
            "flex-col",
          ],
        },
        [
          createElement(
            "div",
            { class: ["p-3", "border-b", "border-gray-200"] },
            [
              createElement("input", {
                type: "text",
                placeholder: "Rechercher un contact",
                class: [
                  "w-full",
                  "p-2",
                  "rounded-full",
                  "border",
                  "border-gray-300",
                  "focus:outline-none",
                  "focus:ring-1",
                  "focus:ring-blue-400",
                  "text-sm",
                ],
              }),
            ]
          ),
          createElement(
            "div",
            {
              class: ["flex-1", "overflow-y-auto", "p-2"],
              id: "discussionList",
            },
            []
          ),
        ]
      ),
      createElement("div", { class: ["flex", "flex-col", "w-2/3", "h-full"] }, [
        createElement(
          "div",
          {
            class: [
              "h-10",
              "flex",
              "justify-between",
              "items-center",
              "px-3",
              "border-b",
              "border-gray-200",
            ],
            style: { backgroundColor: "#f0e7d8" },
          },
          [
            createElement(
              "div",
              {
                class: ["flex", "items-center", "gap-2"],
              },
              [
                createElement(
                  "div",
                  {
                    class: [
                      "w-8",
                      "h-8",
                      "rounded-full",
                      "border-2",
                      "border-gray-500",
                      "bg-gray-200",
                      "flex",
                      "items-center",
                      "justify-center",
                    ],
                  },
                  [
                    createElement("i", {
                      class: ["fas", "fa-user", "text-gray-600", "text-xs"],
                    }),
                  ]
                ),
                (chatHeaderNameElement = createElement(
                  "span",
                  {
                    class: ["text-sm", "font-medium", "text-gray-700"],
                    "data-chat-header": true,
                  },
                  currentRecipient ? "Chargement..." : "Sélectionner un contact"
                )),
              ]
            ),
            createMessageButtons(),
          ]
        ),
        createElement(
          "div",
          {
            class: ["flex-1", "overflow-y-auto", "p-4"],
            style: { backgroundColor: "#f0f6f0" },
            id: "messagesContainer",
          },
          [
            createElement(
              "div",
              {
                class: ["text-center", "text-gray-500", "mt-8"],
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
                      "rounded",
                      "hover:bg-blue-600",
                      "transition",
                    ],
                    onclick: () => authManager.requireAuth(showContactSelector),
                  },
                  "Choisir un contact"
                ),
              ]
            ),
          ]
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
                onclick: handleSecureMessageSend,
              },
              [
                createElement("i", {
                  class: ["fas", "fa-arrow-right", "text-sm"],
                }),
              ]
            ),
          ]
        ),
      ]),
    ]
  );

  // Initialisation des références DOM
  setTimeout(() => {
    messagesContainer = document.getElementById("messagesContainer");
    renderContactListInPanel();

    // Écouter les nouveaux messages pour mise à jour en temps réel
    window.addEventListener("messageSent", async (event) => {
      const msg = event.detail;
      const currentUserId = getCurrentUserId();
      if (
        currentUserId &&
        (String(msg.senderId) === currentUserId ||
          String(msg.recipientId) === currentUserId) &&
        messagesContainer
      ) {
        if (
          currentRecipient === String(msg.senderId) ||
          currentRecipient === String(msg.recipientId)
        ) {
          await loadConversation(currentRecipient); // Recharger la conversation pour mise à jour
        }
      }
    });
  }, 0);

  return messageComponent;
};

// ===== ÉCOUTEURS D'ÉVÉNEMENTS =====

// Écouteur pour la sélection de contact depuis contact.js
window.addEventListener("contactSelected", (event) => {
  const { contactId, contactName } = event.detail;
  console.log("📡 Événement de sélection de contact reçu:", event.detail);
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
      const cleanMessages = [];
      const flattenMessages = (arr) => {
        arr.forEach((item) => {
          if (Array.isArray(item)) {
            flattenMessages(item);
          } else if (
            item &&
            typeof item === "object" &&
            item.id &&
            item.content
          ) {
            cleanMessages.push(item);
          }
        });
      };
      if (Array.isArray(messages)) {
        flattenMessages(messages);
      }
      const uniqueMessages = cleanMessages.filter(
        (message, index, arr) =>
          arr.findIndex((m) => m.id === message.id) === index
      );
      console.group("📧 TOUS LES MESSAGES SAUVEGARDÉS");
      console.log(`📊 Total: ${uniqueMessages.length} messages uniques`);
      uniqueMessages
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
      return uniqueMessages;
    } catch (error) {
      console.error("❌ Erreur debug messages:", error);
      return [];
    }
  },
  debugCurrentState: () => {
    console.group("🔍 ÉTAT ACTUEL DE LA MESSAGERIE");
    console.log("Utilisateur actuel:", getCurrentUserId());
    console.log("Destinataire sélectionné:", currentRecipient);
    console.log("Conteneur de messages:", Boolean(messagesContainer));
    console.log("En-tête chat:", Boolean(chatHeaderNameElement));
    console.groupEnd();
  },
  clearAllMessages: async () => {
    try {
      console.log("🗑️ Suppression de tous les messages...");
      await addData("messages", []);
      console.log("✅ Tous les messages ont été supprimés");
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
