// import { isValidMessage,isValidConversationParticipants } from "../utils/validators/message";


const isString = (value) => typeof value === "string";
const isNumber = (value) => typeof value === "number";
const isEmptyString = (str) => str.trim() === "";
const isEquals = (firstContent, secondContent) =>
  firstContent === secondContent;
const isValidConversationParticipants = (userId1, userId2) =>
  isNumber(userId1) &&
  isNumber(userId2) &&
  !isEquals(userId1, userId2);

const isValidMessage = (senderId, content) =>
  isNumber(senderId) && isString(content) && !isEmptyString(content);

const createMessage = (senderId, content) => {
  if (!isValidMessage(senderId, content)) {
    throw new Error("Invalid message data");
  }
  return {
    id: Date.now() + Math.random(),
    senderId,
    message: content.trim(),
    date: new Date().toISOString(),
    readBy: [senderId],
    delete: false,
  };
};

const createConversation = (userId1, userId2) => {
        if (!isValidConversationParticipants(userId1, userId2)) {
          throw new Error('Invalid conversation participants');
        }
        return {
          id: Date.now(),
          participants: [userId1, userId2],
          messages: [],
          createdAt: new Date().toISOString()
        };
      }


export { createMessage,createConversation };
// LOGS
try {
  const message = createMessage(1, "Hello world!");
  console.log("✅ Message valide créé :", message);
} catch (e) {
  console.error("❌ Erreur inattendue :", e.message);
}

try {
  const message = createMessage("1", "Hello world!");
  console.log("❌ ERREUR : Ce message n'aurait pas dû être valide.");
} catch (e) {
  console.log("✅ Message invalide rejeté :", e.message);
}

try {
  const message = createMessage(1, "    ");
  console.log("❌ ERREUR : Ce message vide n'aurait pas dû être accepté.");
} catch (e) {
  console.log("✅ Message vide rejeté :", e.message);
}

try {
  const message = createMessage(1, "");
  console.log("❌ ERREUR : Message vide accepté.");
} catch (e) {
  console.log("✅ Message vide rejeté :", e.message);
}

try {
  const message = createMessage(2, "    Bonjour    ");
  console.log("✅ Message avec espaces créé :", message);
} catch (e) {
  console.error("❌ Erreur inattendue :", e.message);
}

try {
  const conv = createConversation(1, 2);
  console.log("✅ Conversation créée :", conv);
} catch (e) {
  console.error("❌ Erreur inattendue :", e.message);
}

try {
  const conv = createConversation(1, 1);
  console.log("❌ Erreur : La conversation ne devrait pas être créée.");
} catch (e) {
  console.log("✅ Participants invalides rejetés :", e.message);
}

try {
  const conv = createConversation("1", 2);
  console.log("❌ Erreur : La conversation ne devrait pas être créée.");
} catch (e) {
  console.log("✅ Type invalide rejeté :", e.message);
}
