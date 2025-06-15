import { isEmptyString, isNumber, isString } from "../utililaire";

const isValidUser = (user) => user &&
    isNumber(user.id) &&
    isString(user.nom) &&
    isString(user.prenom) &&
    !isEmptyString(user.nom) &&
    !isEmptyString(user.prenom)


const utilisateur = {
  id: "101",
  nom: "Durand",
  prenom: "Alice"
};

console.log(isValidUser(utilisateur)); // true
