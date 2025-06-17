// =============================================================================
// DOM UTILITIES
// =============================================================================

function getElementValue(elementId) {
  return document.getElementById(elementId)?.value?.trim() || "";
}

function setElementTextContent(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove("hidden");
  }
}

function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add("hidden");
  }
}

function focusElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.focus();
  }
}

function clearElementValue(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = "";
  }
}

function removeElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.remove();
  }
}

export {
  getElementValue,
  setElementTextContent,
  showElement,
  hideElement,
  focusElement,
  clearElementValue,
  removeElement,
};
