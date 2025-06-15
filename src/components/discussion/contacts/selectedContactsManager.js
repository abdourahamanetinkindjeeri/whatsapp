export let selectedContacts = [];

export const addSelectedContact = (id) => {
  if (!selectedContacts.includes(id)) {
    selectedContacts.push(id);
  }
};

export const removeSelectedContact = (id) => {
  selectedContacts = selectedContacts.filter((c) => c !== id);
};

export const getSelectedContacts = () => selectedContacts;

export const resetSelectedContacts = () => {
  selectedContacts = [];
};
