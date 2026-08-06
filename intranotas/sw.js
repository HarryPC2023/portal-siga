/* ============================================================
   INTRANOTAS — Service Worker (integrado a portal-siga)
   Estrategia: Cache-First para assets estáticos
   ============================================================ */

const CACHE_NAME = 'intranotas-v58';

const ARCHIVOS_A_CACHEAR = [
    './index.html',
    './cursos_db.js',
    './intranotas.js',
    './css/intranotas.css',
    './css/siga-theme-intranotas.css',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './Harry.png',
    './sistemas.png',
    './industrial.png',
    './software.png',
    /* CSS y assets compartidos del portal SIGA */
    '../css/variables.css',
    '../css/landing.css',
    '../css/dashboard.css',
    '../assets/logo-siga.png',
    /* Fuentes de Google */
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Poppins:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Orbitron:wght@500;600;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando archivos de INTRANOTAS...');
                const archivosLocales = ARCHIVOS_A_CACHEAR.filter(url => !url.startsWith('http'));
                const archivosExternos = ARCHIVOS_A_CACHEAR.filter(url => url.startsWith('http'));

                return cache.addAll(archivosLocales).then(() => {
                    archivosExternos.forEach(url => {
                        fetch(url)
                            .then(res => { if (res.ok) cache.put(url, res); })
                            .catch(() => { /* sin conexión al instalar — no pasa nada */ });
                    });
                });
            })
            .then(() => {
                console.log('[SW] Instalación completada.');
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(claves => {
            return Promise.all(
                claves
                    .filter(clave => clave !== CACHE_NAME)
                    .map(clave => {
                        console.log('[SW] Eliminando caché vieja:', clave);
                        return caches.delete(clave);
                    })
            );
        }).then(() => {
            console.log('[SW] Activado. Tomando control de todas las pestañas.');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(respuestaCacheada => {
            if (respuestaCacheada) {
                return respuestaCacheada;
            }

            return fetch(event.request)
                .then(respuestaRed => {
                    if (!respuestaRed || respuestaRed.status !== 200 || respuestaRed.type === 'opaque') {
                        return respuestaRed;
                    }

                    const respuestaParaGuardar = respuestaRed.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, respuestaParaGuardar);
                    });

                    return respuestaRed;
                })
                .catch(() => {
                    if (event.request.destination === 'document') {
                        return caches.match('./index.html');
                    }
                });
        })
    );
});