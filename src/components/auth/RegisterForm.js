import { createElement } from "../../utils/element.js";
import { addData, readData } from "../../utils/data.js";
import { displayMessage } from "./optDisplayMessage.js";
import {
  saveFile,
  isValidImage,
  isValidFileSize,
} from "../../utils/fileUtils.js";

export function createRegisterForm(onSuccess) {
  let avatarPreview = null;
  let avatarFile = null;

  const form = createElement(
    "form",
    {
      class: ["space-y-4", "mt-4"],
      onsubmit: async (e) => {
        e.preventDefault();
        const data = await readData("users");
        const users = Array.isArray(data) ? data : [];
        let isValid = true;
        // Champs
        const nom = form.nom.value.trim();
        const prenom = form.prenom.value.trim();
        const telephone = form.telephone.value.trim();
        // Réinitialise erreurs et styles
        ["nomError", "prenomError", "telephoneError"].forEach((id) => {
          const el = form.querySelector(`#${id}`);
          if (el) el.classList.add("hidden");
        });
        form.telephone.classList.remove("border-red-500");
        // Validation
        if (!nom || nom.length < 2) {
          form.querySelector("#nomError").classList.remove("hidden");
          isValid = false;
        }
        if (prenom && prenom.length < 2) {
          form.querySelector("#prenomError").classList.remove("hidden");
          isValid = false;
        }
        const phoneRegex = /^\d{3,14}$/;
        if (!phoneRegex.test(telephone)) {
          form.querySelector("#telephoneError").classList.remove("hidden");
          form.telephone.classList.add("border-red-500");
          isValid = false;
        }
        const numeroExistant = users.filter(
          (user) => user.telephone === telephone && user.delete === false
        );
        if (numeroExistant.length > 0) {
          const telErr = form.querySelector("#telephoneError");
          telErr.textContent = `${telephone} Ce numéro de téléphone existe déjà.`;
          telErr.classList.remove("hidden");
          form.telephone.classList.add("border-red-500");
          form.telephone.focus();
          isValid = false;
        }
        if (!isValid) return;
        // Avatar
        let avatarUrl = "https://via.placeholder.com/150";
        if (avatarFile) {
          const reader = new FileReader();
          avatarUrl = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(avatarFile);
          });
        }
        // Création user
        const newUser = {
          id: Date.now(),
          nom,
          prenom,
          telephone,
          delete: false,
          archive: false,
          profile: {
            avatar: avatarUrl,
            status: form.status.value || "En ligne",
            bio: form.bio.value || "Nouvel utilisateur",
          },
        };
        try {
          await addData("users", newUser);
          displayMessage("Compte créé avec succès !", "success");
          setTimeout(() => {
            if (onSuccess) onSuccess(newUser);
            form.reset();
            if (avatarPreview)
              avatarPreview.src = "https://via.placeholder.com/150";
          }, 1500);
        } catch (error) {
          displayMessage("Erreur lors de la création du compte", "error");
        }
      },
    },
    [
      createElement("div", { class: ["space-y-2"] }, [
        createElement(
          "label",
          { class: ["block", "text-sm", "font-medium", "text-gray-700"] },
          "Prénom"
        ),
        createElement("input", {
          type: "text",
          name: "prenom",
          required: true,
          class: [
            "w-full",
            "px-3",
            "py-2",
            "border",
            "rounded-md",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-blue-500",
          ],
        }),
        createElement(
          "div",
          { id: "prenomError", class: ["text-red-500", "text-xs", "hidden"] },
          "Le prénom est invalide."
        ),
      ]),
      createElement("div", { class: ["space-y-2"] }, [
        createElement(
          "label",
          { class: ["block", "text-sm", "font-medium", "text-gray-700"] },
          "Nom"
        ),
        createElement("input", {
          type: "text",
          name: "nom",
          required: true,
          class: [
            "w-full",
            "px-3",
            "py-2",
            "border",
            "rounded-md",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-blue-500",
          ],
        }),
        createElement(
          "div",
          { id: "nomError", class: ["text-red-500", "text-xs", "hidden"] },
          "Le nom est invalide."
        ),
      ]),
      createElement("div", { class: ["space-y-2"] }, [
        createElement(
          "label",
          { class: ["block", "text-sm", "font-medium", "text-gray-700"] },
          "Numéro de téléphone"
        ),
        createElement("input", {
          type: "tel",
          name: "telephone",
          required: true,
          pattern: "[0-9]{9}",
          placeholder: "771234567",
          class: [
            "w-full",
            "px-3",
            "py-2",
            "border",
            "rounded-md",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-blue-500",
          ],
        }),
        createElement(
          "div",
          {
            id: "telephoneError",
            class: ["text-red-500", "text-xs", "hidden"],
          },
          "Le numéro de téléphone est invalide."
        ),
      ]),
      createElement("div", { class: ["space-y-2"] }, [
        createElement(
          "label",
          { class: ["block", "text-sm", "font-medium", "text-gray-700"] },
          "Photo de profil (optionnel)"
        ),
        createElement("input", {
          type: "file",
          name: "avatar",
          accept: "image/*",
          class: ["w-full", "px-3", "py-2", "border", "rounded-md"],
          onchange: (e) => {
            const file = e.target.files[0];
            if (file) {
              if (!isValidImage(file)) {
                displayMessage(
                  "Le fichier doit être une image valide (JPEG, PNG, GIF, WEBP)",
                  "error"
                );
                e.target.value = "";
                return;
              }
              if (!isValidFileSize(file)) {
                displayMessage("L'image ne doit pas dépasser 5MB", "error");
                e.target.value = "";
                return;
              }
              avatarFile = file;
              if (avatarPreview) {
                const reader = new FileReader();
                reader.onload = (ev) => (avatarPreview.src = ev.target.result);
                reader.readAsDataURL(avatarFile);
              }
            } else if (avatarPreview) {
              avatarPreview.src = "https://via.placeholder.com/150";
            }
          },
        }),
        (avatarPreview = createElement("img", {
          src: "https://via.placeholder.com/150",
          alt: "Prévisualisation avatar",
          class: [
            "w-20",
            "h-20",
            "rounded-full",
            "object-cover",
            "mt-2",
            "mx-auto",
            "border",
          ],
        })),
      ]),
      createElement("div", { class: ["space-y-2"] }, [
        createElement(
          "label",
          { class: ["block", "text-sm", "font-medium", "text-gray-700"] },
          "Statut (optionnel)"
        ),
        createElement("input", {
          type: "text",
          name: "status",
          placeholder: "En ligne",
          class: [
            "w-full",
            "px-3",
            "py-2",
            "border",
            "rounded-md",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-blue-500",
          ],
        }),
      ]),
      createElement("div", { class: ["space-y-2"] }, [
        createElement(
          "label",
          { class: ["block", "text-sm", "font-medium", "text-gray-700"] },
          "Bio (optionnel)"
        ),
        createElement("textarea", {
          name: "bio",
          rows: "3",
          placeholder: "Votre bio...",
          class: [
            "w-full",
            "px-3",
            "py-2",
            "border",
            "rounded-md",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-blue-500",
          ],
        }),
      ]),
      createElement(
        "button",
        {
          type: "submit",
          class: [
            "w-full",
            "bg-blue-500",
            "text-white",
            "py-2",
            "px-4",
            "rounded-md",
            "hover:bg-blue-600",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-blue-500",
            "focus:ring-offset-2",
          ],
        },
        "Créer un compte"
      ),
    ]
  );

  return form;
}
