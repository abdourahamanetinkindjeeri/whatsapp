import { createElement } from "../../../utils/element.js";
import { readData } from "../../../utils/data";

const createInputField = (
  id,
  label,
  type,
  required = false,
  placeholder = ""
) =>
  createElement("div", { class: ["mb-3"] }, [
    createElement(
      "label",
      { class: ["block", "mb-1", "text-sm"], for: id },
      label
    ),
    createElement("input", {
      type,
      id,
      name: id,
      required,
      class: [
        "w-full",
        "p-2",
        "border",
        "border-gray-300",
        "rounded",
        "text-sm",
        "focus:outline-none",
        "focus:ring-1",
        "focus:ring-blue-gray-400",
      ],
      placeholder,
    }),
    createElement(
      "div",
      {
        id: `${id}Error`,
        class: ["text-red-500", "text-xs", "mt-1", "hidden"],
      },
      `Le ${label.toLowerCase()} est invalide.`
    ),
  ]);

// const createSelectField = (id, label, options) =>
//   createElement("div", { class: ["mb-3"] }, [
//     createElement(
//       "label",
//       { class: ["block", "mb-1", "text-sm"], for: id },
//       label
//     ),
//     createElement(
//       "select",
//       {
//         id,
//         name: id,
//         multiple: true,
//         class: [
//           "w-full",
//           "p-2",
//           "border",
//           "border-gray-300",
//           "rounded",
//           "text-sm",
//           "focus:outline-none",
//           "focus:ring-1",
//           "focus:ring-blue-gray-400",
//         ],
//       },
//       options.map((opt) =>
//         createElement("option", { value: opt.value }, opt.label)
//       )
//     ),
//     createElement(
//       "div",
//       {
//         id: `${id}Error`,
//         class: ["text-red-500", "text-xs", "mt-1", "hidden"],
//       },
//       `Veuillez sélectionner au moins un ${label.toLowerCase()}.`
//     ),
//   ]);

const createCheckboxField = (id, label, name, value) =>
  createElement("div", { class: ["mb-2", "flex", "items-center"] }, [
    createElement("input", {
      type: "checkbox",
      id: `${id}-${value}`,
      name,
      value,
      class: ["mr-2"],
    }),
    createElement(
      "label",
      { class: ["text-sm"], for: `${id}-${value}` },
      label
    ),
  ]);

export const createMembersCheckboxField = (id, label, options) =>
  createElement("div", { class: ["mb-3"] }, [
    createElement("label", { class: ["block", "mb-1", "text-sm"] }, label),
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
      options.map((opt) =>
        createCheckboxField(id, opt.label, `${id}[]`, opt.value)
      )
    ),
    createElement(
      "div",
      {
        id: `${id}Error`,
        class: ["text-red-500", "text-xs", "mt-1", "hidden"],
      },
      `Veuillez cocher au moins un ${label.toLowerCase()}.`
    ),
  ]);

const createRegisterModalGroups = async (onSubmit) => {
  const data = await readData("users");
  const contacts = (data || []).filter((c) => !c.delete && !c.archive);

  const contactOptions = contacts.map((contact) => ({
    value: contact.id,
    label: `${contact.nom}${contact.prenom ? ` ${contact.prenom}` : ""}`,
  }));
  return createElement(
    "div",
    {
      id: "registerModalGroup",
      class: [
        "hidden",
        "fixed",
        "inset-0",
        "bg-black",
        "bg-opacity-50",
        "flex",
        "justify-center",
        "items-center",
        "z-50",
      ],
    },
    [
      createElement(
        "div",
        {
          class: [
            "bg-white",
            "p-4",
            "rounded-lg",
            "shadow-lg",
            "w-full",
            "max-w-sm",
          ],
        },
        [
          createElement(
            "h2",
            { class: ["text-lg", "font-semibold", "text-center", "mb-4"] },
            "Nouveau groupe"
          ),
          createElement("form", { id: "registerFormGroup" }, [
            createInputField(
              "nomGroup",
              "Nom du groupe",
              "text",
              true,
              "Entrez le nom du groupe"
            ),
            createMembersCheckboxField("membre", "Membres", contactOptions),
            createMembersCheckboxField(
              "admin",
              "Administrateurs",
              contactOptions
            ),
            // createSelectField("admin", "Administrateurs", contactOptions),
            createCheckboxField("status", "Statut actif"),
            createElement(
              "button",
              {
                type: "button",
                class: [
                  "w-full",
                  "p-2",
                  "bg-blue-500",
                  "text-white",
                  "rounded",
                  "text-sm",
                  "hover:bg-blue-600",
                  "transition",
                ],
                onclick: onSubmit,
              },
              "Créer groupe"
            ),
          ]),
        ]
      ),
    ]
  );
};

export default createRegisterModalGroups;
