// PURE FUNCTIONS - DATA ACCESS
// =============================================================================

const API_URL = "http://localhost:3000";

// Cache pour stocker les données préchargées
let contactsCache = { users: [] };
let isCacheLoaded = false;
let isCacheLoading = false;

// Fonction de chargement synchrone
function loadContactsData() {
  if (isCacheLoaded) {
    return contactsCache;
  }

  if (!isCacheLoading) {
    isCacheLoading = true;
    loadContactsSync();
  }

  return contactsCache;
}

// Chargement synchrone avec XMLHttpRequest
function loadContactsSync() {
  const request = new XMLHttpRequest();

  try {
    request.open("GET", `${API_URL}/users`, false); // Requête synchrone
    request.send(null);

    if (request.status >= 200 && request.status < 300) {
      contactsCache = { users: JSON.parse(request.responseText) };
      isCacheLoaded = true;
    } else {
      console.error(
        "Erreur de chargement des contacts:",
        request.status,
        request.statusText
      );
    }
  } catch (error) {
    console.error("Erreur de chargement des contacts:", error);
  } finally {
    isCacheLoading = false;
  }
}

function getActiveContacts() {
  const data = loadContactsData();
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

function findContactByPhoneNumber(phone) {
  const contacts = getActiveContacts();
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
function refreshContactsData() {
  isCacheLoaded = false;
  isCacheLoading = false;
  loadContactsData();
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
