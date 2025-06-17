import { createElement } from "../../utils/element.js";

import { updateGroupsList } from "./groups/group.js";
import {
  updateContactList,
  updateContactListArchive,
} from "./contacts/contact.js";

// import { updateContactList, updateContactListArchive } from "./view/contact.js";

// let showContactCheckboxes = false;

let discussionList;

const createDiscussion = () => {
  discussionList = createElement(
    "ul",
    {
      id: "discussionList",
      class: ["flex", "flex-col", "gap-y-1", "mt-2"],
    },
    []
  );

  const discussion = createElement(
    "div",
    {
      class: ["flex", "flex-col", "w-1/3", "h-screen", "border-r"],
      style: { backgroundColor: "#faf6f6" },
    },
    [
      createElement(
        "div",
        {
          class: [
            "h-14",
            "w-full",
            "text-xl",
            "border-b",
            "border-gray-200",
            "flex",
            "items-center",
            "px-4",
            "bg-white",
            "text-gray-800",
          ],
        },
        "Discussions"
      ),
      createElement("div", { class: ["w-full", "p-2", "bg-[#faf6f6]"] }, [
        createElement(
          "div",
          {
            class: [
              "relative",
              "w-full",
              "bg-white",
              "rounded-lg",
              "px-3",
              "py-2",
              "shadow-sm",
            ],
          },
          [
            createElement("i", {
              class: [
                "fas",
                "fa-search",
                "text-gray-400",
                "absolute",
                "left-3",
                "top-1/2",
                "transform",
                "-translate-y-1/2",
              ],
            }),
            createElement("input", {
              class: [
                "w-full",
                "h-9",
                "pl-8",
                "border-none",
                "text-gray-800",
                "placeholder-gray-400",
                "focus:outline-none",
                "bg-transparent",
              ],
              placeholder: "Rechercher ou démarrer une discussion",
            }),
          ]
        ),
      ]),
      discussionList,
    ]
  );

  return {
    body: discussion,
    update: (contacts) => {
      discussionList.innerHTML = "";
      discussionList.append(...contacts);
    },
    updateContactList,
    updateGroupsList,
  };
};

export default createDiscussion;
