import {
  isEmptyString,
  isString,
  isFunction,
  isArray,
  isEmptyObjet,
  assign,
  stringToArray,
  throwError,
  createFragment,
  setValueClass,
  setAttribute,
  isPresentKey,
  addEvent,
  addChildToFragment,
} from "./utililaire.js";
export const createElement = (tag, props = {}, content = "") => {
  if (!isString(tag) || isEmptyString(tag))
    throw new Error(throwError(tag, "doit être une chaîne non vide"));
  if (isPresentKey("vFor", props)) {
    if (!isEmptyObjet(props.vFor)) {
      const { each, render } = props.vFor;
      const fragment = createFragment();

      each.forEach((data) => {
        const child = render(data);
        addChildToFragment(fragment, child);
      });
      return fragment;
    }
  }
  const element = document.createElement(tag);
  if (!isEmptyObjet(props)) {
    for (const key in props) {
      if (key === "vFor") continue;
      if (key === "class" || key === "className") {
        if (isString(props[key])) props[key] = stringToArray(props[key]);

        if (isArray(props[key])) setValueClass(element, key, props[key]);
      } else if (key.startsWith("on") && isFunction(props[key])) {
        addEvent(element, key.slice(2).toLowerCase(), props[key]);
      } else if (key === "style") {
        assign(element.style, props[key]);
      } else setAttribute(element, key, props[key]);
    }
  }
  // if (content) {
  //   const contentArray = isArray(content) ? content : stringToArray(content);

  //   contentArray.forEach((cont) => {
  //     if (cont instanceof Node) {
  //       element.appendChild(cont);
  //     } else if (isString(cont)) {
  //       element.appendChild(document.createTextNode(cont));
  //     }
  //   });
  // }

  if (content && !isPresentKey("vFor", props)) {
    const contentArray = isArray(content) ? content : stringToArray(content);
    contentArray.forEach((cont) => {
      if (cont instanceof Node) {
        element.appendChild(cont);
      } else if (isString(cont)) {
        element.appendChild(document.createTextNode(cont));
      }
    });
  }

  element.addElement = function () {
    const newElement = createElement(tag, (props = {}), (content = ""));
    this.appendChild(newElement);
    return this;
  };
  element.addNode = function (node) {
    this.appendChild(node);

    return this;
  };

  return element;
};
