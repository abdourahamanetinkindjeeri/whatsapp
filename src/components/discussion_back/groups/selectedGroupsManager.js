// selectedGroupsManager.js
export let selectedGroups = [];

/**
 * Ajoute un groupe à la sélection si pas déjà présent.
 * @param {string|number} groupId
 */
export function addSelectedGroup(groupId) {
  if (!selectedGroups.includes(groupId)) {
    selectedGroups.push(groupId);
  }
}

/**
 * Retire un groupe de la sélection si présent.
 * @param {string|number} groupId
 */
export function removeSelectedGroup(groupId) {
  const index = selectedGroups.indexOf(groupId);
  if (index !== -1) {
    selectedGroups.splice(index, 1);
  }
}

/**
 * Réinitialise complètement la sélection.
 */
export function resetSelectedGroups() {
  selectedGroups.length = 0;
}

/**
 * Récupère la sélection actuelle (copie pour éviter modification externe).
 * @returns {Array}
 */
export function getSelectedGroups() {
  return [...selectedGroups];
}
