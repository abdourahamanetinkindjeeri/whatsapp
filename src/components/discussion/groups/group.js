import {
  addSelectedGroup,
  removeSelectedGroup,
  getSelectedGroups,
  resetSelectedGroups,
} from "./selectedGroupsManager.js";
import { createElement } from "../../../utils/element.js";
import { readData, patchData, addData } from "../../../utils/data.js";
import { authManager } from "../../auth/authManager.js";
import { showNotification } from "../../../utils/notifications.js";

// Fonction pour créer une modale de confirmation
const createConfirmationModal = (title, message, onConfirm) => {
  const modal = document.createElement("div");
  modal.className =
    "flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50";
  modal.innerHTML = `
    <div class="p-6 mx-4 w-full max-w-md bg-white rounded-lg transition-all transform">
      <h3 class="mb-2 text-lg font-semibold text-gray-900">${title}</h3>
      <p class="mb-6 text-gray-600">${message}</p>
      <div class="flex justify-end space-x-3">
        <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md transition-colors hover:bg-gray-200" id="cancelBtn">
          Annuler
        </button>
        <button class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md transition-colors hover:bg-red-700" id="confirmBtn">
          Confirmer
        </button>
      </div>
    </div>
  `;

  const confirmBtn = modal.querySelector("#confirmBtn");
  const cancelBtn = modal.querySelector("#cancelBtn");

  const closeModal = () => {
    modal.remove();
  };

  confirmBtn.addEventListener("click", () => {
    onConfirm();
    closeModal();
  });

  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.body.appendChild(modal);
};

// Fonction pour vérifier si l'utilisateur est admin du groupe
const isUserAdmin = (group, userId) => {
  if (!group || !group.membres || !userId) return false;
  const member = group.membres.find((m) => String(m.userId) === String(userId));
  return member && member.role === "admin";
};

// Fonction pour gérer les modifications de groupe
const handleGroupModification = async (groupId, action, details) => {
  try {
    const groups = await readData("groups");
    const group = groups.find((g) => String(g.id) === String(groupId));
    const currentUser = authManager.getCurrentUserContact();

    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    // Créer l'entrée de modification
    const modification = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      groupId: String(groupId),
      action: action,
      details: {
        ...details,
        performedBy: {
          id: currentUser?.id,
          name: `${currentUser?.prenom || ""} ${currentUser?.nom || ""}`.trim(),
        },
      },
      timestamp: new Date().toISOString(),
    };

    // Sauvegarder la modification dans le groupe lui-même
    if (!group.modifications) {
      group.modifications = [];
    }
    group.modifications.push(modification);
    await patchData("groups", groupId, { modifications: group.modifications });

    // Notifier les membres du groupe
    if (group.membres && group.membres.length > 0) {
      const notification = {
        type: "group_modification",
        groupId: String(groupId),
        groupName: group.nom,
        action: action,
        details: details,
        timestamp: new Date().toISOString(),
      };

      // Envoyer la notification à tous les membres
      group.membres.forEach(async (member) => {
        if (String(member.userId) !== String(currentUser?.id)) {
          // Sauvegarder la notification dans le groupe
          if (!group.notifications) {
            group.notifications = [];
          }
          group.notifications.push({
            ...notification,
            userId: String(member.userId),
            read: false,
          });
        }
      });

      // Mettre à jour le groupe avec les notifications
      await patchData("groups", groupId, {
        notifications: group.notifications,
      });
    }

    return modification;
  } catch (error) {
    console.error("Erreur lors de la gestion de la modification:", error);
    throw error;
  }
};

// Fonction pour ajouter un membre au groupe
const addMemberToGroup = async (groupId, memberId) => {
  try {
    if (!groupId || !memberId) {
      throw new Error("ID de groupe ou ID de membre manquant");
    }

    const groups = await readData("groups");
    const users = await readData("users");
    const group = groups.find((g) => String(g.id) === String(groupId));
    const newMember = users.find((u) => String(u.id) === String(memberId));

    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    if (!newMember) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier si l'utilisateur actuel est admin
    const currentUser = authManager.getCurrentUserContact();
    if (!isUserAdmin(group, currentUser?.id)) {
      throw new Error("Vous n'avez pas les droits pour ajouter des membres");
    }

    if (!group.membres) {
      group.membres = [];
    }

    // Vérifier si le membre existe déjà
    const memberExists = group.membres.some(
      (m) => String(m.userId) === String(memberId)
    );
    if (!memberExists) {
      const newMemberData = {
        userId: String(memberId),
        role: "membre",
        dateAjout: new Date().toISOString(),
      };
      group.membres.push(newMemberData);
      await patchData("groups", groupId, { membres: group.membres });

      // Enregistrer la modification
      await handleGroupModification(groupId, "add_member", {
        memberId: String(memberId),
        memberName: `${newMember.prenom || ""} ${newMember.nom || ""}`.trim(),
        role: "membre",
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre:", error);
    throw error;
  }
};

// Fonction pour ajouter un admin au groupe
const addAdminToGroup = async (groupId, adminId) => {
  try {
    if (!groupId || !adminId) {
      throw new Error("ID de groupe ou ID d'admin manquant");
    }

    const groups = await readData("groups");
    const users = await readData("users");
    const group = groups.find((g) => String(g.id) === String(groupId));
    const newAdmin = users.find((u) => String(u.id) === String(adminId));

    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    if (!newAdmin) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier si l'utilisateur actuel est admin
    const currentUser = authManager.getCurrentUserContact();
    if (!isUserAdmin(group, currentUser?.id)) {
      throw new Error("Vous n'avez pas les droits pour promouvoir des membres");
    }

    if (!group.membres) {
      group.membres = [];
    }

    // Trouver le membre et mettre à jour son rôle
    const memberIndex = group.membres.findIndex(
      (m) => String(m.userId) === String(adminId)
    );
    if (memberIndex !== -1) {
      // Vérifier si le membre n'est pas déjà admin
      if (group.membres[memberIndex].role === "admin") {
        throw new Error("Ce membre est déjà administrateur");
      }
      group.membres[memberIndex].role = "admin";
      await patchData("groups", groupId, { membres: group.membres });

      // Enregistrer la modification
      await handleGroupModification(groupId, "promote_admin", {
        memberId: String(adminId),
        memberName: `${newAdmin.prenom || ""} ${newAdmin.nom || ""}`.trim(),
      });

      return true;
    }
    throw new Error("Membre non trouvé dans le groupe");
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'admin:", error);
    throw error;
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
    if (!groupId || !memberId) {
      throw new Error("ID de groupe ou de membre manquant");
    }

    const groups = await readData("groups");
    const group = groups.find((g) => String(g.id) === String(groupId));
    const currentUser = authManager.getCurrentUserContact();

    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    if (!isUserAdmin(group, currentUser?.id)) {
      throw new Error("Vous n'avez pas les droits d'administrateur");
    }

    const memberToRemoveData = group.membres.find(
      (m) => String(m.userId) === String(memberId)
    );

    if (!memberToRemoveData) {
      throw new Error("Membre non trouvé dans le groupe");
    }

    // Vérifier si c'est le dernier admin
    const adminCount = group.membres.filter((m) => m.role === "admin").length;
    const isLastAdmin = adminCount === 1 && memberToRemoveData.role === "admin";

    if (isLastAdmin) {
      createConfirmationModal(
        "Impossible de retirer le dernier admin",
        "Vous ne pouvez pas retirer le dernier administrateur du groupe. Promouvez d'abord un autre membre en tant qu'administrateur.",
        () => {}
      );
      return;
    }

    // Retirer le membre
    group.membres = group.membres.filter(
      (m) => String(m.userId) !== String(memberId)
    );

    // Mettre à jour le groupe
    await patchData("groups", groupId, { membres: group.membres });

    // Enregistrer la modification
    await handleGroupModification(groupId, "remove_member", {
      memberId: String(memberId),
      memberName: memberToRemoveData.nom,
    });

    // Mettre à jour la liste des groupes
    await updateGroupsList();
  } catch (error) {
    console.error("Erreur lors du retrait du membre:", error);
    throw error;
  }
};

// Fonction pour récupérer l'historique des modifications d'un groupe
const getGroupModificationHistory = async (groupId) => {
  try {
    const groups = await readData("groups");
    const group = groups.find((g) => String(g.id) === String(groupId));

    if (!group || !group.modifications) {
      return [];
    }

    return group.modifications.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    throw error;
  }
};

// Fonction pour afficher la modal d'édition de groupe
const showEditGroupModal = async (groupId) => {
  try {
    const groups = await readData("groups");
    const group = groups.find((g) => String(g.id) === String(groupId));
    const currentUser = authManager.getCurrentUserContact();

    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    // Vérifier si l'utilisateur est admin
    if (!isUserAdmin(group, currentUser?.id)) {
      throw new Error("Vous n'avez pas les droits pour modifier ce groupe");
    }

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
              "Modifier le groupe"
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
        createElement("form", { id: "editGroupForm" }, [
          createElement(
            "div",
            {
              class: ["mb-4"],
            },
            [
              createElement(
                "label",
                {
                  class: [
                    "block",
                    "text-sm",
                    "font-medium",
                    "text-gray-700",
                    "mb-1",
                  ],
                },
                "Nom du groupe"
              ),
              createElement("input", {
                type: "text",
                id: "groupName",
                value: group.nom || "",
                class: [
                  "w-full",
                  "px-3",
                  "py-2",
                  "border",
                  "border-gray-300",
                  "rounded-md",
                  "focus:outline-none",
                  "focus:ring-2",
                  "focus:ring-blue-500",
                ],
              }),
            ]
          ),
          createElement(
            "div",
            {
              class: ["mb-4"],
            },
            [
              createElement(
                "label",
                {
                  class: [
                    "block",
                    "text-sm",
                    "font-medium",
                    "text-gray-700",
                    "mb-1",
                  ],
                },
                "Description"
              ),
              createElement("textarea", {
                id: "groupDescription",
                value: group.description || "",
                class: [
                  "w-full",
                  "px-3",
                  "py-2",
                  "border",
                  "border-gray-300",
                  "rounded-md",
                  "focus:outline-none",
                  "focus:ring-2",
                  "focus:ring-blue-500",
                  "h-24",
                ],
              }),
            ]
          ),
          createElement(
            "div",
            {
              class: ["flex", "justify-end", "gap-2", "mt-4"],
            },
            [
              createElement(
                "button",
                {
                  type: "button",
                  class: [
                    "px-4",
                    "py-2",
                    "bg-gray-200",
                    "text-gray-800",
                    "rounded",
                    "hover:bg-gray-300",
                    "transition",
                  ],
                  onclick: () => modal.remove(),
                },
                "Annuler"
              ),
              createElement(
                "button",
                {
                  type: "submit",
                  class: [
                    "px-4",
                    "py-2",
                    "bg-blue-500",
                    "text-white",
                    "rounded",
                    "hover:bg-blue-600",
                    "transition",
                  ],
                },
                "Enregistrer"
              ),
            ]
          ),
        ]),
      ]
    );

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Gérer la soumission du formulaire
    const form = document.getElementById("editGroupForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newName = document.getElementById("groupName").value.trim();
      const newDescription = document
        .getElementById("groupDescription")
        .value.trim();

      if (!newName) {
        showNotification("Le nom du groupe est requis", "warning");
        return;
      }

      try {
        await patchData("groups", groupId, {
          nom: newName,
          description: newDescription,
        });

        // Enregistrer la modification
        await handleGroupModification(groupId, "edit_group", {
          oldName: group.nom,
          newName: newName,
          oldDescription: group.description,
          newDescription: newDescription,
        });

        modal.remove();
        await updateGroupsList();
        showNotification("Groupe modifié avec succès", "success");
      } catch (error) {
        console.error("Erreur lors de la modification du groupe:", error);
        showNotification("Erreur lors de la modification du groupe", "error");
      }
    });

    // Fermer la modal en cliquant en dehors
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'affichage de la modal d'édition:", error);
    showNotification(error.message, "error");
  }
};

// Fonction pour afficher les détails du groupe
const showGroupDetails = async (groupId) => {
  try {
    const groups = await readData("groups");
    const users = await readData("users");
    const group = groups.find((g) => String(g.id) === String(groupId));
    const currentUser = authManager.getCurrentUserContact();

    if (!group) {
      throw new Error("Groupe non trouvé");
    }

    const modal = document.createElement("div");
    modal.className =
      "flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50";
    modal.innerHTML = `
      <div class="p-6 mx-4 w-full max-w-2xl bg-white rounded-lg transition-all transform">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">${group.nom}</h2>
          <button class="text-gray-400 hover:text-gray-500" id="closeBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <p class="mb-6 text-gray-600">${
          group.description || "Aucune description"
        }</p>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Membres du groupe</h3>
            ${
              isUserAdmin(group, currentUser?.id)
                ? `
              <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700" id="addMemberBtn">
                Ajouter des membres
              </button>
            `
                : ""
            }
          </div>
          <div class="overflow-y-auto space-y-2 max-h-96" id="membersList">
            <!-- Les membres seront ajoutés ici dynamiquement -->
          </div>
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector("#closeBtn");
    const addMemberBtn = modal.querySelector("#addMemberBtn");
    const membersList = modal.querySelector("#membersList");

    closeBtn.addEventListener("click", () => {
      modal.remove();
    });

    if (addMemberBtn) {
      addMemberBtn.addEventListener("click", () => {
        showAddMemberModal(groupId);
      });
    }

    // Afficher les membres
    for (const member of group.membres) {
      const user = await readData("users", member.userId);
      if (!user) continue;

      const memberElement = document.createElement("div");
      memberElement.className =
        "flex justify-between items-center p-3 bg-gray-50 rounded-lg transition hover:bg-gray-100";
      memberElement.innerHTML = `
        <div class="flex gap-3 items-center">
          <div class="flex overflow-hidden justify-center items-center w-10 h-10 bg-gray-200 rounded-full">
            ${
              user.profile?.avatar
                ? `<img src="${user.profile.avatar}" alt="${
                    user.nom || user.name
                  }" class="object-cover w-full h-full">`
                : `<i class="text-gray-600 fas fa-user"></i>`
            }
          </div>
          <div>
            <div class="font-medium">${user.prenom || ""} ${
        user.nom || ""
      }</div>
            <div class="flex gap-2 items-center text-sm text-gray-500">
              <span class="px-2 py-0.5 rounded-full text-xs ${
                member.role === "admin"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }">
                ${member.role === "admin" ? "Administrateur" : "Membre"}
              </span>
              <span class="text-xs">Ajouté le ${new Date(
                member.dateAjout
              ).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        ${
          isUserAdmin(group, currentUser?.id)
            ? `
          <div class="flex gap-2">
            ${
              member.role !== "admin"
                ? `
              <button class="text-sm font-medium text-blue-600 hover:text-blue-800 promote-btn" data-user-id="${member.userId}">
                Promouvoir Admin
              </button>
            `
                : ""
            }
            <button class="text-sm font-medium text-red-600 hover:text-red-800 remove-btn" data-user-id="${
              member.userId
            }">
              Retirer
            </button>
          </div>
        `
            : ""
        }
      `;

      // Ajouter les gestionnaires d'événements pour les boutons
      const promoteBtn = memberElement.querySelector(".promote-btn");
      const removeBtn = memberElement.querySelector(".remove-btn");

      if (promoteBtn) {
        promoteBtn.addEventListener("click", async () => {
          createConfirmationModal(
            "Promouvoir en Admin",
            `Êtes-vous sûr de vouloir promouvoir ${user.prenom} ${user.nom} au rang d'administrateur ?`,
            async () => {
              try {
                await addAdminToGroup(groupId, member.userId);
                await showGroupDetails(groupId);
              } catch (error) {
                console.error("Erreur lors de la promotion:", error);
              }
            }
          );
        });
      }

      if (removeBtn) {
        removeBtn.addEventListener("click", async () => {
          createConfirmationModal(
            "Retirer le membre",
            `Êtes-vous sûr de vouloir retirer ${user.prenom} ${user.nom} du groupe ?`,
            async () => {
              try {
                await removeMemberFromGroup(groupId, member.userId);
                await showGroupDetails(groupId);
              } catch (error) {
                console.error("Erreur lors du retrait:", error);
              }
            }
          );
        });
      }

      membersList.appendChild(memberElement);
    }

    document.body.appendChild(modal);
  } catch (error) {
    console.error("Erreur lors de l'affichage des détails:", error);
  }
};

// Mise à jour de la fonction updateGroupsList
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
    ...groups.map((group) => {
      const currentUser = authManager.getCurrentUserContact();
      const isAdmin = isUserAdmin(group, currentUser?.id);

      return createElement(
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
            "group",
          ],
        },
        [
          createElement(
            "div",
            {
              class: ["flex", "items-center", "gap-3", "flex-1"],
              onclick: async () => {
                const { selectContact } = await import(
                  "../../messages/Message.js"
                );
                console.log("Selecting group:", group.id, group.nom);
                await selectContact(group.id, group.nom, "group");
              },
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
                    group.nom || "Groupe sans nom"
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
          // Boutons d'action
          createElement(
            "div",
            {
              class: [
                "flex",
                "gap-2",
                "opacity-0",
                "group-hover:opacity-100",
                "transition-opacity",
              ],
            },
            [
              createElement(
                "button",
                {
                  class: [
                    "p-2",
                    "text-gray-500",
                    "hover:text-blue-500",
                    "transition-colors",
                  ],
                  onclick: (e) => {
                    e.stopPropagation();
                    showGroupDetails(group.id);
                  },
                },
                createElement("i", {
                  class: ["fas", "fa-info-circle"],
                })
              ),
              isAdmin &&
                createElement(
                  "button",
                  {
                    class: [
                      "p-2",
                      "text-gray-500",
                      "hover:text-blue-500",
                      "transition-colors",
                    ],
                    onclick: (e) => {
                      e.stopPropagation();
                      createConfirmationModal(
                        group.archive
                          ? "Désarchiver le groupe"
                          : "Archiver le groupe",
                        `Êtes-vous sûr de vouloir ${
                          group.archive ? "désarchiver" : "archiver"
                        } ce groupe ?`,
                        async () => {
                          try {
                            await archiveGroups([group.id]);
                            await updateGroupsList();
                          } catch (error) {
                            console.error(
                              "Erreur lors de l'archivage/désarchivage du groupe:",
                              error
                            );
                          }
                        }
                      );
                    },
                  },
                  createElement("i", {
                    class: [
                      "fas",
                      group.archive ? "fa-box-open" : "fa-box-archive",
                    ],
                  })
                ),
            ]
          ),
        ]
      );
    })
  );
};

// Fonction pour afficher les groupes archivés
export const updateGroupsListArchive = async () => {
  const discussionList = document.getElementById("discussionList");
  if (!discussionList) {
    console.error("discussionList non initialisé.");
    return;
  }

  discussionList.innerHTML = "";

  const groups = (await readData("groups")).filter(
    (item) => item.delete === false && item.archive === true
  );

  if (groups.length === 0) {
    discussionList.append(
      createElement(
        "div",
        {
          class: ["p-3", "text-gray-600", "text-center"],
        },
        "Aucun groupe archivé à afficher"
      )
    );
    return;
  }

  discussionList.append(
    ...groups.map((group) => {
      const currentUser = authManager.getCurrentUserContact();
      const isAdmin = isUserAdmin(group, currentUser?.id);

      return createElement(
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
            "group",
          ],
        },
        [
          createElement(
            "div",
            {
              class: ["flex", "items-center", "gap-3", "flex-1"],
              onclick: async () => {
                const { selectContact } = await import(
                  "../../messages/Message.js"
                );
                console.log("Selecting group:", group.id, group.nom);
                await selectContact(group.id, group.nom, "group");
              },
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
                    group.nom || "Groupe sans nom"
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
          // Boutons d'action
          createElement(
            "div",
            {
              class: [
                "flex",
                "gap-2",
                "opacity-0",
                "group-hover:opacity-100",
                "transition-opacity",
              ],
            },
            [
              createElement(
                "button",
                {
                  class: [
                    "p-2",
                    "text-gray-500",
                    "hover:text-blue-500",
                    "transition-colors",
                  ],
                  onclick: (e) => {
                    e.stopPropagation();
                    showGroupDetails(group.id);
                  },
                },
                createElement("i", {
                  class: ["fas", "fa-info-circle"],
                })
              ),
              isAdmin &&
                createElement(
                  "button",
                  {
                    class: [
                      "p-2",
                      "text-gray-500",
                      "hover:text-blue-500",
                      "transition-colors",
                    ],
                    onclick: (e) => {
                      e.stopPropagation();
                      createConfirmationModal(
                        "Désarchiver le groupe",
                        "Êtes-vous sûr de vouloir désarchiver ce groupe ?",
                        async () => {
                          try {
                            await archiveGroups([group.id]);
                            await updateGroupsListArchive();
                          } catch (error) {
                            console.error(
                              "Erreur lors du désarchivage du groupe:",
                              error
                            );
                          }
                        }
                      );
                    },
                  },
                  createElement("i", {
                    class: ["fas", "fa-box-open"],
                  })
                ),
            ]
          ),
        ]
      );
    })
  );
};

export {
  addMemberToGroup,
  addAdminToGroup,
  removeMemberFromGroup,
  isUserAdmin,
  getGroupModificationHistory,
  handleGroupModification,
  showEditGroupModal,
  showGroupDetails,
  updateGroupsListArchive,
};
