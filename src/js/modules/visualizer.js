/**
 * Módulo: visualizer.js
 * Descripción: Controla la visualización gráfica del espectro en el Canvas y la configuración de las bandas del ecualizador (graves, medios, agudos).
 */

const numBars = 32;
const baseProfile = [
    0.85, 0.76, 0.82, 0.88, 0.70, 0.55, 0.50, 0.48, 
    0.52, 0.54, 0.58, 0.65, 0.60, 0.52, 0.56, 0.48, 
    0.42, 0.44, 0.45, 0.42, 0.40, 0.38, 0.36, 0.38, 
    0.35, 0.33, 0.31, 0.30, 0.32, 0.30, 0.28, 0.27
];
const currentHeights = [...baseProfile];

let eqBass = null;
let eqMid = null;
let eqTreble = null;
let bassVal = null;
let midVal = null;
let trebleVal = null;
let resetEqBtn = null;

/**
 * Configura los controles interactivos de las bandas de ecualización.
 */
export const initEqualizerControls = () => {
    eqBass = document.querySelector("#eq-bass");
    eqMid = document.querySelector("#eq-mid");
    eqTreble = document.querySelector("#eq-treble");
    bassVal = document.querySelector("#bass-val");
    midVal = document.querySelector("#mid-val");
    trebleVal = document.querySelector("#treble-val");
    resetEqBtn = document.querySelector("#reset-eq");

    const updateLabel = (input, label) => {
        if (!input || !label) return;
        const val = Number(input.value);
        label.textContent = `${val > 0 ? "+" : ""}${val} dB`;
    };

    if (eqBass && bassVal) eqBass.addEventListener("input", () => updateLabel(eqBass, bassVal));
    if (eqMid && midVal) eqMid.addEventListener("input", () => updateLabel(eqMid, midVal));
    if (eqTreble && trebleVal) eqTreble.addEventListener("input", () => updateLabel(eqTreble, trebleVal));

    if (resetEqBtn) {
        resetEqBtn.addEventListener("click", () => {
            if (eqBass) eqBass.value = 0;
            if (eqMid) eqMid.value = 0;
            if (eqTreble) eqTreble.value = 0;
            if (bassVal) bassVal.textContent = "0 dB";
            if (midVal) midVal.textContent = "0 dB";
            if (trebleVal) trebleVal.textContent = "0 dB";
        });
    }
};

/**
 * Inicia el renderizado del espectro visual en el Canvas.
 * @param {Function} isPlayingFn Función que devuelve true si hay audio reproduciéndose.
 */
export const initVisualizer = (isPlayingFn = () => false) => {
    const canvas = document.querySelector("#spectrum-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
        const width = canvas.clientWidth || 300;
        const height = canvas.clientHeight || 100;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        ctx.clearRect(0, 0, width, height);

        const isPlaying = isPlayingFn();
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

            // Degradado violeta
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
