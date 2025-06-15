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
} from "./utilitaire.js";

/**
 * Crée un élément DOM avec des propriétés et du contenu
 * @param {string} tag - Le nom de la balise HTML
 * @param {Object} props - Les propriétés et attributs de l'élément
 * @param {string|Array|Node} content - Le contenu de l'élément
 * @returns {Element|DocumentFragment} L'élément créé ou un fragment
 *
 * @example
 * // Élément simple
 * const div = createElement('div', { class: 'container' }, 'Hello World');
 *
 * // Avec événements
 * const button = createElement('button', {
 *   class: ['btn', 'primary'],
 *   onClick: () => console.log('Clicked!'),
 *   style: { backgroundColor: 'blue' }
 * }, 'Click me');
 *
 * // Rendu conditionnel avec vFor
 * const list = createElement('ul', {
 *   vFor: {
 *     each: ['item1', 'item2', 'item3'],
 *     render: (item) => createElement('li', {}, item)
 *   }
 * });
 */
export const createElement = (tag, props = {}, content = "") => {
  // Validation des paramètres d'entrée
  if (!isString(tag) || isEmptyString(tag)) {
    throw new Error(throwError(tag, "doit être une chaîne non vide"));
  }

  // Gestion du rendu conditionnel avec vFor
  if (isPresentKey("vFor", props) && !isEmptyObjet(props.vFor)) {
    return createConditionalFragment(props.vFor);
  }

  // Création de l'élément principal
  const element = document.createElement(tag);

  // Application des propriétés
  if (!isEmptyObjet(props)) {
    applyProperties(element, props);
  }

  // Ajout du contenu si pas de vFor
  if (content && !isPresentKey("vFor", props)) {
    appendContent(element, content);
  }

  // Ajout des méthodes d'extension
  enhanceElement(element, tag, props);

  return element;
};

/**
 * Crée un fragment avec rendu conditionnel
 * @param {Object} vForConfig - Configuration du vFor
 * @returns {DocumentFragment}
 */
const createConditionalFragment = (vForConfig) => {
  const { each, render } = vForConfig;

  if (!isArray(each) || !isFunction(render)) {
    throw new Error(
      "vFor nécessite un tableau 'each' et une fonction 'render'"
    );
  }

  const fragment = createFragment();

  each.forEach((data, index) => {
    try {
      const child = render(data, index);
      if (child) {
        addChildToFragment(fragment, child);
      }
    } catch (error) {
      console.error(`Erreur lors du rendu de l'élément ${index}:`, error);
    }
  });

  return fragment;
};

/**
 * Applique les propriétés à un élément
 * @param {Element} element - L'élément DOM
 * @param {Object} props - Les propriétés à appliquer
 */
const applyProperties = (element, props) => {
  for (const key in props) {
    if (key === "vFor") continue;

    try {
      if (key === "class" || key === "className") {
        handleClassProperty(element, key, props[key]);
      } else if (key.startsWith("on") && isFunction(props[key])) {
        handleEventProperty(element, key, props[key]);
      } else if (key === "style") {
        handleStyleProperty(element, props[key]);
      } else {
        setAttribute(element, key, props[key]);
      }
    } catch (error) {
      console.error(
        `Erreur lors de l'application de la propriété '${key}':`,
        error
      );
    }
  }
};

/**
 * Gère la propriété class/className
 * @param {Element} element - L'élément DOM
 * @param {string} key - La clé de propriété
 * @param {string|Array} value - La valeur de la classe
 */
const handleClassProperty = (element, key, value) => {
  let classList = value;

  if (isString(value)) {
    classList = stringToArray(value);
  }

  if (isArray(classList)) {
    setValueClass(element, key, classList);
  }
};

/**
 * Gère les propriétés d'événements
 * @param {Element} element - L'élément DOM
 * @param {string} key - La clé de propriété (ex: onClick)
 * @param {Function} handler - Le gestionnaire d'événement
 */
const handleEventProperty = (element, key, handler) => {
  const eventName = key.slice(2).toLowerCase();
  addEvent(element, eventName, handler);
};

/**
 * Gère la propriété style
 * @param {Element} element - L'élément DOM
 * @param {Object} styles - Les styles à appliquer
 */
const handleStyleProperty = (element, styles) => {
  if (typeof styles === "object" && styles !== null) {
    assign(element.style, styles);
  }
};

/**
 * Ajoute le contenu à un élément
 * @param {Element} element - L'élément DOM
 * @param {string|Array|Node} content - Le contenu à ajouter
 */
const appendContent = (element, content) => {
  const contentArray = normalizeContent(content);

  contentArray.forEach((item, index) => {
    try {
      if (item instanceof Node) {
        element.appendChild(item);
      } else if (isString(item) && !isEmptyString(item)) {
        element.appendChild(document.createTextNode(item));
      } else if (item !== null && item !== undefined) {
        // Conversion en string pour les nombres, booléens, etc.
        element.appendChild(document.createTextNode(String(item)));
      }
    } catch (error) {
      console.error(`Erreur lors de l'ajout du contenu ${index}:`, error);
    }
  });
};

/**
 * Normalise le contenu en tableau
 * @param {string|Array|Node} content - Le contenu à normaliser
 * @returns {Array}
 */
const normalizeContent = (content) => {
  if (isArray(content)) {
    return content;
  } else if (isString(content)) {
    return stringToArray(content);
  } else {
    return [content];
  }
};

/**
 * Ajoute des méthodes d'extension à l'élément
 * @param {Element} element - L'élément DOM
 * @param {string} tag - Le tag original
 * @param {Object} originalProps - Les propriétés originales
 */
const enhanceElement = (element, tag, originalProps) => {
  /**
   * Ajoute un nouvel élément enfant du même type
   * @param {Object} props - Propriétés du nouvel élément
   * @param {string|Array|Node} content - Contenu du nouvel élément
   * @returns {Element} L'élément parent pour chaînage
   */
  element.addElement = function (props = {}, content = "") {
    try {
      const newElement = createElement(tag, props, content);
      this.appendChild(newElement);
      return this;
    } catch (error) {
      console.error("Erreur lors de l'ajout d'un élément:", error);
      return this;
    }
  };

  /**
   * Ajoute un nœud DOM existant
   * @param {Node} node - Le nœud à ajouter
   * @returns {Element} L'élément parent pour chaînage
   */
  element.addNode = function (node) {
    try {
      if (node instanceof Node) {
        this.appendChild(node);
      } else {
        console.warn("addNode: le paramètre n'est pas un nœud DOM valide");
      }
      return this;
    } catch (error) {
      console.error("Erreur lors de l'ajout du nœud:", error);
      return this;
    }
  };

  /**
   * Ajoute plusieurs éléments en une fois
   * @param {Array} elements - Tableau d'éléments à ajouter
   * @returns {Element} L'élément parent pour chaînage
   */
  element.addElements = function (elements) {
    if (!isArray(elements)) {
      console.warn("addElements: le paramètre doit être un tableau");
      return this;
    }

    elements.forEach((el, index) => {
      try {
        if (el instanceof Node) {
          this.appendChild(el);
        } else if (typeof el === "object" && el.tag) {
          // Support pour les objets de configuration
          const newEl = createElement(el.tag, el.props || {}, el.content || "");
          this.appendChild(newEl);
        }
      } catch (error) {
        console.error(`Erreur lors de l'ajout de l'élément ${index}:`, error);
      }
    });

    return this;
  };

  /**
   * Met à jour les propriétés de l'élément
   * @param {Object} newProps - Nouvelles propriétés à appliquer
   * @returns {Element} L'élément pour chaînage
   */
  element.updateProps = function (newProps) {
    try {
      applyProperties(this, newProps);
      return this;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des propriétés:", error);
      return this;
    }
  };

  /**
   * Vide le contenu de l'élément
   * @returns {Element} L'élément pour chaînage
   */
  element.clear = function () {
    this.innerHTML = "";
    return this;
  };
};

/**
 * Fonction utilitaire pour créer des éléments avec une syntaxe simplifiée
 * @param {string} selector - Sélecteur CSS-like (ex: 'div.container#main')
 * @param {Object} props - Propriétés additionnelles
 * @param {string|Array|Node} content - Contenu de l'élément
 * @returns {Element}
 *
 * @example
 * const div = createElementFromSelector('div.container#main', {
 *   style: { padding: '10px' }
 * }, 'Content');
 */
export const createElementFromSelector = (
  selector,
  props = {},
  content = ""
) => {
  const parsed = parseSelector(selector);
  const mergedProps = { ...parsed.props, ...props };

  return createElement(parsed.tag, mergedProps, content);
};

/**
 * Parse un sélecteur CSS simple
 * @param {string} selector - Le sélecteur à parser
 * @returns {Object} Objet avec tag et props
 */
const parseSelector = (selector) => {
  const result = { tag: "div", props: {} };

  // Extraction du tag
  const tagMatch = selector.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
  if (tagMatch) {
    result.tag = tagMatch[1];
  }

  // Extraction des classes
  const classMatches = selector.match(/\.([a-zA-Z0-9_-]+)/g);
  if (classMatches) {
    result.props.class = classMatches.map((cls) => cls.substring(1));
  }

  // Extraction de l'ID
  const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    result.props.id = idMatch[1];
  }

  return result;
};

/**
 * Factory pour créer des éléments HTML courants
 */
export const ElementFactory = {
  div: (props, content) => createElement("div", props, content),
  span: (props, content) => createElement("span", props, content),
  p: (props, content) => createElement("p", props, content),
  h1: (props, content) => createElement("h1", props, content),
  h2: (props, content) => createElement("h2", props, content),
  h3: (props, content) => createElement("h3", props, content),
  button: (props, content) => createElement("button", props, content),
  input: (props) => createElement("input", props),
  img: (props) => createElement("img", props),
  a: (props, content) => createElement("a", props, content),
  ul: (props, content) => createElement("ul", props, content),
  ol: (props, content) => createElement("ol", props, content),
  li: (props, content) => createElement("li", props, content),
  table: (props, content) => createElement("table", props, content),
  tr: (props, content) => createElement("tr", props, content),
  td: (props, content) => createElement("td", props, content),
  th: (props, content) => createElement("th", props, content),
  form: (props, content) => createElement("form", props, content),
  label: (props, content) => createElement("label", props, content),
  select: (props, content) => createElement("select", props, content),
  option: (props, content) => createElement("option", props, content),
  textarea: (props, content) => createElement("textarea", props, content),
};

export default createElement;
