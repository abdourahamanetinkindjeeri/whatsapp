import { isEmptyString, isNumber, isString } from "../utililaire";
// const isEmptyString = (contentString) => contentString.trim() === "";
// const isString = (contentString) => typeof contentString === "string";
// const isNumber = (contentNumber) => typeof contentNumber === "number";
// const isEquals = (firstContent, secondContent) =>
//   firstContent === secondContent;

const isValidMessage = (senderId, content) =>
  isNumber(senderId) && isString(content) && !isEmptyString(content);

const isValidConversationParticipants = (userId1, userId2) =>
  isNumber(userId1) && isNumber(userId2) && !isEquals(userId1, userId2);

export  {
    isValidMessage,
    isValidConversationParticipants
}

// Console log
console.log(
  isValidMessage(1, "Bonjour !"), // true
  isValidMessage("1", "Bonjour !"), // false (senderId n'est pas un nombre)
  isValidMessage(1, "   ") // false (message vide)
);

console.log(isValidConversationParticipants(1, 2)); // true
console.log(isValidConversationParticipants(1, 1)); // false (même utilisateur)
console.log(isValidConversationParticipants("1", 2)); // false (userId1 n'est pas un nombre)
