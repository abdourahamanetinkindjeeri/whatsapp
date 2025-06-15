// PURE FUNCTIONS - DATA ACCESS
// =============================================================================

function loadContactsData() {
  const data = localStorage.getItem("data");
  return data ? JSON.parse(data) : {};
}

function getActiveContacts() {
  return (loadContactsData().users || []).filter(
    (contact) => !contact.delete && !contact.archive
  );
}

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

export {
  loadContactsData,
  getActiveContacts,
  normalizePhoneNumber,
  mapRawContactToContact,
  findContactByPhoneNumber,
  createSearchResult,
};
