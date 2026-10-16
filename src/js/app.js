// Elementos del DOM

const musicList = document.querySelector("#list");

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

// Controles de volumen
const volumeControls = document.querySelector("#volume-controls");
const muteBtn = document.querySelector("#mute-btn i");
const volumeSlider = document.querySelector("#volume");
const volumeValueEl = document.querySelector("#volume-value");

// Panel derecho (Sonando Ahora)
const currentSongImg = document.querySelector("#current-song-img");
const currentSongTitle = document.querySelector("#current-song-title");
const currentSongArtist = document.querySelector("#current-song-artist");
const currentSongGenre = document.querySelector("#current-song-genre");

// Ecualizador y Espectro en Vivo
const eqBass = document.querySelector("#eq-bass");
const eqMid = document.querySelector("#eq-mid");
const eqTreble = document.querySelector("#eq-treble");
const bassVal = document.querySelector("#bass-val");
const midVal = document.querySelector("#mid-val");
const trebleVal = document.querySelector("#treble-val");
const resetEqBtn = document.querySelector("#reset-eq");

let songs;
let currentSong = 0;
let sound = null;
let isOnRepeat = false;
let isOnShuffle = false;
let isMuted = false;

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const highlightActiveSong = () => {
    if (!musicList) return;
    const songItems = musicList.querySelectorAll("li");
    songItems.forEach((item, index) => {
        if (index === currentSong) {
            item.classList.add("bg-gray-700", "border-l-4", "border-blue-400");
        } else {
            item.classList.remove("bg-gray-700", "border-l-4", "border-blue-400");
        }
    });
};

const updateSongInfo = () => {
    if (!songs || songs.length === 0) return;
    const song = songs[currentSong];
    if (!song) return;

    songTitle.textContent = song.title;
    songAuthor.textContent = song.artist;
    if (songImg) {
        songImg.src = song.cover || "./src/assets/img/note.jpg";
        songImg.onerror = () => {
            songImg.src = "./src/assets/img/note.jpg";
        };
    }

    if (currentSongTitle) currentSongTitle.textContent = song.title;
    if (currentSongArtist) currentSongArtist.textContent = song.artist;
    if (currentSongGenre) currentSongGenre.textContent = song.genre || "Música";
    if (currentSongImg) {
        currentSongImg.src = song.cover || "./src/assets/img/note.jpg";
        currentSongImg.onerror = () => {
            currentSongImg.src = "./src/assets/img/note.jpg";
        };
    }

    highlightActiveSong();

    sound = new Howl({
        src: [song.src],
        html5: true,
        volume: volumeSlider.value,
        onload: () => {
            const duration = sound.duration();

            progressBar.max = duration;
            totalTimeEl.textContent = formatTime(duration);
        },
        onplay: () => {
            updateProgress();
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
    if (!sound || !sound.playing()) return;

    const currentTime = sound.seek();

    progressBar.value = currentTime;
    currentTimeEl.textContent = formatTime(currentTime);

    requestAnimationFrame(updateProgress);
};

const playPauseSong = () => {
    if (!sound) return;

    if (sound.playing()) {
        pauseSong();
    } else {
        playSong();
    }
};

const pauseSong = () => {
    sound.pause();
    playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-play"></i>';
};

const playSong = () => {
    sound.play();
    playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-pause"></i>';
};

const changeSong = (newIndex, autoPlay = null) => {
    if (!songs || songs.length === 0) return;

    if (newIndex < 0 || newIndex >= songs.length) return;

    const wasPlaying = sound && sound.playing();
    const shouldPlay = autoPlay !== null ? autoPlay : wasPlaying;

    if (sound) {
        sound.stop();
        sound.unload();
    }

    currentSong = newIndex;
    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";

    updateSongInfo();

    if (shouldPlay) {
        playSong();
    }
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
        console.log("Canciones cargadas:", songs);
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
};

const loadSongsList = async () => {
    await fetchMusic();

    if (!songs || !musicList) return;

    musicList.innerHTML = "";

    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];

        const li = document.createElement("li");
        li.className = "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-150";

        const img = document.createElement("img");
        img.src = song.cover || "./src/assets/img/note.jpg";
        img.alt = song.title;
        img.className = "w-12 h-12 object-cover rounded-md flex-shrink-0";
        img.onerror = () => {
            img.src = "./src/assets/img/note.jpg";
        };

        const info = document.createElement("div");
        info.className = "flex flex-col min-w-0";

        const title = document.createElement("span");
        title.className = "text-sm font-semibold text-white truncate";
        title.textContent = song.title;

        const author = document.createElement("span");
        author.className = "text-xs text-gray-400 truncate";
        author.textContent = song.artist;

        info.appendChild(title);
        info.appendChild(author);

        li.appendChild(img);
        li.appendChild(info);

        li.addEventListener("click", () => {
            if (currentSong === i && sound && sound.playing()) {
                playPauseSong();
            } else {
                changeSong(i);
                playSong();
            }
        });

        musicList.appendChild(li);
    }

    highlightActiveSong();
};

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
    if (sound && sound.seek() > 3) {
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

progressBar.addEventListener("input", () => {
    if (!sound) return;

    const newTime = Number(progressBar.value);

    sound.seek(newTime);
    currentTimeEl.textContent = formatTime(newTime);
});

volumeSlider.addEventListener("input", () => {
    if (!sound) return;

    const newVolume = Number(volumeSlider.value);

    console.log(newVolume);
    volumeValueEl.textContent = newVolume * 10;
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

muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;

    if (isMuted) {
        muteBtn.classList.replace("fa-volume-high", "fa-volume-xmark");
        Howler.volume(0);
        volumeSlider.disabled = true;
    } else {
        muteBtn.classList.replace("fa-volume-xmark", "fa-volume-high");
        Howler.volume(Number(volumeSlider.value));
        volumeSlider.disabled = false;
    }
});

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
    // Perfil base de barras inspirado en la imagen de referencia
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

                // Modulación según los valores del ecualizador
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

            // Degradado violeta/púrpura idéntico al diseño
            const grad = ctx.createLinearGradient(0, height, 0, y);
            grad.addColorStop(0, "#7c3aed"); // Púrpura base
            grad.addColorStop(0.5, "#a855f7"); // Púrpura medio
            grad.addColorStop(1, "#c084fc"); // Violeta claro en la punta

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

setupEqualizer();
initSpectrumVisualizer();
loadSongsList();
