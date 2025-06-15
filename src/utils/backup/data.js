import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  isEmptyString,
  isString,
  isFunction,
  isArray,
  throwError,
} from "../utils/utilitaire.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/data.json");

// Lecture des données avec gestion d'erreurs
const readData = () => {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      // Initialisation avec structure WhatsApp
      const initialData = {
        users: [],
        groups: [],
        contacts: [],
        conversations: [],
        messages: [],
        media: [],
        status: [],
      };

      // Créer le dossier si nécessaire
      const dataDir = path.dirname(DATA_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      writeData(initialData);
      return initialData;
    }

    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  } catch (error) {
    throwError("Lecture des données", `Erreur: ${error.message}`);
  }
};

// Écriture des données avec validation
const writeData = (data) => {
  try {
    if (!data || typeof data !== "object") {
      throwError(
        "Écriture des données",
        "Les données doivent être un objet valide"
      );
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    throwError("Écriture des données", `Erreur: ${error.message}`);
  }
};

// Fonction générique pour ajouter des données
const addData = (keyData, newData) => {
  // Validation des paramètres
  if (isEmptyString(keyData) || !isString(keyData)) {
    throwError("Clé de données", "doit être une chaîne non vide");
  }

  if (!newData) {
    throwError("Nouvelles données", "ne peuvent pas être vides");
  }

  const dataJson = readData();

  // Vérifier si la clé existe et est un tableau
  if (!isArray(dataJson[keyData])) {
    throwError(keyData, "n'existe pas ou n'est pas un tableau");
  }

  // Ajouter l'ID et la date de création si pas présents
  const dataWithMetadata = {
    id: newData.id || `${keyData}_${Date.now()}`,
    dateCreation: new Date().toISOString(),
    ...newData,
  };

  dataJson[keyData].push(dataWithMetadata);
  writeData(dataJson);

  return dataWithMetadata;
};

// Fonction pour récupérer des données
const getData = (keyData) => {
  if (isEmptyString(keyData) || !isString(keyData)) {
    throwError("Clé de données", "doit être une chaîne non vide");
  }

  const dataJson = readData();

  if (!dataJson.hasOwnProperty(keyData)) {
    throwError(keyData, "n'existe pas dans les données");
  }

  return dataJson[keyData];
};

// Fonction pour mettre à jour des données
const updateData = (keyData, id, updatedData) => {
  if (isEmptyString(keyData) || !isString(keyData)) {
    throwError("Clé de données", "doit être une chaîne non vide");
  }

  if (!id) {
    throwError("ID", "ne peut pas être vide");
  }

  if (!updatedData) {
    throwError("Données de mise à jour", "ne peuvent pas être vides");
  }

  const dataJson = readData();

  if (!isArray(dataJson[keyData])) {
    throwError(keyData, "n'existe pas ou n'est pas un tableau");
  }

  const index = dataJson[keyData].findIndex((item) => item.id === id);
  if (index === -1) {
    throwError(`Élément avec ID ${id}`, `introuvable dans ${keyData}`);
  }

  dataJson[keyData][index] = {
    ...dataJson[keyData][index],
    ...updatedData,
    dateModification: new Date().toISOString(),
  };

  writeData(dataJson);
  return dataJson[keyData][index];
};

// Fonction pour supprimer des données
const deleteData = (keyData, id) => {
  if (isEmptyString(keyData) || !isString(keyData)) {
    throwError("Clé de données", "doit être une chaîne non vide");
  }

  if (!id) {
    throwError("ID", "ne peut pas être vide");
  }

  const dataJson = readData();

  if (!isArray(dataJson[keyData])) {
    throwError(keyData, "n'existe pas ou n'est pas un tableau");
  }

  const index = dataJson[keyData].findIndex((item) => item.id === id);
  if (index === -1) {
    throwError(`Élément avec ID ${id}`, `introuvable dans ${keyData}`);
  }

  const deletedItem = dataJson[keyData].splice(index, 1)[0];
  writeData(dataJson);

  return deletedItem;
};

// Fonction pour rechercher dans les données
const findData = (keyData, searchFunction) => {
  if (isEmptyString(keyData) || !isString(keyData)) {
    throwError("Clé de données", "doit être une chaîne non vide");
  }

  if (!isFunction(searchFunction)) {
    throwError("Fonction de recherche", "doit être une fonction valide");
  }

  const dataJson = readData();

  if (!isArray(dataJson[keyData])) {
    throwError(keyData, "n'existe pas ou n'est pas un tableau");
  }

  return dataJson[keyData].find(searchFunction);
};

// ========== FONCTIONS SPÉCIFIQUES WHATSAPP ==========

// Ajouter un utilisateur
const addUser = (userData) => {
  if (!userData.username || isEmptyString(userData.username)) {
    throwError("Nom d'utilisateur", "est obligatoire");
  }

  if (!userData.email || isEmptyString(userData.email)) {
    throwError("Email", "est obligatoire");
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = findData(
    "users",
    (user) =>
      user.email === userData.email || user.username === userData.username
  );

  if (existingUser) {
    throwError(
      "Utilisateur",
      "existe déjà avec cet email ou nom d'utilisateur"
    );
  }

  const newUser = {
    id: `user_${Date.now()}`,
    username: userData.username,
    email: userData.email,
    phoneNumber: userData.phoneNumber || null,
    avatar: userData.avatar || null,
    status: userData.status || "En ligne",
    isOnline: true,
    lastSeen: new Date().toISOString(),
    ...userData,
  };

  return addData("users", newUser);
};

// Ajouter un groupe
const addGroup = (groupData) => {
  if (!groupData.name || isEmptyString(groupData.name)) {
    throwError("Nom du groupe", "est obligatoire");
  }

  if (!groupData.adminId) {
    throwError("ID de l'administrateur", "est obligatoire");
  }

  // Vérifier si l'admin existe
  const admin = findData("users", (user) => user.id === groupData.adminId);
  if (!admin) {
    throwError("Administrateur", "introuvable");
  }

  const newGroup = {
    id: `group_${Date.now()}`,
    name: groupData.name,
    description: groupData.description || "",
    adminId: groupData.adminId,
    members: [groupData.adminId], // L'admin est automatiquement membre
    avatar: groupData.avatar || null,
    isPublic: groupData.isPublic || false,
    maxMembers: groupData.maxMembers || 256,
    ...groupData,
  };

  return addData("groups", newGroup);
};

// Ajouter un contact
const addContact = (contactData) => {
  if (!contactData.name || isEmptyString(contactData.name)) {
    throwError("Nom du contact", "est obligatoire");
  }

  if (!contactData.phoneNumber || isEmptyString(contactData.phoneNumber)) {
    throwError("Numéro de téléphone", "est obligatoire");
  }

  const newContact = {
    id: `contact_${Date.now()}`,
    name: contactData.name,
    phoneNumber: contactData.phoneNumber,
    email: contactData.email || null,
    avatar: contactData.avatar || null,
    isBlocked: false,
    isFavorite: false,
    ...contactData,
  };

  return addData("contacts", newContact);
};

// Ajouter un message
const addMessage = (messageData) => {
  if (!messageData.conversationId) {
    throwError("ID de conversation", "est obligatoire");
  }

  if (!messageData.senderId) {
    throwError("ID de l'expéditeur", "est obligatoire");
  }

  if (!messageData.content || isEmptyString(messageData.content)) {
    throwError("Contenu du message", "est obligatoire");
  }

  const newMessage = {
    id: `msg_${Date.now()}`,
    conversationId: messageData.conversationId,
    senderId: messageData.senderId,
    content: messageData.content,
    type: messageData.type || "text",
    timestamp: new Date().toISOString(),
    status: "sent",
    isRead: false,
    isForwarded: false,
    replyTo: messageData.replyTo || null,
    ...messageData,
  };

  return addData("messages", newMessage);
};

// Fonctions utilitaires
const getUserByEmail = (email) => {
  if (!email || isEmptyString(email)) {
    throwError("Email", "ne peut pas être vide");
  }

  return findData("users", (user) => user.email === email);
};

const getUserByUsername = (username) => {
  if (!username || isEmptyString(username)) {
    throwError("Nom d'utilisateur", "ne peut pas être vide");
  }

  return findData("users", (user) => user.username === username);
};

const getGroupsByUser = (userId) => {
  if (!userId) {
    throwError("ID utilisateur", "ne peut pas être vide");
  }

  const groups = getData("groups");
  return groups.filter((group) => group.members.includes(userId));
};

// Exemple d'utilisation corrigé
const exempleUtilisation = () => {
  try {
    // Créer un utilisateur
    const user = addUser({
      username: "jeeri",
      email: "jeeridev@gmail.com",
      phoneNumber: "+33123456789",
    });

    console.log("Utilisateur créé:", user);

    // Créer un groupe avec cet utilisateur comme admin
    const group = addGroup({
      name: "Mon Premier Groupe",
      description: "Un groupe de test",
      adminId: user.id,
    });

    console.log("Groupe créé:", group);
  } catch (error) {
    console.error("Erreur:", error.message);
  }
};

exempleUtilisation();
// Export des fonctions
export {
  // Fonctions de base
  writeData,
  readData,
  addData,
  getData,
  updateData,
  deleteData,
  findData,

  // Fonctions spécifiques WhatsApp
  addUser,
  addGroup,
  addContact,
  addMessage,

  // Fonctions utilitaires
  getUserByEmail,
  getUserByUsername,
  getGroupsByUser,

  // Exemple d'utilisation
  exempleUtilisation,
};
