// ==========================================
// ELEMENTOS DEL DOM
// ==========================================

// Listas y contadores
const musicList = document.querySelector("#list");
const favoritesList = document.querySelector("#favorites-list");
const playlistCountEl = document.querySelector("#playlist-count");
const favoritesCountEl = document.querySelector("#favorites-count");

// Búsqueda y navegación
const searchInput = document.querySelector("#search-input");
const homeBtn = document.querySelector("#home-btn");

// Tiempos e información de canción en barra inferior
const currentTimeEl = document.querySelector("#current-time");
const progressBar = document.querySelector("#progress-bar");
const totalTimeEl = document.querySelector("#total-time");
const songImg = document.querySelector("#song-img");
const songTitle = document.querySelector("#song-title");
const songAuthor = document.querySelector("#song-author");

// Controles de reproducción
const controls = document.querySelector("#controls");
const shuffleBtn = document.querySelector("#shuffle");
const previousBtn = document.querySelector("#previous");
const playBtn = document.querySelector("#play");
const nextBtn = document.querySelector("#next");
const repeatBtn = document.querySelector("#repeat");

// Controles de volumen y pantalla completa
const volumeControls = document.querySelector("#volume-controls");
const muteBtn = document.querySelector("#mute-btn");
const volumeSlider = document.querySelector("#volume");
const volumeValueEl = document.querySelector("#volume-value");
const fullscreenBtn = document.querySelector("#fullscreen-btn");

// Panel derecho (Sonando Ahora)
const currentSongImg = document.querySelector("#current-song-img");
const currentSongTitle = document.querySelector("#current-song-title");
const currentSongArtist = document.querySelector("#current-song-artist");
const currentSongGenre = document.querySelector("#current-song-genre");
const favoriteCurrentBtn = document.querySelector("#favorite-current-btn");

// Ecualizador y Espectro en Vivo
const eqBass = document.querySelector("#eq-bass");
const eqMid = document.querySelector("#eq-mid");
const eqTreble = document.querySelector("#eq-treble");
const bassVal = document.querySelector("#bass-val");
const midVal = document.querySelector("#mid-val");
const trebleVal = document.querySelector("#treble-val");
const resetEqBtn = document.querySelector("#reset-eq");

// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================

let songs = [];
let currentSong = 0;
let sound = null;
let isOnRepeat = false;
let isOnShuffle = false;
let isMuted = false;
let isDraggingProgress = false;
let searchQuery = "";

// Cargar canciones favoritas desde localStorage
let favorites = [];
try {
    favorites = JSON.parse(localStorage.getItem("music_player_favorites")) || [];
} catch (e) {
    favorites = [];
}

// Inicializar volumen global en Howler
const initialVol = Number(volumeSlider ? volumeSlider.value : 0.2);
Howler.volume(initialVol);
if (volumeValueEl) {
    volumeValueEl.textContent = Math.round(initialVol * 10);
}

// ==========================================
// UTILIDADES
// ==========================================

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const saveFavorites = () => {
    try {
        localStorage.setItem("music_player_favorites", JSON.stringify(favorites));
    } catch (e) {
        console.error("No se pudo guardar en localStorage:", e);
    }
};

const isSongFavorite = (songId) => favorites.includes(songId);

const toggleFavorite = (songId) => {
    if (isSongFavorite(songId)) {
        favorites = favorites.filter((id) => id !== songId);
    } else {
        favorites.push(songId);
    }
    saveFavorites();
    updateFavoriteButtons();
    renderFavorites();
};

const updateFavoriteButtons = () => {
    if (!songs || songs.length === 0) return;
    const current = songs[currentSong];
    if (!current) return;

    if (favoriteCurrentBtn) {
        const isFav = isSongFavorite(current.id);
        favoriteCurrentBtn.innerHTML = isFav
            ? '<i class="fa-solid fa-heart text-red-500"></i>'
            : '<i class="fa-regular fa-heart text-zinc-500"></i>';
        favoriteCurrentBtn.title = isFav ? "Quitar de favoritas" : "Añadir a favoritas";
    }

    // Actualizar iconos de corazón en la lista de reproducción
    if (musicList) {
        const favIcons = musicList.querySelectorAll("[data-favorite-btn]");
        favIcons.forEach((btn) => {
            const id = Number(btn.dataset.favoriteBtn);
            const isFav = isSongFavorite(id);
            btn.innerHTML = isFav
                ? '<i class="fa-solid fa-heart text-red-500"></i>'
                : '<i class="fa-regular fa-heart text-zinc-600 hover:text-red-400"></i>';
        });
    }
};

// ==========================================
// REPRODUCCIÓN Y GESTIÓN DE AUDIO
// ==========================================

const highlightActiveSong = () => {
    if (!musicList) return;
    const songItems = musicList.querySelectorAll("li[data-song-index]");
    songItems.forEach((item) => {
        const index = Number(item.dataset.songIndex);
        if (index === currentSong) {
            item.classList.add("bg-zinc-800", "border-l-4", "border-blue-500");
            item.classList.remove("hover:bg-zinc-800/60");
        } else {
            item.classList.remove("bg-zinc-800", "border-l-4", "border-blue-500");
            item.classList.add("hover:bg-zinc-800/60");
        }
    });

    if (favoritesList) {
        const favItems = favoritesList.querySelectorAll("li[data-song-index]");
        favItems.forEach((item) => {
            const index = Number(item.dataset.songIndex);
            if (index === currentSong) {
                item.classList.add("bg-zinc-800", "border-l-4", "border-red-500");
            } else {
                item.classList.remove("bg-zinc-800", "border-l-4", "border-red-500");
            }
        });
    }
};

const updateSongInfo = () => {
    if (!songs || songs.length === 0) return;
    const song = songs[currentSong];
    if (!song) return;

    // Actualizar barra inferior
    if (songTitle) songTitle.textContent = song.title;
    if (songAuthor) songAuthor.textContent = song.artist;
    if (songImg) {
        songImg.src = song.cover || "./src/assets/img/note.jpg";
        songImg.onerror = () => {
            songImg.src = "./src/assets/img/note.jpg";
        };
    }

    // Actualizar panel lateral "Sonando Ahora"
    if (currentSongTitle) currentSongTitle.textContent = song.title;
    if (currentSongArtist) currentSongArtist.textContent = song.artist;
    if (currentSongGenre) currentSongGenre.textContent = song.genre || "Música";
    if (currentSongImg) {
        currentSongImg.src = song.cover || "./src/assets/img/note.jpg";
        currentSongImg.onerror = () => {
            currentSongImg.src = "./src/assets/img/note.jpg";
        };
    }

    updateFavoriteButtons();
    highlightActiveSong();

    // Crear instancia de Howler (el volumen maestro lo controla Howler.volume)
    sound = new Howl({
        src: [song.src],
        html5: true,
        onload: () => {
            const duration = sound.duration() || 0;
            progressBar.max = duration;
            totalTimeEl.textContent = formatTime(duration);
        },
        onloaderror: (_id, err) => {
            console.error("Error al cargar pista de audio:", song.src, err);
        },
        onplay: () => {
            playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-pause"></i>';
            requestAnimationFrame(updateProgress);
        },
        onpause: () => {
            playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-play"></i>';
        },
        onstop: () => {
            playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-play"></i>';
        },
        onend: () => {
            onFinishSong();
        },
    });
};

const getRandomSongIndex = () => {
    if (!songs || songs.length <= 1) return 0;
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === currentSong);
    return randomIndex;
};

const onFinishSong = () => {
    currentTimeEl.textContent = "0:00";
    progressBar.value = 0;

    if (isOnRepeat) {
        changeSong(currentSong, true);
    } else if (isOnShuffle) {
        const nextIndex = getRandomSongIndex();
        changeSong(nextIndex, true);
    } else if (currentSong === songs.length - 1) {
        changeSong(0, false);
        pauseSong();
    } else {
        changeSong(currentSong + 1, true);
    }
};

const updateProgress = () => {
    if (!sound || !sound.playing() || isDraggingProgress) return;

    const currentTime = typeof sound.seek() === "number" ? sound.seek() : 0;

    progressBar.value = currentTime;
    currentTimeEl.textContent = formatTime(currentTime);

    requestAnimationFrame(updateProgress);
};

const playPauseSong = () => {
    if (!sound) {
        if (songs && songs.length > 0) {
            changeSong(currentSong, true);
        }
        return;
    }

    if (sound.playing()) {
        pauseSong();
    } else {
        playSong();
    }
};

const pauseSong = () => {
    if (sound) sound.pause();
    playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-play"></i>';
};

const playSong = () => {
    if (sound) {
        sound.play();
        playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-pause"></i>';
    }
};

const changeSong = (newIndex, autoPlay = null) => {
    if (!songs || songs.length === 0) return;
    if (newIndex < 0 || newIndex >= songs.length) return;

    const wasPlaying = sound && sound.playing();
    const shouldPlay = autoPlay !== null ? autoPlay : wasPlaying;

    if (sound) {
        sound.stop();
        sound.unload();
        sound = null;
    }

    currentSong = newIndex;
    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";

    updateSongInfo();

    if (shouldPlay) {
        playSong();
    }
};

const handleSongSelection = (targetIndex) => {
    if (currentSong === targetIndex && sound) {
        playPauseSong();
    } else {
        changeSong(targetIndex, true);
    }
};

// ==========================================
// RENDERIZADO DE LA INTERFAZ
// ==========================================

const renderPlaylist = () => {
    if (!musicList || !songs) return;

    musicList.innerHTML = "";

    const filtered = songs
        .map((song, originalIndex) => ({ ...song, originalIndex }))
        .filter((song) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                song.title.toLowerCase().includes(q) ||
                song.artist.toLowerCase().includes(q) ||
                (song.genre && song.genre.toLowerCase().includes(q))
            );
        });

    if (playlistCountEl) {
        playlistCountEl.textContent = `${filtered.length} canción${filtered.length === 1 ? "" : "es"}`;
    }

    if (filtered.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.className = "text-center py-8 text-zinc-500 text-sm";
        emptyLi.innerHTML = `<i class="fa-solid fa-compact-disc text-2xl mb-2 block text-zinc-600"></i>No se encontraron canciones para "${searchQuery}"`;
        musicList.appendChild(emptyLi);
        return;
    }

    filtered.forEach((song) => {
        const i = song.originalIndex;
        const li = document.createElement("li");
        li.dataset.songIndex = i;
        li.className =
            "flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition duration-150 group";

        const leftWrapper = document.createElement("div");
        leftWrapper.className = "flex items-center gap-3 min-w-0 flex-1";

        const img = document.createElement("img");
        img.src = song.cover || "./src/assets/img/note.jpg";
        img.alt = song.title;
        img.className = "w-11 h-11 object-cover rounded-md flex-shrink-0";
        img.onerror = () => {
            img.src = "./src/assets/img/note.jpg";
        };

        const info = document.createElement("div");
        info.className = "flex flex-col min-w-0";

        const title = document.createElement("span");
        title.className = "text-sm font-semibold text-white truncate";
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

        leftWrapper.appendChild(img);
        leftWrapper.appendChild(info);

        // Botón de favorita
        const favBtn = document.createElement("button");
        favBtn.dataset.favoriteBtn = song.id;
        favBtn.className = "p-2 text-sm transition cursor-pointer shrink-0";
        favBtn.title = isSongFavorite(song.id) ? "Quitar de favoritas" : "Añadir a favoritas";
        favBtn.innerHTML = isSongFavorite(song.id)
            ? '<i class="fa-solid fa-heart text-red-500"></i>'
            : '<i class="fa-regular fa-heart text-zinc-600 group-hover:text-red-400"></i>';

        favBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
        });

        li.appendChild(leftWrapper);
        li.appendChild(favBtn);

        li.addEventListener("click", () => {
            handleSongSelection(i);
        });

        musicList.appendChild(li);
    });

    highlightActiveSong();
};

const renderFavorites = () => {
    if (!favoritesList || !songs) return;

    favoritesList.innerHTML = "";

    const favoriteSongs = songs
        .map((song, originalIndex) => ({ ...song, originalIndex }))
        .filter((song) => isSongFavorite(song.id));

    if (favoritesCountEl) {
        favoritesCountEl.textContent = favoriteSongs.length;
    }

    if (favoriteSongs.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.className = "text-center py-6 text-zinc-500 text-xs flex flex-col items-center gap-1";
        emptyLi.innerHTML = `
            <i class="fa-regular fa-heart text-xl text-zinc-600 mb-1"></i>
            <span>Aún no tienes favoritas</span>
            <span class="text-[10px] text-zinc-600">Pulsa el corazón de una canción</span>
        `;
        favoritesList.appendChild(emptyLi);
        return;
    }

    favoriteSongs.forEach((song) => {
        const li = document.createElement("li");
        li.dataset.songIndex = song.originalIndex;
        li.className =
            "flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer hover:bg-zinc-800/60 transition group";

        const leftWrapper = document.createElement("div");
        leftWrapper.className = "flex items-center gap-2.5 min-w-0 flex-1";

        const img = document.createElement("img");
        img.src = song.cover || "./src/assets/img/note.jpg";
        img.alt = song.title;
        img.className = "w-9 h-9 object-cover rounded-md flex-shrink-0";
        img.onerror = () => {
            img.src = "./src/assets/img/note.jpg";
        };

        const info = document.createElement("div");
        info.className = "flex flex-col min-w-0";

        const title = document.createElement("span");
        title.className = "text-xs font-semibold text-white truncate";
        title.textContent = song.title;

        const author = document.createElement("span");
        author.className = "text-[11px] text-zinc-400 truncate";
        author.textContent = song.artist;

        info.appendChild(title);
        info.appendChild(author);

        leftWrapper.appendChild(img);
        leftWrapper.appendChild(info);

        const removeBtn = document.createElement("button");
        removeBtn.className = "text-zinc-600 hover:text-red-400 p-1.5 text-xs transition cursor-pointer";
        removeBtn.title = "Quitar de favoritas";
        removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';

        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
        });

        li.appendChild(leftWrapper);
        li.appendChild(removeBtn);

        li.addEventListener("click", () => {
            handleSongSelection(song.originalIndex);
        });

        favoritesList.appendChild(li);
    });

    highlightActiveSong();
};

const fetchMusic = async () => {
    try {
        let res;
        try {
            res = await fetch("./src/data/music.json");
            if (!res.ok) throw new Error();
        } catch {
            res = await fetch("/src/data/music.json");
        }
        songs = await res.json();
        updateSongInfo();
        renderPlaylist();
        renderFavorites();
    } catch (error) {
        console.error("Error al cargar music.json:", error);
    }
};

// ==========================================
// EVENT LISTENERS DE CONTROLES
// ==========================================

const toggleButtonState = (button, isActive) => {
    if (isActive) {
        button.classList.remove("text-zinc-400", "text-gray-400");
        button.classList.add("text-blue-400");
    } else {
        button.classList.remove("text-blue-400", "text-white", "text-gray-100");
        button.classList.add("text-zinc-400");
    }
};

playBtn.addEventListener("click", () => playPauseSong());

nextBtn.addEventListener("click", () => {
    if (!songs || songs.length === 0) return;
    const wasPlaying = sound && sound.playing();

    if (isOnShuffle) {
        const nextIndex = getRandomSongIndex();
        changeSong(nextIndex, wasPlaying);
    } else if (currentSong < songs.length - 1) {
        changeSong(currentSong + 1, wasPlaying);
    } else {
        changeSong(0, wasPlaying);
    }
});

previousBtn.addEventListener("click", () => {
    if (!songs || songs.length === 0) return;
    const wasPlaying = sound && sound.playing();

    // Si la pista lleva más de 3 segundos, reiniciar al principio
    const currentTime = sound && typeof sound.seek() === "number" ? sound.seek() : 0;
    if (currentTime > 3) {
        sound.seek(0);
        progressBar.value = 0;
        currentTimeEl.textContent = "0:00";
        return;
    }

    if (isOnShuffle) {
        const prevIndex = getRandomSongIndex();
        changeSong(prevIndex, wasPlaying);
    } else if (currentSong > 0) {
        changeSong(currentSong - 1, wasPlaying);
    } else {
        changeSong(songs.length - 1, wasPlaying);
    }
});

// Arrastre suave de la barra de progreso sin tirones
progressBar.addEventListener("input", () => {
    isDraggingProgress = true;
    const newTime = Number(progressBar.value);
    currentTimeEl.textContent = formatTime(newTime);
});

progressBar.addEventListener("change", () => {
    if (sound) {
        const newTime = Number(progressBar.value);
        sound.seek(newTime);
    }
    isDraggingProgress = false;
});

// Control de volumen sincronizado
volumeSlider.addEventListener("input", () => {
    const newVolume = Number(volumeSlider.value);
    volumeValueEl.textContent = Math.round(newVolume * 10);

    if (isMuted && newVolume > 0) {
        isMuted = false;
        const icon = muteBtn.querySelector("i");
        if (icon) icon.className = "fa-solid fa-volume-high";
        volumeSlider.disabled = false;
    }

    Howler.volume(newVolume);
});

repeatBtn.addEventListener("click", () => {
    isOnRepeat = !isOnRepeat;
    toggleButtonState(repeatBtn, isOnRepeat);
});

shuffleBtn.addEventListener("click", () => {
    isOnShuffle = !isOnShuffle;
    toggleButtonState(shuffleBtn, isOnShuffle);
});

// Botón de silenciar (apuntando al botón completo, no solo al <i>)
muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    const icon = muteBtn.querySelector("i");

    if (isMuted) {
        if (icon) icon.className = "fa-solid fa-volume-xmark";
        Howler.volume(0);
        volumeSlider.disabled = true;
    } else {
        if (icon) icon.className = "fa-solid fa-volume-high";
        Howler.volume(Number(volumeSlider.value));
        volumeSlider.disabled = false;
    }
});

// Botón de favorita en panel de canción actual
if (favoriteCurrentBtn) {
    favoriteCurrentBtn.addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        const current = songs[currentSong];
        if (current) {
            toggleFavorite(current.id);
        }
    });
}

// Búsqueda en vivo
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        renderPlaylist();
    });
}

if (homeBtn) {
    homeBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        searchQuery = "";
        renderPlaylist();
    });
}

// Pantalla completa
if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        }
    });

    document.addEventListener("fullscreenchange", () => {
        const icon = fullscreenBtn.querySelector("i");
        if (icon) {
            icon.className = document.fullscreenElement ? "fa-solid fa-compress" : "fa-solid fa-expand";
        }
    });
}

// Atajos de teclado útiles
document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;

    if (e.code === "Space") {
        e.preventDefault();
        playPauseSong();
    } else if (e.code === "ArrowRight") {
        if (sound) {
            const cur = typeof sound.seek() === "number" ? sound.seek() : 0;
            const dur = sound.duration() || 0;
            sound.seek(Math.min(dur, cur + 5));
        }
    } else if (e.code === "ArrowLeft") {
        if (sound) {
            const cur = typeof sound.seek() === "number" ? sound.seek() : 0;
            sound.seek(Math.max(0, cur - 5));
        }
    }
});

// ==========================================
// ECUALIZADOR Y ESPECTRO EN VIVO
// ==========================================

const setupEqualizer = () => {
    if (!eqBass) return;

    const updateLabel = (input, label) => {
        const val = Number(input.value);
        label.textContent = `${val > 0 ? "+" : ""}${val} dB`;
    };

    eqBass.addEventListener("input", () => updateLabel(eqBass, bassVal));
    eqMid.addEventListener("input", () => updateLabel(eqMid, midVal));
    eqTreble.addEventListener("input", () => updateLabel(eqTreble, trebleVal));

    if (resetEqBtn) {
        resetEqBtn.addEventListener("click", () => {
            eqBass.value = 0;
            eqMid.value = 0;
            eqTreble.value = 0;
            bassVal.textContent = "0 dB";
            midVal.textContent = "0 dB";
            trebleVal.textContent = "0 dB";
        });
    }
};

const initSpectrumVisualizer = () => {
    const canvas = document.querySelector("#spectrum-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const numBars = 32;
    const baseProfile = [
        0.85, 0.76, 0.82, 0.88, 0.70, 0.55, 0.50, 0.48, 
        0.52, 0.54, 0.58, 0.65, 0.60, 0.52, 0.56, 0.48, 
        0.42, 0.44, 0.45, 0.42, 0.40, 0.38, 0.36, 0.38, 
        0.35, 0.33, 0.31, 0.30, 0.32, 0.30, 0.28, 0.27
    ];
    const currentHeights = [...baseProfile];

    const render = () => {
        const width = canvas.clientWidth || 300;
        const height = canvas.clientHeight || 100;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        ctx.clearRect(0, 0, width, height);

        const isPlaying = sound && sound.playing();
        const barWidth = Math.max(3, (width / numBars) * 0.65);
        const gap = Math.max(1, (width - numBars * barWidth) / (numBars - 1));

        for (let i = 0; i < numBars; i++) {
            let target;
            if (isPlaying) {
                const time = Date.now() * 0.007;
                const wave1 = Math.sin(time + i * 0.4) * 0.22;
                const wave2 = Math.cos(time * 0.7 - i * 0.25) * 0.14;
                const jitter = (Math.random() - 0.5) * 0.06;

                const bassBoost = Number(eqBass?.value || 0) / 24;
                const midBoost = Number(eqMid?.value || 0) / 24;
                const trebleBoost = Number(eqTreble?.value || 0) / 24;

                let eqMod = 0;
                if (i < 10) eqMod = bassBoost;
                else if (i < 22) eqMod = midBoost;
                else eqMod = trebleBoost;

                target = Math.min(0.96, Math.max(0.12, baseProfile[i] + wave1 + wave2 + jitter + eqMod));
            } else {
                target = baseProfile[i] * 0.88;
            }

            currentHeights[i] += (target - currentHeights[i]) * 0.22;
            const barH = Math.max(3, currentHeights[i] * (height - 4));
            const x = i * (barWidth + gap);
            const y = height - barH;

            const grad = ctx.createLinearGradient(0, height, 0, y);
            grad.addColorStop(0, "#7c3aed");
            grad.addColorStop(0.5, "#a855f7");
            grad.addColorStop(1, "#c084fc");

            ctx.fillStyle = grad;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x, y, barWidth, barH, [3, 3, 0, 0]);
            } else {
                ctx.rect(x, y, barWidth, barH);
            }
            ctx.fill();
        }

        requestAnimationFrame(render);
    };

    render();
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

setupEqualizer();
initSpectrumVisualizer();
fetchMusic();
