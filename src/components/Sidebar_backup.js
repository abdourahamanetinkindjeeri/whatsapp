import { createElement } from "../utils/element.js";
import { updateContactListArchive } from "./discussion/contacts/contact.js";
const createSidebar = (updateContactList, updateGroupsList) => {
  const ul = createElement(
    "ul",
    {
      class: ["flex", "flex-col", "gap-y-10", "items-center"],
    },
    [
      createButton("fa-message", "Message", () => alert("Message")),
      createButton("fa-user-group", "Groupes", () => updateGroupsList()),
      createButton(
        "fa-user-group",
        "Diffusions",
        () => updateContactList(),
        true
      ),
      createButton("fa-box-archive", "Archive", () =>
        updateContactListArchive()
      ),
      createButton("fa-plus", "Nouveau", () => {
        const modal = document.getElementById("registerModal");
        if (modal) modal.classList.remove("hidden");
      }),
    ]
  );

  return createElement(
    "div",
    {
      class: [
        "flex",
        "flex-col",
        "w-16",
        "h-screen",
        "bg-gray-750",
        "border-r-4",
        "items-center",
        "justify-center",
      ],
      style: { backgroundColor: "#f1eee9" },
    },
    [ul]
  );
};

const createButton = (iconClass, text, onClick, isDuotone = false) =>
  createElement(
    "li",
    {},
    createElement(
      "button",
      {
        class: [
          "w-[60px]",
          "h-[60px]",
          "border-2",
          "border-gray-400",
          "rounded-lg",
          "flex",
          "flex-col",
          "items-center",
          "justify-center",
          "text-center",
          "overflow-hidden",
          "transition",
          "duration-300",
          "hover:bg-gray-200",
          "hover-bg-gold",
          "hover:scale-105",
          "hover:shadow-md",
          "cursor-pointer",
        ],
        onclick: onClick,
      },
      [
        createElement("i", {
          class: [
            "block",
            "mb-1",
            "text-2xl",
            isDuotone ? "fa-duotone" : "fa-solid",
            iconClass,
          ],
        }),
        createElement(
          "span",
          {
            class: ["text-xs", "leading-none"],
          },
          text
        ),
      ]
    )
  );

export default createSidebar;
