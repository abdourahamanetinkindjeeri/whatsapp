import { addData, readData } from "./utils/data.js";

// const validateForm = async (updateDiscussionList) => {
//   try {
//     const data = await readData('users');
//     const users =
//       data && data.users && Array.isArray(data.users) ? data.users : [];
//     console.log("Données users :", data); // Log pour déboguer

//     const form = document.getElementById("registerForm");
//     if (!form) {
//       console.error("Formulaire registerForm non trouvé.");
//       console.log("Erreur : Formulaire de contact non disponible.");
//       return;
//     }

//     document
//       .querySelectorAll("#idError, #nomError, #prenomError, #telephoneError")
//       .forEach((error) => error.classList.add("hidden"));

//     let isValid = true;

//     const nomInput = document.getElementById("nom");
//     if (!nomInput) {
//       throw new Error("Erreur : Champ Nom manquant dans le formulaire.");
//     }
//     const nom = nomInput.value;
//     if (!nom || nom.length < 2) {
//       document.getElementById("nomError").classList.remove("hidden");
//       isValid = false;
//     }

//     const prenomInput = document.getElementById("prenom");
//     if (!prenomInput) {
//       console.error("Champ Prénom non trouvé.");
//       console.log("Erreur : Champ Prénom manquant dans le formulaire.");
//       return;
//     }
//     const prenom = prenomInput.value;
//     if (prenom && prenom.length < 2) {
//       document.getElementById("prenomError").classList.remove("hidden");
//       isValid = false;
//     }

//     const telephoneInput = document.getElementById("telephone");
//     if (!telephoneInput) {
//       throw new Error("Champ Téléphone non trouvé.");
//     }
//     const telephone = telephoneInput.value;
//     const phoneRegex = /^\d{3,14}$/;
//     if (!phoneRegex.test(telephone)) {
//       document.getElementById("telephoneError").classList.remove("hidden");
//       isValid = false;
//     }

//     const numeroExistant = users.filter(
//       (user) => user.telephone === telephone && user.delete === false
//     );
//     if (numeroExistant.length > 0) {
//       document.getElementById(
//         "telephoneError"
//       ).textContent = `${telephone} Ce numéro de téléphone existe déjà.`;
//       document.getElementById("telephoneError").classList.remove("hidden");
//       isValid = false;
//     }

//     if (isValid) {
//       const trouverProchainPrenomUnique = (users, nom, prenom) => {
//         const basePrenom = prenom.replace(/\s*\d+$/, "").trim();
//         if (!basePrenom) return prenom || "Inconnu"; // Gestion du prénom vide
//         const doublons = users.filter(
//           (user) =>
//             user.nom === nom &&
//             user.delete === false &&
//             user.prenom.startsWith(basePrenom)
//         );
//         if (doublons.length === 0) return prenom || "Inconnu";
//         const chiffres = doublons.map((user) => {
//           const match = user.prenom.trim().match(/(\d+)$/);
//           return match ? Number(match[1]) : 0;
//         });
//         const max = Math.max(...chiffres);
//         return `${basePrenom} ${max + 1}`;
//       };

//       const prenomUnique = trouverProchainPrenomUnique(users, nom, prenom);
//       const newContact = {
//         id: Date.now(),
//         nom,
//         prenom: prenomUnique,
//         status: document.getElementById("status").checked,
//         archive: false,
//         delete: false,
//         telephone,
//       };
//       addData("users", newContact);
//       updateDiscussionList();
//       form.reset();
//       document.getElementById("registerModal").classList.add("hidden");
//     }
//   } catch (error) {
//     console.error("Erreur dans validateForm :", error);
//     console.log("Erreur lors de l'ajout du contact : " + error.message);
//   }
// };

const validateContactForm = async (updateDiscussionList) => {
  try {
    const data = await readData("users");
    const users = Array.isArray(data?.users) ? data.users : [];
    console.log("Données users :", data);

    const form = document.getElementById("registerForm");
    if (!form) {
      console.error("Formulaire registerForm non trouvé.");
      return;
    }

    document
      .querySelectorAll("#idError, #nomError, #prenomError, #telephoneError")
      .forEach((error) => error.classList.add("hidden"));

    let isValid = true;

    const nomInput = document.getElementById("nom");
    if (!nomInput) throw new Error("Champ Nom manquant dans le formulaire.");
    const nom = nomInput.value.trim();
    if (!nom || nom.length < 2) {
      document.getElementById("nomError").classList.remove("hidden");
      isValid = false;
    }

    const prenomInput = document.getElementById("prenom");
    if (!prenomInput)
      throw new Error("Champ Prénom manquant dans le formulaire.");
    const prenom = prenomInput.value.trim();
    if (prenom && prenom.length < 2) {
      document.getElementById("prenomError").classList.remove("hidden");
      isValid = false;
    }

    const telephoneInput = document.getElementById("telephone");
    if (!telephoneInput) throw new Error("Champ Téléphone non trouvé.");
    const telephone = telephoneInput.value.trim();
    const phoneRegex = /^\d{3,14}$/;
    if (!phoneRegex.test(telephone)) {
      document.getElementById("telephoneError").classList.remove("hidden");
      isValid = false;
    }

    const numeroExistant = users.filter(
      (user) => user.telephone === telephone && user.delete === false
    );
    if (numeroExistant.length > 0) {
      document.getElementById(
        "telephoneError"
      ).textContent = `${telephone} Ce numéro de téléphone existe déjà.`;
      document.getElementById("telephoneError").classList.remove("hidden");
      isValid = false;
    }

    if (isValid) {
      const trouverProchainPrenomUnique = (users, nom, prenom) => {
        const basePrenom = prenom.replace(/\s*\d+$/, "").trim() || "Inconnu";
        const doublons = users.filter(
          (user) =>
            user.nom === nom &&
            user.delete === false &&
            user.prenom.startsWith(basePrenom)
        );
        if (doublons.length === 0) return basePrenom;
        const chiffres = doublons.map((user) => {
          const match = user.prenom.trim().match(/(\d+)$/);
          return match ? Number(match[1]) : 0;
        });
        const max = Math.max(0, ...chiffres);
        return `${basePrenom} ${max + 1}`;
      };

      const prenomUnique = trouverProchainPrenomUnique(users, nom, prenom);
      const newContact = {
        id: Date.now(),
        nom,
        prenom: prenomUnique,
        status: document.getElementById("status")?.checked ?? false,
        archive: false,
        delete: false,
        telephone,
      };
      await addData("users", newContact);
      if (typeof updateDiscussionList === "function") {
        await updateDiscussionList();
      }
      form.reset();
      document.getElementById("registerModal")?.classList.add("hidden");
    }
  } catch (error) {
    console.error("Erreur dans validateContactForm :", error);
    console.log(
      "Erreur lors de l'ajout du contact : " +
        (error.message || "Problème inconnu")
    );
  }
};

const validateGroupForm = async (updateDiscussionList) => {
  try {
    const form = document.getElementById("registerFormGroup");
    if (!form) {
      console.error("Formulaire registerFormGroup non trouvé.");
      throw new Error("Erreur : Formulaire de groupe non disponible.");
    }

    document
      .querySelectorAll("#nomGroupError, #membreError")
      .forEach((error) => error.classList.add("hidden"));

    let isValid = true;

    const nomGroupInput = document.getElementById("nomGroup");
    if (!nomGroupInput) {
      console.error("Champ Nom du groupe non trouvé.");
      console.log("Erreur : Champ Nom du groupe manquant.");
      return;
    }
    const nomGroup = nomGroupInput.value.trim();
    if (!nomGroup || nomGroup.length < 2) {
      document.getElementById("nomGroupError").classList.remove("hidden");
      isValid = false;
    }

    // Get current user ID (assuming it's stored in localStorage or similar)
    const currentUserId = 1; // Replace with actual current user ID

    // Get selected members
    const membreCheckboxes = document.querySelectorAll(
      'input[name="membre[]"]:checked'
    );
    const membre = Array.from(membreCheckboxes).map((checkbox) =>
      Number(checkbox.value)
    );

    // Add current user as member if not already included
    if (!membre.includes(currentUserId)) {
      membre.push(currentUserId);
    }

    if (membre.length < 2) {
      document.getElementById("membreError").textContent =
        "Il faut ajouter au moins un autre membre pour pouvoir créer un groupe";
      document.getElementById("membreError").classList.remove("hidden");
      isValid = false;
    }

    if (isValid) {
      const newGroup = {
        id: Date.now(),
        nom: nomGroup,
        description: "",
        membres: membre.map((userId) => ({
          userId,
          role: userId === currentUserId ? "admin" : "membre",
          dateAjout: new Date().toISOString(),
        })),
        admin: currentUserId,
        dateCreation: new Date().toISOString(),
        archive: false,
        delete: false,
      };
      await addData("groups", newGroup);
      if (typeof updateDiscussionList === "function") {
        await updateDiscussionList();
      }
      form.reset();
      document.getElementById("registerModalGroup").classList.add("hidden");
    }
  } catch (error) {
    console.error("Erreur dans validateGroupForm :", error);
    console.log("Erreur lors de la création du groupe : " + error.message);
  }
};

const handleModalClose = (event) => {
  const modal = event.target.closest("#registerModal, #registerModalGroup");
  if (modal && event.target === modal) {
    modal.classList.add("hidden");
  }
};

const testAddData = async () => {
  try {
    const testContact = {
      id: Date.now(),
      nom: "DIALLO",
      prenom: "Abdourahamane",
      telephone: "772707050",
      status: true,
      archive: false,
      delete: false,
    };

    console.log("Contact ajouté avec succès !", testContact);

    addData("users", testContact);
    console.log("Contact ajouté avec succès !", testContact);

    // Facultatif : voir le résultat
    const users = JSON.parse(localStorage.getItem("users"));
    console.table(users);

    // Optionnel : mettre à jour l'affichage si tu as une fonction pour ça
    // updateDiscussionList();
  } catch (error) {
    console.error("Erreur dans testAddData :", error);
  }
};

const testReadData = async () => {
  try {
    const data = await readData();
    console.log("Données lues :", data);
    return data;
  } catch (error) {
    console.error("Erreur dans testReadData :", error);
  }
};

const testContact = {
  id: Date.now(),
  nom: "DIALLO",
  prenom: "Abdourahamane",
  telephone: "102030401",
  status: true,
  archive: false,
  delete: false,
};

// const key = "users";
// const existing = JSON.parse(localStorage.getItem(key)) || [];
// existing.push(testContact);
// localStorage.setItem(key, JSON.stringify(existing));
// console.log("Contact ajouté :", testContact);

export {
  validateContactForm,
  validateGroupForm,
  handleModalClose,
  testAddData,
  // testReadData,
};

export default validateGroupForm;
