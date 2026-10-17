/**
 * Módulo: player.js
 * Descripción: Encapsula el motor de audio basado en Howler.js. Controla la reproducción, pausa, navegación temporal, volumen maestro, silenciamiento y modos aleatorio y repetición.
 */

let sound = null;
let currentSongData = null;
let isOnRepeat = false;
let isOnShuffle = false;
let isMuted = false;
let isDraggingProgress = false;
let callbacks = {
    onLoad: () => {},
    onPlay: () => {},
    onPause: () => {},
    onEnd: () => {},
    onProgress: () => {}
};

/**
 * Inicializa el reproductor registrando los callbacks de eventos y ajustando el volumen inicial.
 * @param {Object} eventCallbacks Callbacks para eventos del ciclo de vida del audio.
 * @param {number} initialVolume Nivel de volumen inicial (0 a 1).
 */
export const initPlayer = (eventCallbacks = {}, initialVolume = 0.2) => {
    callbacks = { ...callbacks, ...eventCallbacks };
    Howler.volume(initialVolume);
};

/**
 * Bucle de animación para emitir el progreso de reproducción continuo.
 */
const startProgressLoop = () => {
    if (!sound || !sound.playing() || isDraggingProgress) return;

    const currentTime = typeof sound.seek() === "number" ? sound.seek() : 0;
    callbacks.onProgress(currentTime, sound.duration() || 0);

    requestAnimationFrame(startProgressLoop);
};

/**
 * Carga una nueva pista de audio en el reproductor.
 * @param {Object} song Objeto con información de la canción (incluyendo .src).
 * @param {boolean} autoPlay Si debe comenzar la reproducción automáticamente tras cargar.
 */
export const loadSong = (song, autoPlay = false) => {
    if (!song) return;
    currentSongData = song;

    if (sound) {
        sound.stop();
        sound.unload();
        sound = null;
    }

    sound = new Howl({
        src: [song.src],
        html5: true,
        onload: () => {
            const duration = sound.duration() || 0;
            callbacks.onLoad(duration);
        },
        onloaderror: (_id, err) => {
            console.error("Error al cargar pista de audio:", song.src, err);
        },
        onplay: () => {
            callbacks.onPlay();
            requestAnimationFrame(startProgressLoop);
        },
        onpause: () => {
            callbacks.onPause();
        },
        onstop: () => {
            callbacks.onPause();
        },
        onend: () => {
            callbacks.onEnd(isOnRepeat, isOnShuffle);
        }
    });

    if (autoPlay) {
        sound.play();
    }
};

/**
 * Inicia o reanuda la reproducción del audio actual.
 */
export const playSong = () => {
    if (sound) {
        sound.play();
    }
};

/**
 * Pausa la reproducción del audio actual.
 */
export const pauseSong = () => {
    if (sound) {
        sound.pause();
    }
};

/**
 * Alterna entre reproducción y pausa.
 */
export const togglePlay = () => {
    if (!sound) return;
    if (sound.playing()) {
        pauseSong();
    } else {
        playSong();
    }
};

/**
 * Indica si hay una pista reproduciéndose actualmente.
 * @returns {boolean} True si se está reproduciendo.
 */
export const isPlaying = () => {
    return !!(sound && sound.playing());
};

/**
 * Cambia la posición temporal de la reproducción en segundos.
 * @param {number} time Tiempo en segundos.
 */
export const seek = (time) => {
    if (sound) {
        sound.seek(time);
    }
};

/**
 * Obtiene el tiempo actual de reproducción en segundos.
 * @returns {number} Tiempo en segundos.
 */
export const getCurrentTime = () => {
    if (!sound) return 0;
    return typeof sound.seek() === "number" ? sound.seek() : 0;
};

/**
 * Obtiene la duración total de la pista actual en segundos.
 * @returns {number} Duración en segundos.
 */
export const getDuration = () => {
    return sound ? sound.duration() || 0 : 0;
};

/**
 * Establece el volumen maestro de Howler.
 * @param {number} volume Valor entre 0 y 1.
 */
export const setVolume = (volume) => {
    const clamped = Math.max(0, Math.min(1, Number(volume)));
    Howler.volume(clamped);
};

/**
 * Silencia o desactiva el silencio maestro de Howler.
 * @param {boolean} mute True para silenciar, false para restaurar.
 * @param {number} fallbackVolume Volumen al que restaurar si se desactiva el silencio.
 */
export const setMute = (mute, fallbackVolume = 0.2) => {
    isMuted = mute;
    if (isMuted) {
        Howler.volume(0);
    } else {
        Howler.volume(fallbackVolume);
    }
};

/**
 * Alterna el estado del modo repetición.
 * @returns {boolean} Nuevo estado de repetición.
 */
export const toggleRepeat = () => {
    isOnRepeat = !isOnRepeat;
    return isOnRepeat;
};

export const isRepeatActive = () => isOnRepeat;

/**
 * Alterna el estado del modo aleatorio (Shuffle).
 * @returns {boolean} Nuevo estado de Shuffle.
 */
export const toggleShuffle = () => {
    isOnShuffle = !isOnShuffle;
    return isOnShuffle;
};

export const isShuffleActive = () => isOnShuffle;

/**
 * Notifica al reproductor si el usuario está arrastrando la barra de progreso para pausar las actualizaciones del bucle.
 * @param {boolean} dragging True mientras se arrastra.
 */
export const setDraggingProgress = (dragging) => {
    isDraggingProgress = dragging;
};
