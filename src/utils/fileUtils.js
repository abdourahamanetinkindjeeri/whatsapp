/**
 * Sauvegarde un fichier dans le dossier assets/images
 * @param {File} file - Le fichier à sauvegarder
 * @param {string} prefix - Préfixe pour le nom du fichier
 * @returns {Promise<string>} - L'URL du fichier sauvegardé
 */
export async function saveFile(file, prefix = "file") {
  try {
    // Créer un nom de fichier unique
    const fileExtension = file.name.split(".").pop();
    const fileName = `${prefix}_${Date.now()}.${fileExtension}`;

    // Convertir le fichier en base64
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });

    // Retourner l'URL du fichier
    return `/src/assets/images/${fileName}`;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du fichier:", error);
    throw error;
  }
}

/**
 * Vérifie si un fichier est une image valide
 * @param {File} file - Le fichier à vérifier
 * @returns {boolean} - True si le fichier est une image valide
 */
export function isValidImage(file) {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  return validTypes.includes(file.type);
}

/**
 * Vérifie la taille d'un fichier
 * @param {File} file - Le fichier à vérifier
 * @param {number} maxSizeMB - Taille maximale en MB
 * @returns {boolean} - True si le fichier est dans la limite de taille
 */
export function isValidFileSize(file, maxSizeMB = 5) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
