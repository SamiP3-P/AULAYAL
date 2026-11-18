const CACHE_NAME = "aulaya-shell-v111";
const APP_FILES = [
  "./", "./index.html", "./styles.css", "./app.js", "./games.js", "./question-bank.js", "./database.js", "./supabase-config.js",
  "./manifest.json", "./favicon.ico", "./teo-brain.js",
  "./assets/PERFILSAM.png", "./assets/video-material.png", "./assets/pdf-material.png", "./assets/game-icon.png", "./assets/game-carrera.png", "./assets/game-palabra.png", "./assets/game-memoria.png", "./assets/game-atrapa.png", "./assets/game-clasifica.png", "./assets/game-ordena.png", "./assets/favicon.png", "./assets/aulaya-icon-192.png", "./assets/aulaya-icon-512.png", "./assets/aulaya-icon-maskable.png", "./assets/apple-touch-icon.png", "./assets/notification-icon.png", "./assets/lengua-icon.svg",
  "./assets/Iniciosam.png", "./assets/inicio-casa.png", "./assets/clases-libro.png", "./assets/reportes-barras.png", "./assets/perfil-docente.png", "./assets/grado-1.png", "./assets/grado-2.png", "./assets/grado-3.png", "./assets/grado-4.png", "./assets/grado-5.png", "./assets/grado-acolitos.png", "./assets/mis-clases.png", "./assets/estudiantes.png", "./assets/reportes-barras-rellenas.png", "./assets/recursos.png", "./assets/reportes.png", "./assets/Lenguajeoriginal-sin-fondo.png",
  "./assets/student-home-landscape.png", "./assets/matematicas.svg", "./assets/aulaya-mascot.png", "./assets/teacher-profile-avatar.png", "./assets/teacher-avatar-options.png", "./assets/teacher-character-1.png", "./assets/teacher-character-2.png", "./assets/teacher-character-3.png", "./assets/teacher-character-4.png", "./assets/teacher-character-5.png", "./assets/teacher-character-6.png", "./assets/teacher-character-7.png", "./assets/teacher-character-8.png", "./assets/teacher-welcome-background.png", "./assets/role-student.png", "./assets/role-teacher.png", "./assets/role-student-solo.png", "./assets/role-teacher-solo.png", "./assets/profile-corner-plants.png",
  "./assets/mondeaconlogo.png", "./assets/Descargaslogosam.png", "./assets/LogoSML.png", "./assets/librosnoprogreso.png",
  "./assets/socialessam.png", "./assets/Lenguanuevo.png", "./assets/aulaya-logo-white.png",
  "./assets/Matematicasoriginal.png", "./assets/downloads-icon.svg", "./assets/Ciencias.png",
  "./assets/inglessam.png", "./assets/NotificaciónNuevosam.png",
  "./assets/personalizcionsam.png", "./assets/ropa-camiseta-verde.png", "./assets/teo-camiseta-equipo.png", "./assets/teo-acc-gorra.png", "./assets/teo-acc-gafas.png", "./assets/teo-acc-audifonos.png", "./assets/teo-acc-mochila.png", "./assets/teo-acc-reloj.png", "./assets/acc-gorra.png", "./assets/acc-gafas.png", "./assets/acc-audifonos.png", "./assets/acc-mochila.png", "./assets/acc-reloj.png", "./assets/teo-camiseta-brote.png", "./assets/teo-camiseta-manchas.png", "./assets/teo-buzo-huellita.png", "./assets/teo-buzo-selva.png", "./assets/teo-chaqueta-explorador.png", "./assets/teo-chaqueta-campeon.png", "./assets/ropa-camiseta-hojita.png", "./assets/ropa-camiseta-jaguar.png", "./assets/ropa-buzo-huella.png", "./assets/ropa-buzo-verde.png", "./assets/ropa-chaqueta-aulaya.png", "./assets/ropa-chaqueta-universitaria.png"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("aulaya-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method === "GET" && request.url.startsWith("https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji")) {
    event.respondWith(caches.open("aulaya-art-v1").then((cache) => cache.match(request).then((hit) => hit || fetch(request).then((response) => {
      if (response.ok || response.type === "opaque") cache.put(request, response.clone());
      return response;
    }))));
    return;
  }
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
    return response;
  }).catch(() => request.mode === "navigate" ? caches.match("./index.html") : Response.error())));
});
