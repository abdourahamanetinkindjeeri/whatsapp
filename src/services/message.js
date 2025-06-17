// import { isValidMessage,isValidConversationParticipants } from "../utils/validators/message";

const isString = (value) => typeof value === "string";
const isNumber = (value) => typeof value === "number";
const isEmptyString = (str) => str.trim() === "";
const isEquals = (firstContent, secondContent) =>
  firstContent === secondContent;

const isValidConversationParticipants = (userId1, userId2) =>
  isNumber(userId1) && isNumber(userId2) && !isEquals(userId1, userId2);

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
    throw new Error("Invalid conversation participants");
  }
  return {
    id: Date.now(),
    participants: [userId1, userId2],
    messages: [],
    createdAt: new Date().toISOString(),
  };
};

export { createMessage, createConversation };
