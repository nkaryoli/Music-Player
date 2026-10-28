/**
 * Archivo principal: app.js
 * Descripción: Punto de entrada de la aplicación.
 * Orquesta los módulos de audio (player), gestión de canciones (playlist),
 * interfaz (ui), almacenamiento de favoritas (favorites),
 * ecualizador/espectro (visualizer) y atajos de teclado (shortcuts).
 */

import {
    elements,
    formatTime,
    updateCurrentSongUI,
    updateActiveSongHighlight,
    renderPlaylist,
    renderFavorites,
    updateProgressBar,
    updatePlayBtn,
    updateActiveSongPlayback,
    toggleButtonVisual,
    updateVolumeUI,
    toggleFullscreen,
    syncFullscreenIcon,
    openExpandedView,
    closeExpandedView
} from "./modules/ui.js";

import {
    initPlayer,
    loadSong,
    playSong,
    pauseSong,
    togglePlay,
    isPlaying,
    seek,
    setVolume,
    setMute,
    toggleRepeat,
    isRepeatActive,
    toggleShuffle,
    isShuffleActive,
    getCurrentTime,
    getDuration
} from "./modules/player.js";

import {
    fetchSongs,
    getAllSongs,
    getCurrentSong,
    getCurrentIndex,
    setCurrentIndex,
    getNextIndex,
    getPreviousIndex,
    filterSongs,
    reorderSongs
} from "./modules/playlist.js";

import { getFavorites, isFavorite, toggleFavorite, reorderFavorites } from "./modules/favorites.js";
import { initVisualizer, initEqualizerControls } from "./modules/visualizer.js";
import { initShortcuts } from "./modules/shortcuts.js";

// Estado local de volumen y silencio
let isMuted = false;
let isFavoritesPlayback = false;

const getFavoriteIndexes = () => {
    const favoriteIds = getFavorites();
    const favoriteIdSet = new Set(favoriteIds);
    return getAllSongs()
    .map((song, index) => ({ song, index }))
    .filter(({ song }) => favoriteIdSet.has(song.id))
    .sort((a, b) => favoriteIds.indexOf(a.song.id) - favoriteIds.indexOf(b.song.id))
    .map(({ index }) => index);
};

const moveIdBefore = (ids, sourceId, targetId) => {
    const reorderedIds = ids.filter((id) => id !== sourceId);
    const targetPosition = reorderedIds.indexOf(targetId);
    if (targetPosition < 0) return ids;
    reorderedIds.splice(targetPosition, 0, sourceId);
    return reorderedIds;
};

const reorderPlaylist = (sourceId, targetId) => {
    const orderedIds = getAllSongs().map((song) => song.id);
    reorderSongs(moveIdBefore(orderedIds, sourceId, targetId));
    refreshViews();
};

const reorderFavoriteList = (sourceId, targetId) => {
    reorderFavorites(moveIdBefore(getFavorites(), sourceId, targetId));
    refreshViews();
};

const getPlaybackIndex = (direction, isShuffle) => {
    const favoriteIndexes = getFavoriteIndexes();
    if (!isFavoritesPlayback || favoriteIndexes.length === 0) {
        return direction === "next"
            ? getNextIndex(isShuffle)
            : getPreviousIndex(isShuffle);
    }

    const currentPosition = favoriteIndexes.indexOf(getCurrentIndex());
    if (currentPosition < 0) {
        return direction === "next"
            ? favoriteIndexes[0]
            : favoriteIndexes[favoriteIndexes.length - 1];
    }
    if (isShuffle) {
        if (favoriteIndexes.length === 1) return favoriteIndexes[0];
        let randomPosition;
        do {
            randomPosition = Math.floor(Math.random() * favoriteIndexes.length);
        } while (randomPosition === currentPosition);
        return favoriteIndexes[randomPosition];
    }

    const offset = direction === "next" ? 1 : -1;
    const nextPosition = (currentPosition + offset + favoriteIndexes.length) % favoriteIndexes.length;
    return favoriteIndexes[nextPosition];
};

/**
 * Cambia la canción activa y actualiza la interfaz.
 * @param {number} targetIndex Índice de la canción en el catálogo general.
 * @param {boolean} autoPlay Si debe comenzar la reproducción automáticamente.
 */
const changeSong = (targetIndex, autoPlay = true) => {
    if (!setCurrentIndex(targetIndex)) return;
    const song = getCurrentSong();
    if (!song) return;

    updateCurrentSongUI(song, isFavorite(song.id));
    updateActiveSongHighlight(targetIndex);
    loadSong(song, autoPlay);
};

/**
 * Maneja la selección de una canción desde la lista o favoritas.
 * Si ya es la canción activa, alterna play/pausa; si es otra, la carga y reproduce.
 * @param {number} targetIndex Índice de la pista seleccionada.
 * @param {"playlist"|"favorites"} source Lista desde la que se inició la reproducción.
 */
const handleSongSelection = (targetIndex, source) => {
    isFavoritesPlayback = source === "favorites";
    if (getCurrentIndex() === targetIndex) {
        togglePlay();
    } else {
        changeSong(targetIndex, true);
    }
};

/**
 * Alterna el estado de favorita de una canción y refresca las vistas.
 * @param {number} songId ID de la canción.
 */
const handleToggleFavorite = (songId) => {
    const isFav = toggleFavorite(songId);
    if (!isFav && isFavoritesPlayback && getFavoriteIndexes().length === 0) {
        isFavoritesPlayback = false;
    }
    const currentSong = getCurrentSong();
    if (currentSong && currentSong.id === songId) {
        updateCurrentSongUI(currentSong, isFav);
    }
    refreshViews();
};

/**
 * Refresca la lista de reproducción (con filtros activos) y la lista de favoritas.
 */
const refreshViews = () => {
    const query = elements.searchInput ? elements.searchInput.value : "";
    const filtered = filterSongs(query);
    renderPlaylist(
        filtered,
        getCurrentIndex(),
        (index) => handleSongSelection(index, "playlist"),
        handleToggleFavorite,
        isFavorite,
        reorderPlaylist
    );

    const allSongs = getAllSongs();
    const songsById = new Map(allSongs.map((song, index) => [song.id, { ...song, originalIndex: index }]));
    const favSongs = getFavorites()
        .map((id) => songsById.get(id))
        .filter(Boolean);
    renderFavorites(
        favSongs,
        getCurrentIndex(),
        (index) => handleSongSelection(index, "favorites"),
        handleToggleFavorite,
        reorderFavoriteList
    );
    updateActiveSongPlayback(isPlaying());
};

// ==========================================
// CONFIGURACIÓN DE EVENTOS DE INTERFAZ
// ==========================================

const setupEventListeners = () => {
    const accordionPanels = [
        { panel: document.querySelector("#favorites-panel"), button: document.querySelector("#favorites-toggle") },
        { panel: document.querySelector("#playlist-panel"), button: document.querySelector("#playlist-toggle") }
    ];

    const toggleAccordionPanel = (panel, button) => {
        const isExpanded = button.getAttribute("aria-expanded") === "true";

        accordionPanels.forEach(({ panel: otherPanel, button: otherButton }) => {
            const shouldExpand = otherPanel === panel && !isExpanded;
            otherPanel?.classList.toggle("accordion-collapsed", !shouldExpand);
            otherButton?.setAttribute("aria-expanded", String(shouldExpand));
        });
    };

    accordionPanels.forEach(({ panel, button }) => {
        button?.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleAccordionPanel(panel, button);
        });
        panel?.querySelector(":scope > div:first-child, :scope > h2")?.addEventListener("click", () => {
            toggleAccordionPanel(panel, button);
        });
    });

    // Controles de reproducción
    elements.playBtn.addEventListener("click", togglePlay);

    elements.nextBtn.addEventListener("click", () => {
        const wasPlaying = isPlaying();
        const nextIdx = getPlaybackIndex("next", isShuffleActive());
        changeSong(nextIdx, wasPlaying);
    });

    elements.previousBtn.addEventListener("click", () => {
        const wasPlaying = isPlaying();
        if (getCurrentTime() > 3) {
            seek(0);
            updateProgressBar(0, getDuration());
            return;
        }
        const prevIdx = getPlaybackIndex("previous", isShuffleActive());
        changeSong(prevIdx, wasPlaying);
    });

    // Modos Repeat y Shuffle
    elements.repeatBtn.addEventListener("click", () => {
        const active = toggleRepeat();
        toggleButtonVisual(elements.repeatBtn, active);
    });

    elements.shuffleBtn.addEventListener("click", () => {
        const active = toggleShuffle();
        toggleButtonVisual(elements.shuffleBtn, active);
    });

    // Barra de progreso
    elements.progressBar.addEventListener("input", () => {
        const targetTime = Number(elements.progressBar.value);
        seek(targetTime);
        if (elements.currentTime) {
            elements.currentTime.textContent = formatTime(targetTime);
        }
    });

    // Controles de volumen
    elements.volumeSlider.addEventListener("input", () => {
        const vol = Number(elements.volumeSlider.value);
        if (isMuted && vol > 0) isMuted = false;
        setVolume(vol);
        updateVolumeUI(isMuted, vol);
    });

    elements.muteBtn.addEventListener("click", () => {
        isMuted = !isMuted;
        const currentVol = Number(elements.volumeSlider.value);
        setMute(isMuted, currentVol);
        updateVolumeUI(isMuted, isMuted ? 0 : currentVol);
    });

    // Botón de favorita en panel de canción actual
    if (elements.favoriteCurrentBtn) {
        elements.favoriteCurrentBtn.addEventListener("click", () => {
            const currentSong = getCurrentSong();
            if (currentSong) {
                handleToggleFavorite(currentSong.id);
            }
        });
    }

    // Buscador en tiempo real y botón de inicio
    if (elements.searchInput) {
        elements.searchInput.addEventListener("input", refreshViews);
    }

    if (elements.homeBtn) {
        elements.homeBtn.addEventListener("click", () => {
            if (elements.searchInput) elements.searchInput.value = "";
            refreshViews();
        });
    }

    // Pantalla completa (Navegador)
    if (elements.fullscreenBtn) {
        elements.fullscreenBtn.addEventListener("click", toggleFullscreen);
        document.addEventListener("fullscreenchange", syncFullscreenIcon);
    }

    // Vista expandida con Ecualizador
    if (elements.expandBtn) {
        elements.expandBtn.addEventListener("click", openExpandedView);
    }

    if (elements.closeExpandedBtn) {
        elements.closeExpandedBtn.addEventListener("click", closeExpandedView);
    }

    // Cerrar vista expandida con la tecla Escape
    document.addEventListener("keydown", (e) => {
        if (e.code === "Escape") {
            closeExpandedView();
        }
    });
};

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================

const initApp = async () => {
    // 1. Inicializar reproductor con callbacks del ciclo de audio
    const initialVolume = Number(elements.volumeSlider?.value || 0.2);
    initPlayer(
        {
            onLoad: (duration) => {
                updateProgressBar(0, duration);
            },
            onPlay: () => {
                updatePlayBtn(true);
                updateActiveSongPlayback(true);
            },
            onPause: () => {
                updatePlayBtn(false);
                updateActiveSongPlayback(false);
            },
            onEnd: (isRepeat, isShuffle) => {
                if (isRepeat) {
                    changeSong(getCurrentIndex(), true);
                } else {
                    const favoriteIndexes = getFavoriteIndexes();
                    const playbackIndexes = isFavoritesPlayback ? favoriteIndexes : getAllSongs().map((_song, index) => index);
                    const currentPosition = playbackIndexes.indexOf(getCurrentIndex());
                    const isLast = currentPosition === playbackIndexes.length - 1;
                    const nextIdx = getPlaybackIndex("next", isShuffle);
                    if (!isShuffle && isLast && !isFavoritesPlayback) {
                        changeSong(0, false);
                    } else {
                        changeSong(nextIdx, true);
                    }
                }
            },
            onProgress: (currentTime, duration) => {
                updateProgressBar(currentTime, duration);
            }
        },
        initialVolume
    );

    // 2. Inicializar ecualizador y espectro
    initEqualizerControls();
    initVisualizer(isPlaying);

    // 3. Inicializar atajos de teclado
    initShortcuts({
        onTogglePlay: togglePlay,
        onSeekForward: (sec) => {
            const target = Math.min(getDuration(), getCurrentTime() + sec);
            seek(target);
        },
        onSeekBackward: (sec) => {
            const target = Math.max(0, getCurrentTime() - sec);
            seek(target);
        }
    });

    // 4. Configurar eventos de la interfaz
    setupEventListeners();

    // 5. Cargar canciones iniciales y renderizar
    const songs = await fetchSongs();
    if (songs && songs.length > 0) {
        changeSong(0, false);
        refreshViews();
    }
};

initApp();
