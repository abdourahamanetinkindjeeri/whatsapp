import { updateGroupsList } from "../components/discussion/groups/group.js";
import { updateContactList } from "../components/discussion/contacts/contact.js";
import { isEmptyString, isString, isArray } from "../utils/utililaire.js";

const BASE_URL = "http://localhost:3000"; // adapte selon ton port/config

// ========== CRUD GÉNÉRIQUE ==========

export const readData = async (key) => {
  // Si aucune clé n'est fournie, retourner un objet avec users et groups vides
  if (!key) {
    console.warn("readData appelé sans clé, retour des données par défaut");
    return {
      users: [],
      groups: [],
    };
  }

  try {
    const res = await fetch(`${BASE_URL}/${key}`);
    if (!res.ok) {
      console.warn(`Ressource ${key} non trouvée, retour d'un tableau vide`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Erreur readData pour ${key}:`, error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};

// Alias pour fetchData (pour compatibilité)
export const fetchData = readData;

export const postData = async (key, data) => {
  if (!key) {
    throw new Error("La clé ne peut pas être vide ou undefined");
  }

  try {
    const res = await fetch(`${BASE_URL}/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok)
      throw new Error(
        `Erreur lors de l'ajout de données à ${key}: ${res.status}`
      );
    return await res.json();
  } catch (error) {
    console.error(`Erreur postData pour ${key}:`, error);
    throw error;
  }
};

export const patchData = async (key, id, partialData) => {
  if (!key || !id) {
    throw new Error("La clé et l'id ne peuvent pas être vides ou undefined");
  }

  try {
    const res = await fetch(`${BASE_URL}/${key}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partialData),
    });
    if (!res.ok)
      throw new Error(
        `Erreur lors de la modification de ${key} ${id}: ${res.status}`
      );
    return await res.json();
  } catch (error) {
    console.error(`Erreur patchData pour ${key}/${id}:`, error);
    throw error;
  }
};

export const deleteData = async (key, id) => {
  if (!key || !id) {
    throw new Error("La clé et l'id ne peuvent pas être vides ou undefined");
  }

  try {
    const res = await fetch(`${BASE_URL}/${key}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok)
      throw new Error(
        `Erreur lors de la suppression de ${key} ${id}: ${res.status}`
      );
    return true;
  } catch (error) {
    console.error(`Erreur deleteData pour ${key}/${id}:`, error);
    throw error;
  }
};

// ========== AJOUT ==========

export const addData = async (key, newData) => {
  if (!isString(key) || isEmptyString(key)) {
    throw new Error("La clé doit être une chaîne non vide.");
  }
  if (!newData) {
    throw new Error("Les données à ajouter ne peuvent pas être vides.");
  }

  try {
    await postData(key, newData);

    // Mettre à jour l'UI selon le type de données
    if (key === "users") {
      updateContactList();
    } else if (key === "groups") {
      updateGroupsList();
    }
  } catch (error) {
    console.error(`Erreur lors de l'ajout de ${key}:`, error);
    throw error;
  }
};

// ========== ARCHIVAGE CONTACTS ==========

export const archiveContacts = async (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error("Les IDs doivent être un tableau non vide");
  }

  try {
    const users = await readData("users");

    if (!users || !Array.isArray(users)) {
      throw new Error("Impossible de récupérer la liste des utilisateurs");
    }

    const selected = users.filter((u) => ids.includes(u.id));
    if (selected.length === 0) {
      console.warn("Aucun utilisateur trouvé avec les IDs fournis");
      return false;
    }

    const isArchiving = selected.some((u) => u.archive === false);

    await Promise.all(
      selected.map((user) =>
        patchData("users", user.id, { archive: isArchiving })
      )
    );

    updateContactList();
    return isArchiving;
  } catch (error) {
    console.error("Erreur lors de l'archivage des contacts:", error);
    throw error;
  }
};

export const desarchiveContacts = async (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error("Les IDs doivent être un tableau non vide");
  }

  try {
    const users = await readData("users");

    if (!users || !Array.isArray(users)) {
      throw new Error("Impossible de récupérer la liste des utilisateurs");
    }

    const usersToUpdate = users.filter((u) => ids.includes(u.id));

    await Promise.all(
      usersToUpdate.map((user) =>
        patchData("users", user.id, { archive: !user.archive })
      )
    );

    updateContactList();
  } catch (error) {
    console.error("Erreur lors du désarchivage des contacts:", error);
    throw error;
  }
};

// ========== ARCHIVAGE GROUPES ==========

export const archiveGroups = async (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error("Les IDs doivent être un tableau non vide");
  }

  try {
    const groups = await readData("groups");

    if (!groups || !Array.isArray(groups)) {
      throw new Error("Impossible de récupérer la liste des groupes");
    }

    const groupsToUpdate = groups.filter((g) => ids.includes(g.id));

    await Promise.all(
      groupsToUpdate.map((group) =>
        patchData("groups", group.id, { archive: !group.archive })
      )
    );

    updateGroupsList();
  } catch (error) {
    console.error("Erreur lors de l'archivage des groupes:", error);
    throw error;
  }
};

// ========== SUPPRESSION ==========

export const deleteContacts = async (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error("Les IDs doivent être un tableau non vide");
  }

  try {
    await Promise.all(
      ids.map((id) => patchData("users", id, { delete: true }))
    );

    updateContactList();
  } catch (error) {
    console.error("Erreur lors de la suppression des contacts:", error);
    throw error;
  }
};

export const deleteGroups = async (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error("Les IDs doivent être un tableau non vide");
  }

  try {
    await Promise.all(
      ids.map((id) => patchData("groups", id, { delete: true }))
    );

    updateGroupsList();
  } catch (error) {
    console.error("Erreur lors de la suppression des groupes:", error);
    throw error;
  }
};

// ========== UTILITAIRES ==========

export const getAllData = async () => {
  try {
    const [users, groups] = await Promise.all([
      readData("users"),
      readData("groups"),
    ]);

    return {
      users: users || [],
      groups: groups || [],
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de toutes les données:",
      error
    );
    return {
      users: [],
      groups: [],
    };
  }
};

// ========== VIDE TOUT LE JSON SERVER (ATTENTION) ==========

export const clearJsonServer = async () => {
  try {
    const [users, groups] = await Promise.all([
      readData("users"),
      readData("groups"),
    ]);

    const deletePromises = [];

    if (users && Array.isArray(users)) {
      deletePromises.push(...users.map((u) => deleteData("users", u.id)));
    }

    if (groups && Array.isArray(groups)) {
      deletePromises.push(...groups.map((g) => deleteData("groups", g.id)));
    }

    await Promise.all(deletePromises);

    console.log("JSON Server vidé avec succès.");
  } catch (error) {
    console.error("Erreur lors du vidage du JSON Server:", error);
    throw error;
  }
};

// ========== FONCTIONS SPÉCIFIQUES POUR L'ANCIEN CODE ==========

// Fonction pour maintenir la compatibilité avec l'ancien readData()
export const readAllData = async () => {
  try {
    const [users, groups] = await Promise.all([
      readData("users"),
      readData("groups"),
    ]);

    return {
      users: users || [],
      groups: groups || [],
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de toutes les données:",
      error
    );
    return {
      users: [],
      groups: [],
    };
  }
};

// Fonction pour récupérer les users seulement
export const getUsers = async () => {
  try {
    const users = await readData("users");
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return [];
  }
};

// Fonction pour récupérer les groups seulement
export const getGroups = async () => {
  try {
    const groups = await readData("groups");
    return Array.isArray(groups) ? groups : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des groupes:", error);
    return [];
  }
};

// Fonction pour l'ancien système localStorage (compatibilité)
export const readDataOld = async () => {
  console.warn("readDataOld() est obsolète, utilisez readAllData()");
  return await readAllData();
};
