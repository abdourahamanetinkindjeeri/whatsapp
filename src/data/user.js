import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Obtenir le chemin correct (simule __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire le fichier
const data = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, "utf-8"));

// Ajouter un utilisateur
const newUser = {
  id: Date.now(),
  username: "bob",
  email: "bob@example.com",
};

const user = {
  id: Date.now(),
  username: "jeeri",
  email: "jeeridev@gmail.com",
};

// data.users.push(newUser);

// data.users.push(user);

// Réécrire le fichier
fs.writeFileSync(
  `${__dirname}/data.json`,
  JSON.stringify(data, null, 2),
  "utf-8"
);

console.log("Utilisateur ajouté avec succès");

console.log(data);
