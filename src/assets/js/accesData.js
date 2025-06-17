import { ROUTES } from "../../config.js";

async function fetchUsers() {
  try {
    const response = await fetch(ROUTES.USERS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.filter((user) => !user.delete);
  } catch (error) {
    console.error("Erreur de chargement des contacts:", error);
    throw error;
  }
}

async function fetchMessages(userId) {
  try {
    const response = await fetch(ROUTES.USER_MESSAGES(userId), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur de chargement des messages:", error);
    throw error;
  }
}

async function sendMessage(userId, message) {
  try {
    const response = await fetch(ROUTES.MESSAGES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recipientId: userId,
        content: message,
        timestamp: new Date().toISOString(),
        senderId: localStorage.getItem("userId") || "1",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur d'envoi du message:", error);
    throw error;
  }
}

async function createUser(userData) {
  try {
    const response = await fetch(ROUTES.USERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...userData,
        delete: false,
        archive: false,
        profile: {
          avatar: userData.profile?.avatar || "https://via.placeholder.com/150",
          status: userData.profile?.status || "En ligne",
          bio: userData.profile?.bio || "Nouvel utilisateur",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur de création d'utilisateur:", error);
    throw error;
  }
}

async function archiveContact(contactId) {
  try {
    const response = await fetch(`${ROUTES.USERS}/${contactId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ archive: true }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de l'archivage du contact:", error);
    throw error;
  }
}

export { fetchUsers, fetchMessages, sendMessage, createUser, archiveContact };
