// =============================================================================
// MESSAGE DISPLAY
// =============================================================================

import { createElement } from "../../utils/element";
import { ELEMENT_IDS } from "./constants";

export function displayMessage(message, type) {
  const messageArea = document.getElementById(ELEMENT_IDS.AUTH_MESSAGE);
  if (!messageArea) return;

  const textColor = type === "error" ? "text-red-600" : "text-green-600";
  messageArea.innerHTML = "";
  messageArea.appendChild(
    createElement("p", { class: [textColor, "font-medium"] }, message)
  );
}
