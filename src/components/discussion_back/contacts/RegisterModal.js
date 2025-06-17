import { createElement } from "../../../utils/element";

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

const createCheckboxField = (id, label) =>
  createElement("div", { class: ["mb-3", "flex", "items-center"] }, [
    createElement("input", {
      type: "checkbox",
      id,
      name: id,
      class: ["mr-2"],
      checked: id === "status",
    }),
    createElement("label", { class: ["text-sm"], for: id }, label),
  ]);

const createRegisterModal = (onSubmit) =>
  createElement(
    "div",
    {
      id: "registerModal",
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
            "Nouveau contact"
          ),
          createElement("form", { id: "registerForm" }, [
            createInputField("nom", "Nom", "text", true, "Entrez le nom"),
            createInputField(
              "prenom",
              "Prénom",
              "text",
              false,
              "Entrez le prénom"
            ),
            createInputField(
              "telephone",
              "Téléphone",
              "tel",
              true,
              "1234567890"
            ),
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
              "Ajouter"
            ),
          ]),
        ]
      ),
    ]
  );

export default createRegisterModal;
