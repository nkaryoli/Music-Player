// Elementos del DOM
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
const muteBtn = document.querySelector("#mute-btn");
const volumeSlider = document.querySelector("#volume");
const volumeValueEl = document.querySelector("#volume-value");

let songs;
let currentSong = 0;
let sound = null;

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const updateSongInfo = () => {
    const song = songs[currentSong];

    songTitle.textContent = song.title;
    songAuthor.textContent = song.artist;

    sound = new Howl({
        src: [song.src],
        html5: true,
        volume: 0.5,
        onload: () => {
            const duration = sound.duration();

            progressBar.max = duration;
            totalTimeEl.textContent = formatTime(duration);
        },
        onplay: () => {
            updateProgress();
        },
        onend: () => {
            progressBar.value = 0;
            currentTimeEl.textContent = "0:00";
            playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-play"></i>';
        },
    });
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

const changeSong = (newIndex) => {
    if (!songs || songs.length === 0) return;

    if (newIndex < 0 || newIndex >= songs.length) return;

    if (sound) {
        sound.stop();
        sound.unload();
    }

    currentSong = newIndex;
    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";

    updateSongInfo();
    playSong();
};

const fetchMusic = async () => {
    try {
        const res = await fetch("/src/data/music.json");
        songs = await res.json();
        updateSongInfo();
        console.log("Canciones cargadas:", songs);
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
};

playBtn.addEventListener("click", () => playPauseSong());

nextBtn.addEventListener("click", () => {
    if (!songs || currentSong >= songs.length - 1) return;

    changeSong(currentSong + 1);
});

previousBtn.addEventListener("click", () => {
    if (!songs || currentSong <= 0) return;

    changeSong(currentSong - 1);
    console.log(currentSong);
});

progressBar.addEventListener("input", () => {
    if (!sound) return;

    const newTime = Number(progressBar.value);

    sound.seek(newTime);
    currentTimeEl.textContent = formatTime(newTime);
});

fetchMusic();
