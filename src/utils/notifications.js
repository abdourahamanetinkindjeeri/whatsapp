import { createElement } from "./element.js";

// Fonction pour créer une notification popup
export const showNotification = (message, type = "info") => {
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  };

  const notification = createElement(
    "div",
    {
      class: [
        "fixed",
        "top-4",
        "right-4",
        "px-6",
        "py-3",
        "rounded-lg",
        "text-white",
        "shadow-lg",
        "transform",
        "transition-all",
        "duration-300",
        "z-50",
        colors[type] || colors.info,
      ],
    },
    message
  );

  document.body.appendChild(notification);

  // Animation d'entrée
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
    notification.style.opacity = "1";
  }, 100);

  // Supprimer la notification après 3 secondes
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    notification.style.opacity = "0";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
};
