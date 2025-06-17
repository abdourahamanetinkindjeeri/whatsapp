// PURE FUNCTIONS - DATA ACCESS
// =============================================================================

const API_URL =
  import.meta.env.VITE_API_URL || "https://whatsapp-clone-wmxm.onrender.com";

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
    const response = await fetch(`${API_URL}/users`);
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
    name: rawContact.nom || "Utilisateur",
    phone: rawContact.telephone,
    id: rawContact.id || null,
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

export {
  loadContactsData,
  getActiveContacts,
  normalizePhoneNumber,
  mapRawContactToContact,
  findContactByPhoneNumber,
  createSearchResult,
  refreshContactsData,
};
