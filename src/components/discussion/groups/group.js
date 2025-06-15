// import {
//   addSelectedGroup,
//   removeSelectedGroup,
//   getSelectedGroups,
//   resetSelectedGroups,
// } from "./selectedGroupsManager.js";

// import { createElement } from "../../../utils/element.js";
// import { readData } from "../../../utils/data.js"; // Assure-toi que fetchData est bien exportée ici

// export const updateGroupsList = async () => {
//   const discussionList = document.getElementById("discussionList");
//   if (!discussionList) {
//     console.error("discussionList non initialisé.");
//     return;
//   }

//   discussionList.innerHTML = "";

//   // const addGroupButton = createElement(
//   //   "button",
//   //   {
//   //     class: [
//   //       "mb-4",
//   //       "px-4",
//   //       "py-2",
//   //       "bg-blue-600",
//   //       "text-white",
//   //       "rounded",
//   //       "hover:bg-blue-700",
//   //       "transition",
//   //     ],
//   //     onclick: () => {
//   //       const modal = document.getElementById("registerModalGroup");
//   //       if (modal) modal.classList.remove("hidden");
//   //     },
//   //   },
//   //   "fa-plus"
//   // );

//   const addGroupButton = createElement(
//     "button",
//     {
//       class: [
//         "w-10",
//         "h-10",
//         "flex",
//         "items-center",
//         "justify-center",
//         "bg-green-600",
//         "text-white",
//         "rounded-full",
//         "shadow",
//         "hover:bg-green-700",
//         "transition",
//         "duration-300",
//         "mx-auto", // ← Centre horizontalement
//       ],
//       onclick: () => {
//         const modal = document.getElementById("registerModalGroup");
//         if (modal) modal.classList.remove("hidden");
//       },
//     },
//     createElement("i", {
//       class: ["fas", "fa-users"],
//     })
//   );

//   discussionList.append(addGroupButton);

//   // 🔁 Fetch depuis JSON Server
//   const contacts = (await readData("groups")).filter(
//     (item) => item.delete === false && item.archive === false
//   );

//   console.table(contacts);

//   if (contacts.length === 0) {
//     discussionList.append(
//       createElement(
//         "div",
//         {
//           class: ["p-3", "text-gray-600", "text-center"],
//         },
//         "Aucun contact actif à afficher"
//       )
//     );
//     return;
//   }

//   discussionList.append(
//     ...contacts.map((contact) =>
//       createElement(
//         "div",
//         {
//           class: [
//             "flex",
//             "items-center",
//             "p-2",
//             "border-b",
//             "border-gray-200",
//             "hover:bg-gray-100",
//             "cursor-pointer",
//           ],
//           ondblclick: () => {
//             discussionList.innerHTML = "";
//             discussionList.append(addGroupButton);

//             if (!contact.membre || contact.membre.length === 0) {
//               discussionList.append(
//                 createElement(
//                   "div",
//                   {
//                     class: ["p-3", "text-gray-600", "text-center"],
//                   },
//                   "Aucun membre dans ce groupe"
//                 )
//               );
//             }

//             const groupSelection = createElement(
//               "div",
//               { class: ["mt-4", "mb-3"] },
//               [
//                 createElement(
//                   "label",
//                   { class: ["block", "mb-1", "text-sm"] },
//                   "Sélectionner des groupes"
//                 ),
//                 createElement(
//                   "div",
//                   {
//                     class: [
//                       "max-h-40",
//                       "overflow-y-auto",
//                       "border",
//                       "border-gray-300",
//                       "rounded",
//                       "p-2",
//                     ],
//                   },
//                   contacts.map((group) =>
//                     createElement(
//                       "div",
//                       {
//                         class: ["flex", "items-center", "mb-1"],
//                       },
//                       [
//                         createElement("input", {
//                           type: "checkbox",
//                           name: "selectedGroups[]",
//                           value: group.id,
//                           class: ["mr-2"],
//                           id: `group-${group.id}`,
//                           onchange: (e) => {
//                             const checkbox = e.target;
//                             const value = checkbox.value;

//                             if (checkbox.checked) {
//                               addSelectedGroup(value);
//                             } else {
//                               removeSelectedGroup(value);
//                             }

//                             console.log(
//                               "Groupes sélectionnés :",
//                               getSelectedGroups()
//                             );
//                           },
//                         }),
//                         createElement(
//                           "label",
//                           { for: `group-${group.id}`, class: ["text-sm"] },
//                           group.nomGroup || "Groupe sans nom"
//                         ),
//                       ]
//                     )
//                   )
//                 ),
//               ]
//             );

//             const backButton = createElement(
//               "button",
//               {
//                 class: [
//                   "px-4",
//                   "py-2",
//                   "bg-gray-600",
//                   "text-white",
//                   "rounded",
//                   "hover:bg-gray-700",
//                   "transition",
//                 ],
//                 onclick: () => updateGroupsList(),
//               },
//               "Retour à la liste des groupes"
//             );

//             discussionList.append(
//               groupSelection,
//               createElement("div", { class: ["flex", "gap-2", "mt-2"] }, [
//                 backButton,
//               ])
//             );
//           },
//         },
//         [
//           createElement(
//             "div",
//             {
//               class: [
//                 "w-10",
//                 "h-10",
//                 "rounded-full",
//                 "mr-2",
//                 "bg-gray-500",
//                 "flex items-center justify-center",
//                 "font-bold",
//               ],
//             },
//             contact.nomGroup.slice(0, 2).toUpperCase()
//           ),
//           createElement("div", { class: ["flex-1"] }, [
//             createElement(
//               "div",
//               { class: ["font-semibold", "text-sm"] },
//               contact.nomGroup || ""
//             ),
//             createElement(
//               "div",
//               { class: ["text-xs", "text-gray-600"] },
//               `${contact.membre.length} membres`
//             ),
//           ]),
//           createElement("div", {
//             class: [
//               "w-2",
//               "h-2",
//               "rounded-full",
//               contact.status ? "bg-green-500" : "bg-gray-400",
//             ],
//           }),
//         ]
//       )
//     )
//   );
// };

import {
  addSelectedGroup,
  removeSelectedGroup,
  getSelectedGroups,
  resetSelectedGroups,
} from "./selectedGroupsManager.js";
import { createElement } from "../../../utils/element.js";
import { readData } from "../../../utils/data.js"; // Assure-toi que fetchData est bien exportée ici

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
        alert("Bonjour 0000000000000");

        const modal = document.getElementById("registerModalGroup");
        if (modal) {
          console.log("Modal trouvé, suppression de la classe hidden");
          modal.classList.remove("hidden");
        } else {
          console.error("Modal non trouvé");
        }
        // const modal = document.getElementById("registerModalGroup");
        // if (modal) modal.classList.remove("hidden");
      },
    },
    createElement("i", {
      class: ["fas", "fa-users"],
    })
  );

  discussionList.append(addGroupButton);

  // 🔁 Fetch depuis JSON Server
  const contacts = (await readData("groups")).filter(
    (item) => item.delete === false && item.archive === false
  );

  console.table(contacts);

  if (contacts.length === 0) {
    discussionList.append(
      createElement(
        "div",
        {
          class: ["p-3", "text-gray-600", "text-center"],
        },
        "Aucun contact actif à afficher"
      )
    );
    return;
  }

  discussionList.append(
    ...contacts.map((contact) =>
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
          ondblclick: () => {
            discussionList.innerHTML = "";
            discussionList.append(addGroupButton);

            if (!contact.membre || contact.membre.length === 0) {
              discussionList.append(
                createElement(
                  "div",
                  {
                    class: ["p-3", "text-gray-600", "text-center"],
                  },
                  "Aucun membre dans ce groupe"
                )
              );
            }

            const groupSelection = createElement(
              "div",
              { class: ["mt-4", "mb-3"] },
              [
                createElement(
                  "label",
                  { class: ["block", "mb-1", "text-sm"] },
                  "Sélectionner des groupes"
                ),
                createElement(
                  "div",
                  {
                    class: [
                      "max-h-40",
                      "overflow-y-auto",
                      "border",
                      "border-gray-300",
                      "rounded",
                      "p-2",
                    ],
                  },
                  contacts.map((group) =>
                    createElement(
                      "div",
                      {
                        class: ["flex", "items-center", "mb-1"],
                      },
                      [
                        createElement("input", {
                          type: "checkbox",
                          name: "selectedGroups[]",
                          value: group.id,
                          class: ["mr-2"],
                          id: `group-${group.id}`,
                          onchange: (e) => {
                            const checkbox = e.target;
                            const value = checkbox.value;

                            if (checkbox.checked) {
                              addSelectedGroup(value);
                            } else {
                              removeSelectedGroup(value);
                            }

                            console.log(
                              "Groupes sélectionnés :",
                              getSelectedGroups()
                            );
                          },
                        }),
                        createElement(
                          "label",
                          { for: `group-${group.id}`, class: ["text-sm"] },
                          group.nomGroup || "Groupe sans nom"
                        ),
                      ]
                    )
                  )
                ),
              ]
            );

            const backButton = createElement(
              "button",
              {
                class: [
                  "px-4",
                  "py-2",
                  "bg-gray-600",
                  "text-white",
                  "rounded",
                  "hover:bg-gray-700",
                  "transition",
                ],
                onclick: () => updateGroupsList(),
              },
              "Retour à la liste des groupes"
            );

            discussionList.append(
              groupSelection,
              createElement("div", { class: ["flex", "gap-2", "mt-2"] }, [
                backButton,
              ])
            );
          },
        },
        [
          createElement(
            "div",
            {
              class: [
                "w-10",
                "h-10",
                "rounded-full",
                "mr-2",
                "bg-gray-500",
                "flex",
                "items-center",
                "justify-center",
                "font-bold",
              ],
            },
            (contact.nomGroup || "NN").slice(0, 2).toUpperCase() // Ajout d'une valeur par défaut
          ),
          createElement("div", { class: ["flex-1"] }, [
            createElement(
              "div",
              { class: ["font-semibold", "text-sm"] },
              contact.nomGroup || "Groupe sans nom"
            ),
            createElement(
              "div",
              { class: ["text-xs", "text-gray-600"] },
              `${contact.membre?.length || 0} membres`
            ),
          ]),
          createElement("div", {
            class: [
              "w-2",
              "h-2",
              "rounded-full",
              contact.status ? "bg-green-500" : "bg-gray-400",
            ],
          }),
        ]
      )
    )
  );
};
