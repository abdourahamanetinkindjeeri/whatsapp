import { createElement } from "../../utils/element.js";
import { createRegisterModal } from "./contacts/RegisterModal.js";
import { validateContactForm } from "../../eventHandlers.js";
import { getSelectedContacts } from "./contacts/selectedContactsManager.js";
import { archiveContacts, desarchiveContacts } from "../../utils/data.js";

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
            "h-12",
            "w-full",
            "text-xl",
            "border-b",
            "flex",
            "items-center",
            "px-2",
          ],
        },
        "Discussions"
      ),
      createElement("div", { class: ["w-full", "p-2"] }, [
        createElement("input", {
          class: [
            "w-full",
            "h-9",
            "mt-1",
            "rounded-full",
            "border",
            "border-gray-300",
            "px-3",
            "text-sm",
            "focus:outline-none",
            "focus:ring-1",
            "focus:ring-blue",
          ],
          placeholder: "Rechercher un contact",
          id: "search",
          onkeydown: (e) => {
            if (e.key === "*") {
              updateContactList();
            }
          },
        }),
        discussionList,
      ]),
    ]
  );

  const updateDiscussionList = async () => {
    await updateContactList();
    await updateGroupsList();
  };

  return {
    body: discussion,
    update: updateDiscussionList,
    updateContactList,
    updateGroupsList,
  };
};

const createToolbar = () => {
  return createElement(
    "div",
    {
      class: ["flex", "items-center", "justify-between", "p-4", "border-b"],
    },
    [
      createElement(
        "div",
        {
          class: ["flex", "items-center", "gap-2"],
        },
        [
          createElement(
            "button",
            {
              class: [
                "p-2",
                "rounded-full",
                "hover:bg-gray-100",
                "transition",
                "flex",
                "items-center",
                "gap-2",
              ],
              onclick: () => {
                const isArchiveView =
                  document.getElementById("discussionList").dataset.view ===
                  "archive";
                const newView = isArchiveView ? "normal" : "archive";
                document.getElementById("discussionList").dataset.view =
                  newView;
                if (newView === "archive") {
                  updateContactListArchive();
                } else {
                  updateContactList();
                }
              },
            },
            [
              createElement("i", {
                class: ["fas", "fa-box-archive"],
              }),
              createElement("span", {}, "Voir les archives"),
            ]
          ),
          createElement(
            "button",
            {
              class: [
                "p-2",
                "rounded-full",
                "hover:bg-gray-100",
                "transition",
                "flex",
                "items-center",
                "gap-2",
              ],
              onclick: () => {
                const isGroupArchiveView =
                  document.getElementById("discussionList").dataset.view ===
                  "group_archive";
                const newView = isGroupArchiveView ? "normal" : "group_archive";
                document.getElementById("discussionList").dataset.view =
                  newView;
                if (newView === "group_archive") {
                  updateGroupsListArchive();
                } else {
                  updateGroupsList();
                }
              },
            },
            [
              createElement("i", {
                class: ["fas", "fa-users"],
              }),
              createElement("span", {}, "Voir les groupes archivés"),
            ]
          ),
        ]
      ),
      createElement(
        "div",
        {
          class: ["flex", "items-center", "gap-2"],
        },
        [
          createElement(
            "button",
            {
              class: ["p-2", "rounded-full", "hover:bg-gray-100", "transition"],
              onclick: () => {
                const modal = createRegisterModal(validateContactForm);
                document.body.appendChild(modal);
                modal.classList.remove("hidden");
              },
            },
            createElement("i", {
              class: ["fas", "fa-plus"],
            })
          ),
        ]
      ),
    ]
  );
};

export default createDiscussion;
