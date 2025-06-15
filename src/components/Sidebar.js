import { createElement } from "../utils/element.js";
import { updateContactListArchive } from "./discussion/contacts/contact.js";

const createSidebar = (updateContactList, updateGroupsList) => {
  const ulTop = createElement(
    "ul",
    {
      class: ["flex", "flex-col", "items-center", "gap-y-2", "py-4"],
    },
    [
      createButton("fa-comment-dots", () => {}, 36),
      createButton("fa-users", () => updateGroupsList()),
      createButton("fa-bullhorn", () => updateContactList()),
      createButton("fa-archive", () => updateContactListArchive(), 1),
      // createButton("fa-plus", () => {
      //   const modal = document.getElementById("registerModal");
      //   if (modal) modal.classList.remove("hidden");
      // }),
      createButton("fa-plus", () => {
        const modal = document.getElementById("registerModal");
        if (modal) {
          console.log("Modal trouvé, suppression de la classe hidden");
          modal.classList.remove("hidden");
        } else {
          console.error("Modal non trouvé");
        }
      }),
    ]
  );

  const ulBottom = createElement(
    "ul",
    {
      class: ["flex", "flex-col", "items-center", "gap-y-2", "py-4"],
    },
    [
      createButton("fa-circle-user", () => alert("Profil")),
      createButton("fa-eye", () => alert("Statut")),
      createButton("fa-gear", () => alert("Paramètres")),
    ]
  );

  return createElement(
    "div",
    {
      class: [
        "w-16",
        "h-screen",
        "bg-[#202d33]",
        "border-r",
        "border-gray-700",
        "flex",
        "flex-col",
        "justify-between", // <-- sépare haut et bas
      ],
    },
    [ulTop, ulBottom]
  );
};

const createButton = (iconClass, onClick, badgeCount = 0) =>
  createElement(
    "li",
    { class: ["relative"] },
    [
      createElement(
        "button",
        {
          class: [
            "w-12",
            "h-12",
            "flex",
            "items-center",
            "justify-center",
            "text-white",
            "hover:bg-[#2a3942]",
            "rounded-lg",
            "transition",
          ],
          onclick: onClick,
        },
        createElement("i", {
          class: ["fa-solid", iconClass, "text-xl"],
        })
      ),
      badgeCount > 0 &&
        createElement("span", {
          class: [
            "absolute",
            "top-0",
            "right-0",
            "bg-[#34b7a7]",
            "text-xs",
            "rounded-full",
            "w-5",
            "h-5",
            "flex",
            "items-center",
            "justify-center",
            "text-black",
            "font-bold",
          ],
          textContent: badgeCount,
        }),
    ].filter(Boolean)
  );

export default createSidebar;
