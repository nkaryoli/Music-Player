// Elementos del DOM
const currentTimeEl = document.querySelector('#current-time');
const progressBar = document.querySelector('#progress-bar');
const totalTimeEl = document.querySelector('#total-time');
const songImg = document.querySelector('#song-img');
const songTitle = document.querySelector('#song-title');
const songAuthor = document.querySelector('#song-author');

// Controles de reproducción
const controls = document.querySelector('#controls');
const shuffleBtn = document.querySelector('#shuffle');
const previousBtn = document.querySelector('#previous');
const playBtn = document.querySelector('#play');
const nextBtn = document.querySelector('#next');
const repeatBtn = document.querySelector('#repeat');

// Controles de volumen
const volumeControls = document.querySelector('#volume-controls');
const muteBtn = document.querySelector('#mute-btn');
const volumeSlider = document.querySelector('#volume');
const volumeValueEl = document.querySelector('#volume-value');

let songs;
let currentSong = 0;
let sound = null;

const fetchMusic = async () => {
    try {
        const res = await fetch('/src/data/music.json');
        songs = await res.json();
        console.log('Canciones cargadas:', songs);
    } catch (error) {
        console.error('Error al cargar el JSON:', error);
    }
};

// https://freetouse.com/music/category/summer

playBtn.addEventListener('click', () => {
    if (!songs || songs.length === 0) return;

    if (!sound) {
        sound = new Howl({
            src: [songs[currentSong].src],
            html5: true,
            volume: 0.5,
            onend: () => {
                playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-play"></i>';
            }
        });
    }

    if (sound.playing()) {
        sound.pause();
        playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-play"></i>';
    } else {
        sound.play();
        playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-pause"></i>';
    }
});


nextBtn.addEventListener('click', () => {
    if (currentSong == songs.length) return;

    currentSong += 1;

})

previousBtn.addEventListener('click', () => {
    if (currentSong == 0) return;

    currentSong -= 1;
    
})

fetchMusic();