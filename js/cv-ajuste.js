// js/cv-ajuste.js — Ajuste automático de la hoja a UNA página.
//
// Si el CV no cabe en una hoja A4, se compacta poco a poco: primero el espacio entre secciones, luego el interlineado,
// después el espacio entre elementos y, al final, el tamaño de la letra, siempre con un mínimo legible.
// El aire bajo los títulos de sección NO se toca nunca.
// No toca la cuenta ni guarda nada: solo mide y devuelve los valores que usan los estilos (variables CSS de la hoja).

export const PARAMS_BASE = { fs: 11, sec: 2, lh: 1.6, gp: 1 };
const MIN = { fs: 10, sec: 1.3, lh: 1.45, gp: 0.6 };

export function aplicarParams(a4, p) {
    a4.style.setProperty('--cv-fs', `${p.fs}pt`);
    a4.style.setProperty('--cv-sec', String(p.sec));
    a4.style.setProperty('--cv-lh', String(p.lh));
    a4.style.setProperty('--cv-gp', String(p.gp));
}

const redondear = (n) => Math.round(n * 100) / 100;

// a4: la hoja de medición (ya con su diseño y su HTML); dentro: el contenido que se mide; disponible: alto útil en píxeles.
export function ajustarAUnaHoja({ a4, dentro, disponible }) {
    const p = { ...PARAMS_BASE };
    aplicarParams(a4, p);
    let vueltas = 0;
    while (dentro.offsetHeight > disponible && vueltas < 120) {
        vueltas += 1;
        if (p.sec > MIN.sec) p.sec = redondear(p.sec - 0.1);
        else if (p.lh > MIN.lh) p.lh = redondear(p.lh - 0.02);
        else if (p.gp > MIN.gp) p.gp = redondear(p.gp - 0.05);
        else if (p.fs > MIN.fs) p.fs = redondear(p.fs - 0.25);
        else break;
        aplicarParams(a4, p);
    }
    const usado = dentro.offsetHeight;
    const pct = disponible ? Math.round((usado / disponible) * 100) : 0;
    return { params: p, usado, pct, cabe: usado <= disponible, compactado: vueltas > 0 };
}
