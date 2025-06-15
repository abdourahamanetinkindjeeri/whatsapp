// import { createElement } from "../utils/element.js";
// import { updateContactListArchive } from "./discussion/contacts/contact.js";
// const createSidebar = (updateContactList, updateGroupsList) => {
//   const ul = createElement(
//     "ul",
//     {
//       class: ["flex", "flex-col", "gap-y-10", "items-center"],
//     },
//     [
//       createButton("fa-message", "Message", () => alert("Message")),
//       createButton("fa-user-group", "Groupes", () => updateGroupsList()),
//       createButton(
//         "fa-user-group",
//         "Diffusions",
//         () => updateContactList(),
//         true
//       ),
//       createButton("fa-box-archive", "Archive", () =>
//         updateContactListArchive()
//       ),
//       createButton("fa-plus", "Nouveau", () => {
//         const modal = document.getElementById("registerModal");
//         if (modal) modal.classList.remove("hidden");
//       }),
//     ]
//   );

//   return createElement(
//     "div",
//     {
//       class: [
//         "flex",
//         "flex-col",
//         "w-16",
//         "h-screen",
//         "bg-gray-750",
//         "border-r-4",
//         "items-center",
//         "justify-center",
//       ],
//       style: { backgroundColor: "#f1eee9" },
//     },
//     [ul]
//   );
// };

// const createButton = (iconClass, text, onClick, isDuotone = false) =>
//   createElement(
//     "li",
//     {},
//     createElement(
//       "button",
//       {
//         class: [
//           "w-[60px]",
//           "h-[60px]",
//           "border-2",
//           "border-gray-400",
//           "rounded-lg",
//           "flex",
//           "flex-col",
//           "items-center",
//           "justify-center",
//           "text-center",
//           "overflow-hidden",
//           "transition",
//           "duration-300",
//           "hover:bg-gray-200",
//           "hover-bg-gold",
//           "hover:scale-105",
//           "hover:shadow-md",
//           "cursor-pointer",
//         ],
//         onclick: onClick,
//       },
//       [
//         createElement("i", {
//           class: [
//             "block",
//             "mb-1",
//             "text-2xl",
//             isDuotone ? "fa-duotone" : "fa-solid",
//             iconClass,
//           ],
//         }),
//         createElement(
//           "span",
//           {
//             class: ["text-xs", "leading-none"],
//           },
//           text
//         ),
//       ]
//     )
//   );

// export default createSidebar;
// Version fonctionnelle

// import { createElement } from "../utils/element.js";
// import { updateContactListArchive } from "./discussion/contacts/contact.js";

// const createSidebar = (updateContactList, updateGroupsList) => {
//   const ul = createElement(
//     "ul",
//     {
//       class: ["flex", "flex-col", "p-1", "text-white"],
//     },
//     [
//       createButton("fa-comment-dots", "", () => {}, 36),
//       createButton("fa-users", "", () => updateGroupsList(), 0),
//       createButton("fa-bullhorn", "", () => updateContactList(), 0),
//       createButton(
//         "fa-archive",
//         "Archives",
//         () => updateContactListArchive(),
//         1
//       ),
//       createButton(
//         "fa-plus",
//         "Nouveau",
//         () => {
//           const modal = document.getElementById("registerModal");
//           if (modal) modal.classList.remove("hidden");
//         },
//         0
//       ),
//     ]
//   );

//   return createElement(
//     "div",
//     {
//       class: [
//         "flex",
//         "flex-col",
//         "w-16",
//         "h-screen",
//         "bg-[#202d33]",
//         "border-r",
//         "border-gray-700",
//       ],
//     },
//     [ul]
//   );
// };

// const createButton = (iconClass, text, onClick, badgeCount) =>
//   createElement(
//     "li",
//     {
//       class: [
//         "flex",
//         "items-center",
//         "py-2",
//         "px-2",
//         "hover:bg-[#2a3942]",
//         "relative",
//       ],
//     },
//     [
//       createElement(
//         "button",
//         {
//           class: [
//             "flex",
//             "items-center",
//             "justify-center",
//             "w-full",
//             "text-center",
//             "text-white",
//           ],
//           onclick: onClick,
//         },
//         [
//           createElement("i", {
//             class: ["fa-solid", iconClass, "text-xl"],
//           }),
//           createElement(
//             "span",
//             { class: ["hidden", "md:block", "text-xs", "ml-2"] },
//             text
//           ),
//         ]
//       ),
//       badgeCount > 0 &&
//         createElement("span", {
//           class: [
//             "absolute",
//             "top-1",
//             "right-1",
//             "bg-[#34b7a7]",
//             "text-xs",
//             "rounded-full",
//             "w-5",
//             "h-5",
//             "flex",
//             "items-center",
//             "justify-center",
//           ],
//           textContent: badgeCount,
//         }),
//     ].filter(Boolean)
//   );

// export default createSidebar;

// Version fonctionnelle et acceptable

// import { createElement } from "../utils/element.js";
// import { updateContactListArchive } from "./discussion/contacts/contact.js";

// const createSidebar = (updateContactList, updateGroupsList) => {
//   const ul = createElement(
//     "ul",
//     {
//       class: ["flex", "flex-col", "items-center", "gap-y-2", "py-4"],
//     },
//     [
//       createButton("fa-comment-dots", () => {}, 36),
//       createButton("fa-users", () => updateGroupsList()),
//       createButton("fa-bullhorn", () => updateContactList()),
//       createButton("fa-archive", () => updateContactListArchive(), 1),
//       createButton("fa-plus", () => {
//         const modal = document.getElementById("registerModal");
//         if (modal) modal.classList.remove("hidden");
//       }),
//     ]
//   );

//   return createElement(
//     "div",
//     {
//       class: [
//         "w-16",
//         "h-screen",
//         "bg-[#202d33]",
//         "border-r",
//         "border-gray-700",
//         "flex",
//         "flex-col",
//         "items-center",
//         "justify-start",
//       ],
//     },
//     [ul]
//   );
// };

// const createButton = (iconClass, onClick, badgeCount = 0) =>
//   createElement(
//     "li",
//     { class: ["relative"] },
//     [
//       createElement(
//         "button",
//         {
//           class: [
//             "w-12",
//             "h-12",
//             "flex",
//             "items-center",
//             "justify-center",
//             "text-white",
//             "hover:bg-[#2a3942]",
//             "rounded-lg",
//             "transition",
//           ],
//           onclick: onClick,
//         },
//         createElement("i", {
//           class: ["fa-solid", iconClass, "text-xl"],
//         })
//       ),
//       badgeCount > 0 &&
//         createElement("span", {
//           class: [
//             "absolute",
//             "top-0",
//             "right-0",
//             "bg-[#34b7a7]",
//             "text-xs",
//             "rounded-full",
//             "w-5",
//             "h-5",
//             "flex",
//             "items-center",
//             "justify-center",
//             "text-black",
//             "font-bold",
//           ],
//           textContent: badgeCount,
//         }),
//     ].filter(Boolean)
//   );

// export default createSidebar;

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
      createButton("fa-plus", () => {
        const modal = document.getElementById("registerModal");
        if (modal) modal.classList.remove("hidden");
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
