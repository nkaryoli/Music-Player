/**
 * Módulo: favorites.js
 * Descripción: Gestiona el almacenamiento y persistencia de las canciones favoritas del usuario mediante localStorage.
 */

const STORAGE_KEY = "music_player_favorites";

/**
 * Obtiene la lista de IDs de canciones favoritas almacenadas.
 * @returns {number[]} Array con los IDs de las canciones favoritas.
 */
export const getFavorites = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error al leer favoritas de localStorage:", error);
        return [];
    }
};

/**
 * Guarda la lista de IDs de canciones favoritas en localStorage.
 * @param {number[]} favorites Array con los IDs a guardar.
 */
const saveFavorites = (favorites) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
        console.error("Error al guardar favoritas en localStorage:", error);
    }
};

/**
 * Comprueba si una canción está marcada como favorita.
 * @param {number} songId ID de la canción a verificar.
 * @returns {boolean} True si es favorita, false en caso contrario.
 */
export const isFavorite = (songId) => {
    const favorites = getFavorites();
    return favorites.includes(songId);
};

/**
 * Añade o quita una canción de la lista de favoritas.
 * @param {number} songId ID de la canción a alternar.
 * @returns {boolean} Nuevo estado: true si ahora es favorita, false si se quitó.
 */
export const toggleFavorite = (songId) => {
    let favorites = getFavorites();
    const index = favorites.indexOf(songId);
    let isFav = false;

    if (index >= 0) {
        favorites.splice(index, 1);
        isFav = false;
    } else {
        favorites.push(songId);
        isFav = true;
    }

    saveFavorites(favorites);
    return isFav;
};

/**
 * Guarda el orden personalizado de las canciones favoritas.
 * @param {number[]} orderedIds IDs en el nuevo orden.
 */
export const reorderFavorites = (orderedIds) => {
    const favoriteIds = getFavorites();
    const orderedSet = new Set(orderedIds);
    const reorderedIds = [
        ...orderedIds.filter((id) => favoriteIds.includes(id)),
        ...favoriteIds.filter((id) => !orderedSet.has(id))
    ];
    saveFavorites(reorderedIds);
};
