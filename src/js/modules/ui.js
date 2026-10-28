/**
 * Módulo: ui.js
 * Descripción: Centraliza la manipulación del DOM, el renderizado de componentes (canciones y favoritas), la actualización de la barra de progreso y el refresco visual de los controles.
 */

// Elementos cacheados del DOM
export const elements = {
    // Listas y contadores
    musicList: document.querySelector("#list"),
    favoritesList: document.querySelector("#favorites-list"),
    playlistCount: document.querySelector("#playlist-count"),
    favoritesCount: document.querySelector("#favorites-count"),

    // Buscador y navegación
    searchInput: document.querySelector("#search-input"),
    homeBtn: document.querySelector("#home-btn"),

    // Barra de tiempo y canción en barra inferior
    currentTime: document.querySelector("#current-time"),
    progressBar: document.querySelector("#progress-bar"),
    totalTime: document.querySelector("#total-time"),
    songImg: document.querySelector("#song-img"),
    songTitle: document.querySelector("#song-title"),
    songAuthor: document.querySelector("#song-author"),

    // Controles de reproducción
    shuffleBtn: document.querySelector("#shuffle"),
    previousBtn: document.querySelector("#previous"),
    playBtn: document.querySelector("#play"),
    nextBtn: document.querySelector("#next"),
    repeatBtn: document.querySelector("#repeat"),

    // Volumen y pantalla completa
    muteBtn: document.querySelector("#mute-btn"),
    volumeSlider: document.querySelector("#volume"),
    volumeValue: document.querySelector("#volume-value"),
    fullscreenBtn: document.querySelector("#fullscreen-btn"),

    // Tarjeta "Sonando Ahora" (Panel Derecho)
    currentSongBg: document.querySelector("#current-song-bg"),
    currentSongImg: document.querySelector("#current-song-img"),
    currentSongTitle: document.querySelector("#current-song-title"),
    currentSongArtist: document.querySelector("#current-song-artist"),
    currentSongGenre: document.querySelector("#current-song-genre"),
    favoriteCurrentBtn: document.querySelector("#favorite-current-btn"),
    expandBtn: document.querySelector("#expand-btn"),

    // Vista Expandida (Pantalla Completa)
    expandedView: document.querySelector("#expanded-view"),
    closeExpandedBtn: document.querySelector("#close-expanded-btn"),
    expandedBg: document.querySelector("#expanded-bg"),
    expandedSongImg: document.querySelector("#expanded-song-img"),
    expandedSongTitle: document.querySelector("#expanded-song-title"),
    expandedSongArtist: document.querySelector("#expanded-song-artist"),
    expandedSongGenre: document.querySelector("#expanded-song-genre")
};

/**
 * Formatea segundos a formato mm:ss (ejemplo: 2:05).
 * @param {number} seconds Segundos a formatear.
 * @returns {string} Tiempo formateado.
 */
export const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Abre la vista expandida inmersiva.
 */
export const openExpandedView = () => {
    if (elements.expandedView) {
        elements.expandedView.classList.remove("hidden");
    }
};

/**
 * Cierra la vista expandida inmersiva.
 */
export const closeExpandedView = () => {
    if (elements.expandedView) {
        elements.expandedView.classList.add("hidden");
    }
};

/**
 * Actualiza la información de la canción en la barra inferior, en la tarjeta "Sonando Ahora" y en la vista expandida.
 * @param {Object} song Datos de la canción activa.
 * @param {boolean} isFav Si la canción está en favoritas.
 */
export const updateCurrentSongUI = (song, isFav = false) => {
    if (!song) return;

    const coverUrl = song.cover || "./src/assets/img/note.jpg";

    // Barra inferior
    if (elements.songTitle) elements.songTitle.textContent = song.title;
    if (elements.songAuthor) elements.songAuthor.textContent = song.artist;
    if (elements.songImg) {
        elements.songImg.src = coverUrl;
        elements.songImg.onerror = () => { elements.songImg.src = "./src/assets/img/note.jpg"; };
    }

    // Tarjeta "Sonando Ahora" (Panel Derecho con fondo de portada)
    if (elements.currentSongBg) {
        elements.currentSongBg.src = coverUrl;
        elements.currentSongBg.onerror = () => { elements.currentSongBg.src = "./src/assets/img/note.jpg"; };
    }
    if (elements.currentSongTitle) elements.currentSongTitle.textContent = song.title;
    if (elements.currentSongArtist) elements.currentSongArtist.textContent = song.artist;
    if (elements.currentSongGenre) elements.currentSongGenre.textContent = song.genre || "Música";
    if (elements.currentSongImg) {
        elements.currentSongImg.src = coverUrl;
        elements.currentSongImg.onerror = () => { elements.currentSongImg.src = "./src/assets/img/note.jpg"; };
    }

    // Vista Expandida
    if (elements.expandedBg) {
        elements.expandedBg.src = coverUrl;
        elements.expandedBg.onerror = () => { elements.expandedBg.src = "./src/assets/img/note.jpg"; };
    }
    if (elements.expandedSongImg) {
        elements.expandedSongImg.src = coverUrl;
        elements.expandedSongImg.onerror = () => { elements.expandedSongImg.src = "./src/assets/img/note.jpg"; };
    }
    if (elements.expandedSongTitle) elements.expandedSongTitle.textContent = song.title;
    if (elements.expandedSongArtist) elements.expandedSongArtist.textContent = song.artist;
    if (elements.expandedSongGenre) elements.expandedSongGenre.textContent = song.genre || "Música";

    updateFavoriteCurrentBtn(isFav);
};

/**
 * Actualiza el icono de favorita de la tarjeta de canción actual.
 * @param {boolean} isFav True si es favorita.
 */
export const updateFavoriteCurrentBtn = (isFav) => {
    if (!elements.favoriteCurrentBtn) return;
    elements.favoriteCurrentBtn.innerHTML = isFav
        ? '<i class="fa-solid fa-heart text-red-500"></i>'
        : '<i class="fa-regular fa-heart text-zinc-500"></i>';
    elements.favoriteCurrentBtn.title = isFav ? "Quitar de favoritas" : "Añadir a favoritas";
};

/**
 * Resalta la canción activa tanto en la lista de reproducción como en favoritas.
 * @param {number} activeIndex Índice general de la canción sonando.
 */
export const updateActiveSongHighlight = (activeIndex) => {
    const updateList = (listEl) => {
        if (!listEl) return;
        const items = listEl.querySelectorAll("li[data-song-index]");
        items.forEach((item) => {
            const index = Number(item.dataset.songIndex);
            const titleEl = item.querySelector(".song-title") || item.querySelector("span");
            const trackNumEl = item.querySelector(".track-number");
            const isActive = index === activeIndex;

            if (titleEl) {
                if (isActive) {
                    titleEl.classList.remove("text-white");
                    titleEl.classList.add("text-pink-500");
                } else {
                    titleEl.classList.remove("text-pink-500");
                    titleEl.classList.add("text-white");
                }
            }

            if (trackNumEl) {
                if (isActive) {
                    trackNumEl.classList.remove("text-zinc-500");
                    trackNumEl.classList.add("text-pink-500", "font-bold");
                } else {
                    trackNumEl.classList.remove("text-pink-500", "font-bold");
                    trackNumEl.classList.add("text-zinc-500");
                }
            }

            if (isActive) {
                item.classList.add("bg-neutral-900", "border-l-4", "border-pink-600", "is-active");
                if (listEl === elements.musicList) {
                    item.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
                if (listEl === elements.favoritesList) {
                    item.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
            } else {
                item.classList.remove("bg-neutral-900", "border-l-4", "border-pink-600", "is-active");
            }
        });
    };

    updateList(elements.musicList);
    updateList(elements.favoritesList);
    updateActiveSongPlayback(false);
};

/**
 * Activa o detiene el ecualizador visual de la canción activa.
 * @param {boolean} isPlaying Indica si la canción está reproduciéndose.
 */
export const updateActiveSongPlayback = (isPlaying) => {
    const lists = [elements.musicList, elements.favoritesList];
    lists.forEach((listEl) => {
        if (!listEl) return;
        const indicators = listEl.querySelectorAll(".song-playing-indicator");
        indicators.forEach((indicator) => {
            const isActive = indicator.closest("li[data-song-index]")?.classList.contains("is-active");
            indicator.classList.toggle("is-playing", Boolean(isPlaying && isActive));
        });
    });
};

const createPlaybackIndicator = () => {
    const indicator = document.createElement("span");
    indicator.className = "song-playing-indicator";
    indicator.setAttribute("aria-label", "Reproduciendo");
    indicator.innerHTML = "<i></i><i></i><i></i><i></i>";
    return indicator;
};

/**
 * Renderiza la lista de reproducción principal.
 * @param {Array} songs Lista de canciones a mostrar.
 * @param {number} activeIndex Índice de la canción activa.
 * @param {Function} onSelectSong Callback al pulsar una canción.
 * @param {Function} onToggleFavorite Callback al pulsar el corazón.
 * @param {Function} isFavoriteFn Función que indica si una canción es favorita.
 */
export const renderPlaylist = (songs, activeIndex, onSelectSong, onToggleFavorite, isFavoriteFn) => {
    if (!elements.musicList) return;
    elements.musicList.innerHTML = "";

    if (elements.playlistCount) {
        elements.playlistCount.textContent = `${songs.length} canción${songs.length === 1 ? "" : "es"}`;
    }

    if (songs.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.className = "text-center py-8 text-zinc-500 text-sm";
        emptyLi.innerHTML = `<i class="fa-solid fa-compact-disc text-2xl mb-2 block text-zinc-600"></i>No se encontraron canciones`;
        elements.musicList.appendChild(emptyLi);
        return;
    }

    songs.forEach((song, idx) => {
        const originalIndex = song.originalIndex !== undefined ? song.originalIndex : songs.indexOf(song);
        const li = document.createElement("li");
        li.dataset.songIndex = originalIndex;
        li.className = "flex items-center justify-between gap-3 p-1.5 rounded-lg cursor-pointer transition duration-150 group hover:bg-neutral-900";

        const leftWrapper = document.createElement("div");
        leftWrapper.className = "flex items-center gap-2 min-w-0 flex-1";

        const trackNumber = document.createElement("span");
        trackNumber.className = "track-number w-5 text-xs font-mono text-zinc-500 text-center flex-shrink-0";
        trackNumber.textContent = idx + 1;

        const img = document.createElement("img");
        img.src = song.cover || "./src/assets/img/note.jpg";
        img.alt = song.title;
        img.className = "w-9 h-9 object-cover rounded-md flex-shrink-0";
        img.onerror = () => { img.src = "./src/assets/img/note.jpg"; };

        const info = document.createElement("div");
        info.className = "flex flex-col min-w-0";

        const title = document.createElement("span");
        title.className = "song-title text-sm font-semibold text-white truncate transition-colors group-hover:underline";
        title.textContent = song.title;

        const metaWrapper = document.createElement("div");
        metaWrapper.className = "flex items-center gap-2";

        const author = document.createElement("span");
        author.className = "text-xs text-zinc-400 truncate";
        author.textContent = song.artist;
        metaWrapper.appendChild(author);

        if (song.genre) {
            const genre = document.createElement("span");
            genre.className = "text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded";
            genre.textContent = song.genre;
            metaWrapper.appendChild(genre);
        }

        info.appendChild(title);
        info.appendChild(metaWrapper);

        leftWrapper.appendChild(trackNumber);
        leftWrapper.appendChild(img);
        leftWrapper.appendChild(info);
        const playbackIndicator = createPlaybackIndicator();

        const favBtn = document.createElement("button");
        favBtn.dataset.favoriteBtn = song.id;
        favBtn.className = "p-2 text-sm transition cursor-pointer shrink-0";
        const isFav = isFavoriteFn(song.id);
        favBtn.title = isFav ? "Quitar de favoritas" : "Añadir a favoritas";
        favBtn.innerHTML = isFav
            ? '<i class="fa-solid fa-heart text-red-500"></i>'
            : '<i class="fa-regular fa-heart text-zinc-600 group-hover:text-red-400"></i>';

        favBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            onToggleFavorite(song.id);
        });

        li.appendChild(leftWrapper);
        li.appendChild(playbackIndicator);
        li.appendChild(favBtn);

        li.addEventListener("click", () => {
            onSelectSong(originalIndex);
        });

        elements.musicList.appendChild(li);
    });

    updateActiveSongHighlight(activeIndex);
};

/**
 * Renderiza la lista lateral de favoritas.
 * @param {Array} favoriteSongs Lista de canciones favoritas.
 * @param {number} activeIndex Índice de la canción activa.
 * @param {Function} onSelectSong Callback al pulsar una canción.
 * @param {Function} onRemoveFavorite Callback para quitar de favoritas.
 */
export const renderFavorites = (
    favoriteSongs,
    activeIndex,
    onSelectSong,
    onRemoveFavorite
) => {
    if (!elements.favoritesList) return;
    elements.favoritesList.innerHTML = "";

    if (elements.favoritesCount) {
        elements.favoritesCount.textContent = favoriteSongs.length;
    }

    if (favoriteSongs.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.className = "text-center py-6 text-zinc-500 text-xs flex flex-col items-center gap-1";
        emptyLi.innerHTML = `
            <i class="fa-regular fa-heart text-xl text-zinc-600 mb-1"></i>
            <span>Aún no tienes favoritas</span>
            <span class="text-[10px] text-zinc-600">Pulsa el corazón de una canción</span>
        `;
        elements.favoritesList.appendChild(emptyLi);
        return;
    }

    favoriteSongs.forEach((song) => {
        const originalIndex = song.originalIndex !== undefined ? song.originalIndex : song.id - 1;
        const li = document.createElement("li");
        li.dataset.songIndex = originalIndex;
        li.className = "flex items-center justify-between gap-2 p-1 rounded-lg cursor-pointer hover:bg-zinc-800/60 transition group";

        const leftWrapper = document.createElement("div");
        leftWrapper.className = "flex items-center gap-2 min-w-0 flex-1";

        const img = document.createElement("img");
        img.src = song.cover || "./src/assets/img/note.jpg";
        img.alt = song.title;
        img.className = "w-9 h-9 object-cover rounded-md flex-shrink-0";
        img.onerror = () => { img.src = "./src/assets/img/note.jpg"; };

        const info = document.createElement("div");
        info.className = "flex flex-col min-w-0";

        const title = document.createElement("span");
        title.className = "song-title text-xs font-semibold text-white truncate transition-colors";
        title.textContent = song.title;

        const author = document.createElement("span");
        author.className = "text-[11px] text-zinc-400 truncate";
        author.textContent = song.artist;

        info.appendChild(title);
        info.appendChild(author);

        leftWrapper.appendChild(img);
        leftWrapper.appendChild(info);
        const playbackIndicator = createPlaybackIndicator();

        const removeBtn = document.createElement("button");
        removeBtn.className = "text-zinc-600 hover:text-red-400 p-1.5 text-xs transition cursor-pointer";
        removeBtn.title = "Quitar de favoritas";
        removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';

        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            onRemoveFavorite(song.id);
        });

        li.appendChild(leftWrapper);
        li.appendChild(playbackIndicator);
        li.appendChild(removeBtn);

        li.addEventListener("click", () => {
            onSelectSong(originalIndex);
        });

        elements.favoritesList.appendChild(li);
    });

    updateActiveSongHighlight(activeIndex);
};

/**
 * Actualiza la barra de progreso y las etiquetas de tiempo.
 * @param {number} currentTime Tiempo actual en segundos.
 * @param {number} duration Duración total en segundos.
 */
export const updateProgressBar = (currentTime, duration) => {
    if (elements.progressBar) {
        elements.progressBar.max = duration || 0;
        elements.progressBar.value = currentTime || 0;
    }
    if (elements.currentTime) {
        elements.currentTime.textContent = formatTime(currentTime);
    }
    if (elements.totalTime) {
        elements.totalTime.textContent = formatTime(duration);
    }
};

/**
 * Actualiza el icono del botón de reproducción/pausa.
 * @param {boolean} isPlaying True si se está reproduciendo.
 */
export const updatePlayBtn = (isPlaying) => {
    if (!elements.playBtn) return;
    elements.playBtn.innerHTML = isPlaying
        ? '<i class="fa-sharp fa-solid fa-circle-pause"></i>'
        : '<i class="fa-sharp fa-solid fa-circle-play"></i>';
};

/**
 * Actualiza el aspecto de un botón de opción (Repeat o Shuffle).
 * @param {HTMLElement} button Elemento botón.
 * @param {boolean} isActive Estado activo.
 */
export const toggleButtonVisual = (button, isActive) => {
    if (!button) return;
    if (isActive) {
        button.classList.remove("text-zinc-400");
        button.classList.add("text-pink-600");
    } else {
        button.classList.remove("text-pink-600");
        button.classList.add("text-zinc-400");
    }
};

/**
 * Actualiza el icono de silencio y el valor del volumen.
 * @param {boolean} isMuted Si está silenciado.
 * @param {number} volume Valor de volumen (0 a 1).
 */
export const updateVolumeUI = (isMuted, volume) => {
    if (elements.muteBtn) {
        const icon = elements.muteBtn.querySelector("i");
        if (icon) {
            icon.className = isMuted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
        }
    }
    if (elements.volumeSlider) {
        elements.volumeSlider.disabled = isMuted;
    }
    if (elements.volumeValue) {
        elements.volumeValue.textContent = Math.round(volume * 10);
    }
};

/**
 * Alterna el modo de pantalla completa en el navegador.
 */
export const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    }
};

/**
 * Sincroniza el icono de pantalla completa según el estado actual del navegador.
 */
export const syncFullscreenIcon = () => {
    if (!elements.fullscreenBtn) return;
    const icon = elements.fullscreenBtn.querySelector("i");
    if (icon) {
        icon.className = document.fullscreenElement ? "fa-solid fa-compress" : "fa-solid fa-expand";
    }
};
