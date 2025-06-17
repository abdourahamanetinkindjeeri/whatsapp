// PURE FUNCTIONS - DATA ACCESS
// =============================================================================

import { ROUTES } from "../../config.js";
import { readData, addData } from "../../utils/data.js";

// Cache pour stocker les données préchargées
let contactsCache = { users: [] };
let isCacheLoaded = false;
let isCacheLoading = false;

// Fonction de chargement asynchrone
async function loadContactsData() {
  if (isCacheLoaded) {
    return contactsCache;
  }

  if (!isCacheLoading) {
    isCacheLoading = true;
    await loadContactsAsync();
  }

  return contactsCache;
}

// Chargement asynchrone avec fetch
async function loadContactsAsync() {
  try {
    const response = await fetch(ROUTES.USERS);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    contactsCache = { users: data };
    isCacheLoaded = true;
  } catch (error) {
    console.error("Erreur de chargement des contacts:", error);
  } finally {
    isCacheLoading = false;
  }
}

async function getActiveContacts() {
  const data = await loadContactsData();
  return (data.users || []).filter(
    (contact) => !contact.delete && !contact.archive
  );
}

console.table(getActiveContacts());

function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/[\s\-\(\)\.\+]/g, "").toLowerCase();
}

function mapRawContactToContact(rawContact) {
  return {
    ...rawContact,
    name: rawContact.nom || rawContact.name || "Utilisateur",
    phone: rawContact.telephone || rawContact.phone,
    id: rawContact.id || null,
    profile: rawContact.profile || {
      avatar: null,
      status: "En ligne",
      bio: "",
    },
  };
}

async function findContactByPhoneNumber(phone) {
  const contacts = await getActiveContacts();
  const normalizedInput = normalizePhoneNumber(phone);

  if (!normalizedInput) {
    return createSearchResult(false, null, "Numéro invalide");
  }

  const matchingContact = contacts.find((contact) => {
    const contactPhone = contact.telephone || contact.phone || "";
    return normalizePhoneNumber(contactPhone) === normalizedInput;
  });

  if (!matchingContact) {
    return createSearchResult(
      false,
      null,
      "Numéro non trouvé dans les contacts"
    );
  }

  return createSearchResult(
    true,
    mapRawContactToContact(matchingContact),
    null
  );
}

function createSearchResult(found, contact, error) {
  return { found, contact, error };
}

// Fonction pour forcer le rechargement des données
async function refreshContactsData() {
  isCacheLoaded = false;
  isCacheLoading = false;
  await loadContactsData();
}

// Fonction pour récupérer les messages
async function fetchMessages(userId1, userId2) {
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
    console.error("Erreur lors de la récupération des messages:", error);
    return [];
  }
}

// Fonction pour envoyer un message
async function sendMessage(idEnvoyeur, userSelection, msg) {
  if (!idEnvoyeur || !userSelection || !msg?.trim()) {
    return { success: false, error: "Données manquantes pour l'envoi" };
  }

  try {
    const users = (await readData("users")) || [];
    const sender = users.find((u) => String(u.id) === String(idEnvoyeur));
    const senderName = sender ? sender.nom || sender.name : "Utilisateur";

    const messageObj = {
      id: Date.now() + Math.random(),
      senderId: String(idEnvoyeur),
      recipientId: String(userSelection),
      content: msg.trim(),
      timestamp: new Date().toISOString(),
      status: "sent",
      type: "text",
      isSelfMessage: String(idEnvoyeur) === String(userSelection),
      read: false,
      readAt: null,
      senderName: senderName,
    };

    await addData("messages", messageObj);
    window.dispatchEvent(
      new CustomEvent("messageSent", { detail: messageObj })
    );
    return { success: true, message: messageObj };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export {
  loadContactsData,
  getActiveContacts,
  normalizePhoneNumber,
  mapRawContactToContact,
  findContactByPhoneNumber,
  createSearchResult,
  refreshContactsData,
  fetchMessages,
  sendMessage,
};
