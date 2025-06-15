import { createElement } from "../../utils/element.js";

import { updateGroupsList } from "./groups/group.js";
import {
  updateContactList,
  updateContactListArchive,
} from "./contacts/contact.js";

// import { updateContactList, updateContactListArchive } from "./view/contact.js";

// let showContactCheckboxes = false;

let discussionList;

const updateDiscussionList = () => {};
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

  // search.value = 'Bonjour'
  return {
    body: discussion,
    update: updateDiscussionList,
    updateContactList,
    updateGroupsList,
  };
};

export default createDiscussion;
