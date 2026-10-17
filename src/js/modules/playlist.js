/**
 * Módulo: playlist.js
 * Descripción: Gestiona la carga del catálogo de canciones (music.json), el índice de reproducción activo, la navegación entre pistas y el filtrado por búsqueda.
 */

let songs = [];
let currentIndex = 0;

/**
 * Carga el catálogo de canciones desde el archivo JSON local.
 * @returns {Promise<Array>} Promesa que resuelve en la lista de canciones cargadas.
 */
export const fetchSongs = async () => {
    try {
        let response;
        try {
            response = await fetch("./src/data/music.json");
            if (!response.ok) throw new Error("Fallback fetch required");
        } catch {
            response = await fetch("/src/data/music.json");
        }
        songs = await response.json();
        return songs;
    } catch (error) {
        console.error("Error al cargar el catálogo de canciones:", error);
        songs = [];
        return [];
    }
};

/**
 * Obtiene la lista completa de canciones.
 * @returns {Array} Lista de canciones.
 */
export const getAllSongs = () => songs;

/**
 * Obtiene el índice de la canción actualmente seleccionada.
 * @returns {number} Índice actual.
 */
export const getCurrentIndex = () => currentIndex;

/**
 * Establece el índice de la canción actual si es válido.
 * @param {number} index Nuevo índice.
 * @returns {boolean} True si el índice fue válido y actualizado.
 */
export const setCurrentIndex = (index) => {
    if (index >= 0 && index < songs.length) {
        currentIndex = index;
        return true;
    }
    return false;
};

/**
 * Obtiene los datos de la canción actualmente seleccionada.
 * @returns {Object|null} Objeto con la información de la canción o null.
 */
export const getCurrentSong = () => {
    if (songs.length === 0) return null;
    return songs[currentIndex] || null;
};

/**
 * Obtiene un índice aleatorio distinto al actual para el modo Shuffle.
 * @returns {number} Índice aleatorio.
 */
export const getRandomIndex = () => {
    if (songs.length <= 1) return 0;
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === currentIndex);
    return randomIndex;
};

/**
 * Calcula el siguiente índice de reproducción considerando repetición y modo aleatorio.
 * @param {boolean} isShuffle Indica si el modo aleatorio está activado.
 * @returns {number} Índice siguiente.
 */
export const getNextIndex = (isShuffle = false) => {
    if (songs.length === 0) return 0;
    if (isShuffle) {
        return getRandomIndex();
    }
    return currentIndex < songs.length - 1 ? currentIndex + 1 : 0;
};

/**
 * Calcula el índice anterior de reproducción.
 * @param {boolean} isShuffle Indica si el modo aleatorio está activado.
 * @returns {number} Índice anterior.
 */
export const getPreviousIndex = (isShuffle = false) => {
    if (songs.length === 0) return 0;
    if (isShuffle) {
        return getRandomIndex();
    }
    return currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
};

/**
 * Filtra las canciones según un término de búsqueda (título, artista o género).
 * Retorna cada canción enriquecida con su 'originalIndex' para vincularla con el catálogo general.
 * @param {string} query Texto a buscar.
 * @returns {Array} Canciones que coinciden con la búsqueda.
 */
export const filterSongs = (query = "") => {
    const trimmed = query.toLowerCase().trim();
    return songs
        .map((song, originalIndex) => ({ ...song, originalIndex }))
        .filter((song) => {
            if (!trimmed) return true;
            return (
                song.title.toLowerCase().includes(trimmed) ||
                song.artist.toLowerCase().includes(trimmed) ||
                (song.genre && song.genre.toLowerCase().includes(trimmed))
            );
        });
};
