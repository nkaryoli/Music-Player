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

const sound = new Howl({
    src: ['src/music/marvrix-yellow-sorrows-255741.mp3'],
    html5: true,
    volume: 0.5,
});

playBtn.addEventListener('click', () => {
    if (sound.playing()) {
        sound.pause();
        playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-play"></i>';
    } else {
        sound.play();
        playBtn.innerHTML = '<i class="fa-sharp fa-solid fa-circle-pause"></i>';
    }
});