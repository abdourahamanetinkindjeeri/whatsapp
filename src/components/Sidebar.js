import { createElement } from "../utils/element.js";
import { updateContactListArchive } from "./discussion/contacts/contact.js";
import { authManager } from "./auth/authManager.js";

const createSidebar = (updateContactList, updateGroupsList) => {
  // Récupérer l'utilisateur connecté
  const currentUser = authManager.getCurrentUserContact();
  const avatarUrl = currentUser?.profile?.avatar;
  const userInitial =
    currentUser?.name?.[0] ||
    currentUser?.nom?.[0] ||
    currentUser?.prenom?.[0] ||
    "U";
  const userName =
    currentUser?.name ||
    currentUser?.nom ||
    currentUser?.prenom ||
    "Utilisateur";
  const userStatus = currentUser?.profile?.status || "En ligne";
  const userBio = currentUser?.profile?.bio || "";

  console.log("Current User:", currentUser); // Pour déboguer

  // Bloc profil utilisateur connecté
  const userProfile = createElement(
    "div",
    {
      class: [
        "flex",
        "flex-col",
        "items-center",
        "py-4",
        "border-b",
        "border-gray-200",
        "bg-white",
        "hover:bg-gray-50",
        "cursor-pointer",
        "transition-colors",
      ],
    },
    [
      avatarUrl
        ? createElement("img", {
            src: avatarUrl,
            alt: userName,
            class: [
              "w-12",
              "h-12",
              "rounded-full",
              "object-cover",
              "mb-2",
              "border-2",
              "border-[#00a884]",
            ],
          })
        : createElement(
            "div",
            {
              class: [
                "w-12",
                "h-12",
                "rounded-full",
                "bg-[#00a884]",
                "flex",
                "items-center",
                "justify-center",
                "text-white",
                "text-xl",
                "font-bold",
                "mb-2",
                "border-2",
                "border-white",
              ],
            },
            userInitial
          ),
      createElement(
        "span",
        { class: ["text-gray-800", "font-medium", "text-sm", "mb-1"] },
        userName
      ),
      createElement(
        "span",
        { class: ["text-gray-500", "text-xs", "mb-1"] },
        userStatus
      ),
      userBio &&
        createElement(
          "span",
          {
            class: [
              "text-gray-500",
              "text-xs",
              "italic",
              "text-center",
              "px-2",
            ],
          },
          userBio
        ),
      createElement(
        "div",
        { class: ["flex", "items-center", "gap-1", "mt-1"] },
        [
          createElement("i", {
            class: ["fa-solid", "fa-circle", "text-[#00a884]", "text-xs"],
          }),
          createElement(
            "span",
            { class: ["text-gray-500", "text-xs"] },
            "En ligne"
          ),
        ]
      ),
    ]
  );

  const ulTop = createElement(
    "ul",
    {
      class: ["flex", "flex-col", "items-center", "gap-y-2", "py-4"],
    },
    [
      createButton("fa-comment-dots", () => {}, 36, true),
      createButton("fa-users", () => updateGroupsList()),
      createButton("fa-bullhorn", () => updateContactList()),
      createButton("fa-archive", () => updateContactListArchive(), 1),
      createButton("fa-plus", () => {
        const modal = document.getElementById("registerModal");
        if (modal) {
          modal.classList.remove("hidden");
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
      createButton("fa-circle-user", () => console.log("Profil")),
      createButton("fa-eye", () => console.log("Statut")),
      createButton("fa-gear", () => console.log("Paramètres")),
      createButton("fa-right-from-bracket", () => {
        const modal = createLogoutModal();
        document.body.appendChild(modal);
        modal.classList.remove("hidden");
      }),
    ]
  );

  return createElement(
    "div",
    {
      class: [
        "w-16",
        "h-screen",
        "bg-white",
        "border-r",
        "border-gray-200",
        "flex",
        "flex-col",
        "justify-between",
      ],
    },
    [userProfile, ulTop, ulBottom]
  );
};

const createLogoutModal = () => {
  const modal = createElement(
    "div",
    {
      class: [
        "fixed",
        "inset-0",
        "bg-black",
        "bg-opacity-50",
        "flex",
        "items-center",
        "justify-center",
        "z-50",
      ],
    },
    [
      createElement(
        "div",
        {
          class: ["bg-white", "rounded-lg", "p-6", "w-96", "shadow-xl"],
        },
        [
          createElement(
            "h3",
            {
              class: ["text-lg", "font-medium", "text-gray-900", "mb-4"],
            },
            "Confirmer la déconnexion"
          ),
          createElement(
            "p",
            {
              class: ["text-gray-600", "mb-6"],
            },
            "Êtes-vous sûr de vouloir vous déconnecter ?"
          ),
          createElement(
            "div",
            {
              class: ["flex", "justify-end", "gap-3"],
            },
            [
              createElement(
                "button",
                {
                  class: [
                    "px-4",
                    "py-2",
                    "text-gray-600",
                    "hover:bg-gray-100",
                    "rounded-lg",
                    "transition",
                  ],
                  onclick: () => {
                    modal.remove();
                  },
                },
                "Annuler"
              ),
              createElement(
                "button",
                {
                  class: [
                    "px-4",
                    "py-2",
                    "bg-red-500",
                    "text-white",
                    "hover:bg-red-600",
                    "rounded-lg",
                    "transition",
                  ],
                  onclick: () => {
                    authManager.logout();
                    modal.remove();
                  },
                },
                "Déconnecter"
              ),
            ]
          ),
        ]
      ),
    ]
  );

  return modal;
};

const createButton = (iconClass, onClick, badgeCount = 0, isActive = false) =>
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
            "text-gray-600",
            "hover:bg-gray-100",
            "rounded-lg",
            "transition",
            isActive ? "bg-gray-100" : "",
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
            "bg-[#00a884]",
            "text-xs",
            "rounded-full",
            "w-5",
            "h-5",
            "flex",
            "items-center",
            "justify-center",
            "text-white",
            "font-bold",
          ],
          textContent: badgeCount,
        }),
    ].filter(Boolean)
  );

export default createSidebar;
