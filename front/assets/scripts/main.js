import { WINUXWindow } from './window.js';

// --- CONFIGURATION DES APPS ---
const APPS = {
    music: { title: 'Lecteur Musique', url: './apps/music/index.html', width: '400px', height: '500px' },
    settings: { title: 'Paramètres', url: './apps/settings/index.html', width: '700px', height: '500px' },
    recycling: { title: 'Recyclage', url: './apps/recycling/index.html', width: '420px', height: '600px' },
    shutdown: { title: 'Arrêt système', url: './apps/shutdown/index.html', width: '350px', height: '220px' },
    games: { title: 'Arcade', url: './apps/games/index.html', width: '500px', height: '400px' },
    // Les jeux individuels
    snake: { title: 'Snake', url: './apps/snake/index.html', width: '400px', height: '440px' },
    lasergame: { title: 'Laser Game', url: './apps/lasergame/index.html', width: '900px', height: '600px' }
};

// --- HORLOGE ---
function updateClock() {
    const clockElement = document.getElementById("clock");
    if (!clockElement) return;
    const now = new Date();
    const dateString = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    clockElement.textContent = `${dateString} ${timeString}`;
}

// --- GESTION DES FENÊTRES ---
// Cette fonction est attachée à window pour être accessible depuis le HTML
window.spawnWindow = function(appKey) {
    const app = APPS[appKey];
    if (!app) return console.error(`App ${appKey} introuvable`);

    const winId = `win-${appKey}-${Date.now()}`;
    const desktop = document.querySelector('.desktop');

    // Création du conteneur pour WINUXWindow
    const container = document.createElement('div');
    container.id = winId;

    // Positionnement aléatoire pour éviter l'empilement
    const offset = Math.floor(Math.random() * 40);
    container.style.position = 'absolute';
    container.style.top = `${80 + offset}px`;
    container.style.left = `${80 + offset}px`;
    container.style.width = app.width;
    container.style.height = app.height;

    desktop.appendChild(container);

    // Initialisation de la fenêtre draggable
    new WINUXWindow(winId, app.url);
};

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateClock, 1000);
    updateClock();

    // Liens du Dock
    const musicBtn = document.querySelector('[title="Musique"]');
    if(musicBtn) musicBtn.addEventListener('click', () => window.spawnWindow('music'));

    const gamesBtn = document.getElementById('games-dock-item');
    if(gamesBtn) gamesBtn.addEventListener('click', () => window.spawnWindow('games'));

    const settingsBtn = document.getElementById('settings-dock-item');
    if(settingsBtn) settingsBtn.addEventListener('click', () => window.spawnWindow('settings'));

    // Lien Recyclage (Bureau)
    const recycleIcon = document.getElementById("recyclage-module");
    if(recycleIcon) recycleIcon.addEventListener('click', () => window.spawnWindow('recycling'));

    // Lien Shutdown (Barre du haut)
    const shutdownBtn = document.getElementById("shutdown-module");
    if(shutdownBtn) shutdownBtn.addEventListener('click', () => window.spawnWindow('shutdown'));

    // Gestion de l'écran de démarrage / Login (si présent dans le HTML)
    const startupOverlay = document.getElementById("startup-overlay");
    const startBtn = document.getElementById("start-btn");
    if (startBtn && startupOverlay) {
        startBtn.addEventListener("click", () => {
            startupOverlay.style.opacity = "0";
            setTimeout(() => startupOverlay.remove(), 1000);
        });
    }
});