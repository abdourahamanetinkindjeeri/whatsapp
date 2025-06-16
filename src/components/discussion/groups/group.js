import {
  addSelectedGroup,
  removeSelectedGroup,
  getSelectedGroups,
  resetSelectedGroups,
} from "./selectedGroupsManager.js";
import { createElement } from "../../../utils/element.js";
import { readData, patchData } from "../../../utils/data.js";
import { authManager } from "../../auth/authManager.js";

// Fonction pour vérifier si l'utilisateur est admin du groupe
const isUserAdmin = (group, userId) => {
  if (!group || !group.membres) return false;
  const member = group.membres.find((m) => String(m.userId) === String(userId));
  return member && member.role === "admin";
};

// Fonction pour ajouter un membre au groupe
const addMemberToGroup = async (groupId, memberId) => {
  try {
    const groups = await readData("groups");
    const group = groups.find((g) => String(g.id) === String(groupId));

    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    if (!group.membres) {
      group.membres = [];
    }

    // Vérifier si le membre existe déjà
    const memberExists = group.membres.some(
      (m) => String(m.userId) === String(memberId)
    );
    if (!memberExists) {
      const newMember = {
        userId: String(memberId),
        role: "membre",
        dateAjout: new Date().toISOString(),
      };
      group.membres.push(newMember);
      await patchData("groups", groupId, { membres: group.membres });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre:", error);
    return false;
  }
};

// Fonction pour ajouter un admin au groupe
const addAdminToGroup = async (groupId, adminId) => {
  try {
    const groups = await readData("groups");
    const group = groups.find((g) => String(g.id) === String(groupId));

    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    if (!group.membres) {
      group.membres = [];
    }

    // Trouver le membre et mettre à jour son rôle
    const memberIndex = group.membres.findIndex(
      (m) => String(m.userId) === String(adminId)
    );
    if (memberIndex !== -1) {
      group.membres[memberIndex].role = "admin";
      await patchData("groups", groupId, { membres: group.membres });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'admin:", error);
    return false;
  }
};

// Fonction pour afficher les membres du groupe
const displayGroupMembers = async (groupId) => {
  try {
    const groups = await readData("groups");
    const users = await readData("users");
    const group = groups.find((g) => String(g.id) === String(groupId));
    const currentUser = authManager.getCurrentUserContact();
    const currentUserId = currentUser?.id;

    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    const membersList = createElement("div", {
      class: ["mt-4", "space-y-2"],
    });

    // Ajouter le bouton d'ajout de membre si l'utilisateur est admin
    if (isUserAdmin(group, currentUserId)) {
      const addMemberButton = createElement(
        "button",
        {
          class: [
            "w-full",
            "px-4",
            "py-2",
            "bg-blue-600",
            "text-white",
            "rounded",
            "hover:bg-blue-700",
            "transition",
            "mb-4",
            "flex",
            "items-center",
            "justify-center",
            "gap-2",
          ],
          onclick: () => showAddMemberModal(groupId),
        },
        [
          createElement("i", { class: ["fas", "fa-user-plus"] }),
          "Ajouter des membres",
        ]
      );

      membersList.appendChild(addMemberButton);
    }

    // Afficher la liste des membres
    if (group.membres && group.membres.length > 0) {
      group.membres.forEach((member) => {
        const user = users.find((u) => String(u.id) === String(member.userId));
        if (user) {
          const isAdmin = member.role === "admin";
          const memberElement = createElement(
            "div",
            {
              class: [
                "flex",
                "items-center",
                "justify-between",
                "p-3",
                "bg-gray-50",
                "rounded-lg",
                "hover:bg-gray-100",
                "transition",
              ],
            },
            [
              createElement(
                "div",
                {
                  class: ["flex", "items-center", "gap-3"],
                },
                [
                  createElement(
                    "div",
                    {
                      class: [
                        "w-10",
                        "h-10",
                        "rounded-full",
                        "bg-gray-200",
                        "flex",
                        "items-center",
                        "justify-center",
                        "overflow-hidden",
                      ],
                    },
                    user.profile?.avatar
                      ? createElement("img", {
                          src: user.profile.avatar,
                          alt: user.nom || user.name,
                          class: ["w-full", "h-full", "object-cover"],
                        })
                      : createElement("i", {
                          class: ["fas", "fa-user", "text-gray-600"],
                        })
                  ),
                  createElement("div", {}, [
                    createElement(
                      "div",
                      {
                        class: ["font-medium"],
                      },
                      `${user.prenom || ""} ${user.nom || ""}`
                    ),
                    createElement(
                      "div",
                      {
                        class: [
                          "text-sm",
                          "text-gray-500",
                          "flex",
                          "items-center",
                          "gap-2",
                        ],
                      },
                      [
                        createElement(
                          "span",
                          {},
                          isAdmin ? "Administrateur" : "Membre"
                        ),
                        createElement(
                          "span",
                          { class: ["text-xs"] },
                          `Ajouté le ${new Date(
                            member.dateAjout
                          ).toLocaleDateString()}`
                        ),
                      ]
                    ),
                  ]),
                ]
              ),
              // Boutons d'action pour les admins
              ...(isUserAdmin(group, currentUserId)
                ? [
                    createElement(
                      "div",
                      {
                        class: ["flex", "gap-2"],
                      },
                      [
                        !isAdmin &&
                          createElement(
                            "button",
                            {
                              class: [
                                "px-3",
                                "py-1",
                                "bg-blue-500",
                                "text-white",
                                "rounded",
                                "text-sm",
                                "flex",
                                "items-center",
                                "gap-1",
                                "hover:bg-blue-600",
                                "transition",
                              ],
                              onclick: () =>
                                addAdminToGroup(groupId, member.userId),
                            },
                            [
                              createElement("i", {
                                class: ["fas", "fa-user-shield"],
                              }),
                              "Promouvoir",
                            ]
                          ),
                        createElement(
                          "button",
                          {
                            class: [
                              "px-3",
                              "py-1",
                              "bg-red-500",
                              "text-white",
                              "rounded",
                              "text-sm",
                              "flex",
                              "items-center",
                              "gap-1",
                              "hover:bg-red-600",
                              "transition",
                            ],
                            onclick: () =>
                              removeMemberFromGroup(groupId, member.userId),
                          },
                          [
                            createElement("i", {
                              class: ["fas", "fa-user-minus"],
                            }),
                            "Retirer",
                          ]
                        ),
                      ]
                    ),
                  ]
                : []),
            ]
          );

          membersList.appendChild(memberElement);
        }
      });
    } else {
      membersList.appendChild(
        createElement(
          "div",
          {
            class: ["text-center", "text-gray-500", "py-4"],
          },
          "Aucun membre dans ce groupe"
        )
      );
    }

    return membersList;
  } catch (error) {
    console.error("Erreur lors de l'affichage des membres:", error);
    return createElement(
      "div",
      {
        class: ["text-red-500", "p-4"],
      },
      "Erreur lors du chargement des membres"
    );
  }
};

// Fonction pour afficher la modal d'ajout de membre
const showAddMemberModal = async (groupId) => {
  const modal = createElement("div", {
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
  });

  const users = await readData("users");
  const group = (await readData("groups")).find(
    (g) => String(g.id) === String(groupId)
  );

  const modalContent = createElement(
    "div",
    {
      class: [
        "bg-white",
        "rounded-lg",
        "p-6",
        "w-96",
        "max-h-[80vh]",
        "overflow-y-auto",
      ],
    },
    [
      createElement(
        "div",
        {
          class: ["flex", "justify-between", "items-center", "mb-4"],
        },
        [
          createElement(
            "h2",
            {
              class: ["text-xl", "font-bold"],
            },
            "Ajouter des membres"
          ),
          createElement(
            "button",
            {
              class: ["text-gray-500", "hover:text-gray-700"],
              onclick: () => modal.remove(),
            },
            createElement("i", { class: ["fas", "fa-times"] })
          ),
        ]
      ),
      createElement(
        "div",
        {
          class: ["space-y-3"],
        },
        users
          .filter(
            (user) =>
              !group.membres.some((m) => String(m.userId) === String(user.id))
          )
          .map((user) =>
            createElement(
              "div",
              {
                class: [
                  "flex",
                  "items-center",
                  "justify-between",
                  "p-3",
                  "hover:bg-gray-50",
                  "rounded-lg",
                  "transition",
                ],
              },
              [
                createElement(
                  "div",
                  {
                    class: ["flex", "items-center", "gap-3"],
                  },
                  [
                    createElement(
                      "div",
                      {
                        class: [
                          "w-10",
                          "h-10",
                          "rounded-full",
                          "bg-gray-200",
                          "flex",
                          "items-center",
                          "justify-center",
                          "overflow-hidden",
                        ],
                      },
                      user.profile?.avatar
                        ? createElement("img", {
                            src: user.profile.avatar,
                            alt: user.nom || user.name,
                            class: ["w-full", "h-full", "object-cover"],
                          })
                        : createElement("i", {
                            class: ["fas", "fa-user", "text-gray-600"],
                          })
                    ),
                    createElement("div", {}, [
                      createElement(
                        "div",
                        { class: ["font-medium"] },
                        `${user.prenom || ""} ${user.nom || ""}`
                      ),
                      createElement(
                        "div",
                        { class: ["text-sm", "text-gray-500"] },
                        user.profile?.status || "Pas de statut"
                      ),
                    ]),
                  ]
                ),
                createElement(
                  "button",
                  {
                    class: [
                      "px-3",
                      "py-1",
                      "bg-blue-500",
                      "text-white",
                      "rounded",
                      "text-sm",
                      "flex",
                      "items-center",
                      "gap-1",
                      "hover:bg-blue-600",
                      "transition",
                    ],
                    onclick: async () => {
                      await addMemberToGroup(groupId, user.id);
                      modal.remove();
                      updateGroupsList();
                    },
                  },
                  [createElement("i", { class: ["fas", "fa-plus"] }), "Ajouter"]
                ),
              ]
            )
          )
      ),
    ]
  );

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Fermer la modal en cliquant en dehors
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};

// Fonction pour retirer un membre du groupe
const removeMemberFromGroup = async (groupId, memberId) => {
  try {
    const groups = await readData("groups");
    const group = groups.find((g) => String(g.id) === String(groupId));

    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    if (!group.membres) {
      group.membres = [];
    }

    // Filtrer le membre à retirer
    group.membres = group.membres.filter(
      (m) => String(m.userId) !== String(memberId)
    );

    await patchData("groups", groupId, { membres: group.membres });
    updateGroupsList();
    return true;
  } catch (error) {
    console.error("Erreur lors du retrait du membre:", error);
    return false;
  }
};

export const updateGroupsList = async () => {
  const discussionList = document.getElementById("discussionList");
  if (!discussionList) {
    console.error("discussionList non initialisé.");
    return;
  }

  discussionList.innerHTML = "";

  const addGroupButton = createElement(
    "button",
    {
      class: [
        "w-10",
        "h-10",
        "flex",
        "items-center",
        "justify-center",
        "bg-green-600",
        "text-white",
        "rounded-full",
        "shadow",
        "hover:bg-green-700",
        "transition",
        "duration-300",
        "mx-auto",
      ],
      onclick: () => {
        const modal = document.getElementById("registerModalGroup");
        if (modal) {
          console.log("Modal trouvé, suppression de la classe hidden");
          modal.classList.remove("hidden");
        } else {
          console.error("Modal non trouvé");
        }
      },
    },
    createElement("i", {
      class: ["fas", "fa-users"],
    })
  );

  discussionList.append(addGroupButton);

  const groups = (await readData("groups")).filter(
    (item) => item.delete === false && item.archive === false
  );

  if (groups.length === 0) {
    discussionList.append(
      createElement(
        "div",
        {
          class: ["p-3", "text-gray-600", "text-center"],
        },
        "Aucun groupe actif à afficher"
      )
    );
    return;
  }

  discussionList.append(
    ...groups.map((group) =>
      createElement(
        "div",
        {
          class: [
            "flex",
            "items-center",
            "p-2",
            "border-b",
            "border-gray-200",
            "hover:bg-gray-100",
            "cursor-pointer",
          ],
          onclick: async () => {
            // Importer selectContact dynamiquement
            const { selectContact } = await import("../../messages/Message.js");
            console.log("Selecting group:", group.id, group.nomGroup);
            await selectContact(group.id, group.nomGroup, "group");
          },
        },
        [
          createElement(
            "div",
            {
              class: ["flex", "items-center", "gap-3", "flex-1"],
            },
            [
              createElement(
                "div",
                {
                  class: [
                    "w-10",
                    "h-10",
                    "bg-blue-500",
                    "rounded-full",
                    "flex",
                    "items-center",
                    "justify-center",
                    "text-white",
                  ],
                },
                createElement("i", {
                  class: ["fas", "fa-users"],
                })
              ),
              createElement(
                "div",
                {
                  class: ["flex-1"],
                },
                [
                  createElement(
                    "div",
                    {
                      class: ["font-medium"],
                    },
                    group.nomGroup || "Groupe sans nom"
                  ),
                  createElement(
                    "div",
                    {
                      class: ["text-sm", "text-gray-500"],
                    },
                    `${group.membres?.length || 0} membres`
                  ),
                ]
              ),
            ]
          ),
        ]
      )
    )
  );
};

export {
  addMemberToGroup,
  addAdminToGroup,
  removeMemberFromGroup,
  isUserAdmin,
};
