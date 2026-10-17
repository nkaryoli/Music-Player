/**
 * Módulo: shortcuts.js
 * Descripción: Asigna atajos de teclado globales para controlar la reproducción sin interferir con inputs de texto.
 */

/**
 * Inicializa los atajos de teclado del reproductor.
 * @param {Object} actions Objeto con los manejadores de eventos ({ onTogglePlay, onSeekForward, onSeekBackward }).
 */
export const initShortcuts = ({ onTogglePlay, onSeekForward, onSeekBackward }) => {
    document.addEventListener("keydown", (e) => {
        // No interceptar si el usuario está escribiendo en el buscador u otro input
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

        if (e.code === "Space") {
            e.preventDefault();
            if (onTogglePlay) onTogglePlay();
        } else if (e.code === "ArrowRight") {
            if (onSeekForward) onSeekForward(5);
        } else if (e.code === "ArrowLeft") {
            if (onSeekBackward) onSeekBackward(5);
        }
    });
};
