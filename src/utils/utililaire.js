const isEmptyString = (contentString) => contentString.trim() === "";

const isString = (contentString) => typeof contentString === "string";
const isNumber = (contentNumber) => typeof contentNumber === "number";
const isEquals = (firstContent, secondContent) =>
  firstContent === secondContent;

const addEvent = (element, key, value) => element.addEventListener(key, value);
const isEmptyObjet = (props) =>
  Object.keys(props).length === 0 && props.constructor === Object;

const assign = (element, value) => Object.assign(element, value);

const throwError = (tag, messageError) => {
  if (!isEmptyString(tag)) return `${tag} ${messageError}`;
  return `${messageError}`;
};

const createFragment = () => document.createDocumentFragment();

const isArray = (array) => Array.isArray(array);

const isFunction = (myFunction) => typeof myFunction === "function";
const stringToArray = (string) => [string];
const setValueClass = (element, key, value) =>
  element.setAttribute(key, value.join(" "));
const setAttribute = (element, key, value) => element.setAttribute(key, value);
const isPresentKey = (key, props) => key in props;

const addChildToFragment = (fragment, child) => {
  if (child instanceof Node) fragment.appendChild(child);

  return fragment;
};

export {
  isEmptyString,
  isString,
  isNumber,
  isEquals,
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
};
