/**
 * ==========================================================================================
 *                                     WINUX OS - MAIN SCRIPT
 * ==========================================================================================
 * This file contains the core logic for the WINUX web desktop environment.
 * It handles the desktop interface, window management, applications, and system modules.
 *
 * STRUCTURE:
 * 1. Interfaces & Types
 * 2. Global State
 * 3. Utilities (Draggable)
 * 4. Core System Functions (Clock, Login, Dock)
 * 5. System Modules (Shutdown, Recycling, Settings, Premium)
 * 6. Applications (Music Player)
 * 7. Main Initialization
 * ==========================================================================================
 */

// ==========================================================================================
// 2. GLOBAL STATE
// ==========================================================================================

const state = {
    isLoggedIn: false,
    batteryLevel: 85,
};

// ==========================================================================================
// 3. UTILITIES
// ==========================================================================================

/**
 * Class to make elements draggable.
 * Used for moving application windows around the desktop.
 */
class Draggable {
    constructor(element, handle) {
        this.element = element;
        this.handle = handle;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;
        
        this.handle.style.cursor = "grab";
        this.init();
    }

    init() {
        this.handle.addEventListener("mousedown", (e) => this.onMouseDown(e));
        document.addEventListener("mousemove", (e) => this.onMouseMove(e));
        document.addEventListener("mouseup", () => this.onMouseUp());
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.handle.style.cursor = "grabbing";

        // Get current transform values if any
        const style = window.getComputedStyle(this.element);
        const matrix = new WebKitCSSMatrix(style.transform);
        this.currentTranslateX = matrix.m41;
        this.currentTranslateY = matrix.m42;
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;

        const newX = this.currentTranslateX + dx;
        const newY = this.currentTranslateY + dy;

        this.element.style.transform = `translate(${newX}px, ${newY}px)`;
    }

    onMouseUp() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.handle.style.cursor = "grab";

        // Update current translation for next drag
        const style = window.getComputedStyle(this.element);
        const matrix = new WebKitCSSMatrix(style.transform);
        this.currentTranslateX = matrix.m41;
        this.currentTranslateY = matrix.m42;
    }
}

// ==========================================================================================
// 4. CORE SYSTEM FUNCTIONS
// ==========================================================================================

/**
 * Updates the system clock in the top bar.
 */
function updateClock() {
    const clockElement = document.getElementById("clock");
    if (!clockElement) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // Format date: "Lun 4 Dec"
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const dateString = now.toLocaleDateString('fr-FR', options);

    clockElement.textContent = `${dateString} ${hours}:${minutes}`;
}

/**
 * Initializes the login screen logic.
 */
function initLogin() {
    const overlay = document.getElementById("login-overlay");
    const loginBtn = document.getElementById("login-btn");
    const passwordInput = document.getElementById("password-input");

    // Shake animation style
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
        }
    `;
    document.head.appendChild(styleSheet);

    const handleLogin = () => {
        if (!passwordInput) return;
        const password = passwordInput.value;
        if (password.length > 0) {
            // Simulate login
            state.isLoggedIn = true;
            if (overlay) overlay.classList.remove("active");
            passwordInput.value = "";
            console.log("Logged in as admin");
        } else {
            // Shake animation for error
            const popup = document.querySelector("#login-overlay .standard-popup");
            if (popup) {
                popup.style.animation = "none";
                popup.offsetHeight; /* trigger reflow */
                popup.style.animation = "shake 0.5s";
            }
        }
    };

    if (loginBtn) loginBtn.addEventListener("click", handleLogin);
    if (passwordInput) {
        passwordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleLogin();
        });
    }
}

/**
 * Initializes the dock icons and their animations.
 */
function initDock() {
    const dockItems = document.querySelectorAll(".dock-item");

    const animateIcon = (element) => {
        element.style.transform = "scale(0.8)";
        setTimeout(() => {
            element.style.transform = "";
        }, 150);
    };

    dockItems.forEach((item) => {
        item.addEventListener("click", () => {
            animateIcon(item);
        });
    });
}

/**
 * Initializes the startup screen logic.
 */
function initStartup() {
    const startupOverlay = document.getElementById("startup-overlay");
    const startBtn = document.getElementById("start-btn");

    if (startBtn && startupOverlay) {
        startBtn.addEventListener("click", () => {
            startupOverlay.classList.add("hidden");
            setTimeout(() => {
                startupOverlay.style.display = "none";
            }, 1000);
        });
    }
}

// ==========================================================================================
// 5. SYSTEM MODULES
// ==========================================================================================

/**
 * Initializes the Shutdown module.
 */
function initShutdown() {
    const shutdownModule = document.getElementById("shutdown-module");
    const shutdownOverlay = document.getElementById("shutdown-overlay");
    const cancelShutdownBtn = document.getElementById("cancel-shutdown-btn");
    const confirmShutdownBtn = document.getElementById("confirm-shutdown-btn");
    const closeShutdownBtn = document.getElementById("close-shutdown-btn");
    const startupOverlay = document.getElementById("startup-overlay");
    const loginOverlay = document.getElementById("login-overlay");
    const passwordInput = document.getElementById("password-input");

    if (shutdownModule) {
        shutdownModule.addEventListener("click", () => shutdownOverlay.classList.add("active"));
    }

    const closeShutdown = () => shutdownOverlay.classList.remove("active");

    if (cancelShutdownBtn) cancelShutdownBtn.addEventListener("click", closeShutdown);
    if (closeShutdownBtn) closeShutdownBtn.addEventListener("click", closeShutdown);

    if (confirmShutdownBtn) {
        confirmShutdownBtn.addEventListener("click", () => {
            console.log("Shutdown initiated");
            shutdownOverlay.classList.remove("active");

            // Reset state
            state.isLoggedIn = false;
            if (passwordInput) passwordInput.value = "";
            if (loginOverlay) loginOverlay.classList.remove("active");

            // Show startup overlay
            if (startupOverlay) {
                startupOverlay.style.display = ""; // Clear display: none
                startupOverlay.offsetHeight; // Force reflow
                startupOverlay.classList.remove("hidden");
            }
        });
    }
}

/**
 * Initializes the Recycling Info module (Carousel).
 */
function initRecycling() {
    const recyclingModule = document.getElementById("recyclage-module");
    const recyclingOverlay = document.getElementById("recycling-overlay");
    const closeRecyclingBtn = document.getElementById("close-recycling-btn");
    const slides = document.querySelectorAll(".carousel-slide");
    const dots = document.querySelectorAll(".dot");
    const nextBtn = document.getElementById("next-btn");
    const skipBtn = document.getElementById("skip-btn");
    let currentSlide = 0;

    const showSlide = (index) => {
        slides.forEach((slide, i) => {
            if (i === index) slide.classList.add("active");
            else slide.classList.remove("active");
        });

        dots.forEach((dot, i) => {
            if (i === index) dot.classList.add("active");
            else dot.classList.remove("active");
        });

        if (nextBtn) {
            nextBtn.textContent = index === slides.length - 1 ? "Get Started" : "Next";
        }
    };

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            showSlide(currentSlide);
        } else {
            recyclingOverlay.classList.remove("active");
            setTimeout(() => {
                currentSlide = 0;
                showSlide(0);
            }, 500);
        }
    };

    if (recyclingModule) {
        recyclingModule.addEventListener("click", () => {
            recyclingOverlay.classList.add("active");
            currentSlide = 0;
            showSlide(0);
        });
    }

    if (closeRecyclingBtn) closeRecyclingBtn.addEventListener("click", () => recyclingOverlay.classList.remove("active"));
    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (skipBtn) skipBtn.addEventListener("click", () => recyclingOverlay.classList.remove("active"));

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    if (recyclingOverlay) {
        recyclingOverlay.addEventListener("click", (e) => {
            if (e.target === recyclingOverlay) recyclingOverlay.classList.remove("active");
        });
    }
}

/**
 * Initializes the Settings module (Wallpaper changer).
 */
function initSettings() {
    const settingsDockItem = document.getElementById("settings-dock-item");
    const settingsOverlay = document.getElementById("settings-overlay");
    const closeSettingsBtns = document.querySelectorAll(".close-settings-btn");
    const wallpaperItems = document.querySelectorAll(".wallpaper-item");
    const resetWallpaperBtn = document.getElementById("reset-wallpaper-btn");
    const settingsSidebarItems = document.querySelectorAll(".settings-sidebar .sidebar-item");
    const settingsSections = document.querySelectorAll(".settings-section");

    const wallpapers = {
        default: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        france: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
        it: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop",
        universe: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
        nature: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop"
    };

    if (settingsDockItem) settingsDockItem.addEventListener("click", () => settingsOverlay.classList.add("active"));

    closeSettingsBtns.forEach(btn => {
        btn.addEventListener("click", () => settingsOverlay.classList.remove("active"));
    });

    if (settingsOverlay) {
        settingsOverlay.addEventListener("click", (e) => {
            if (e.target === settingsOverlay) settingsOverlay.classList.remove("active");
        });
    }

    // Tab Switching
    settingsSidebarItems.forEach(item => {
        item.addEventListener("click", () => {
            settingsSidebarItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const tabName = item.getAttribute("data-tab");
            settingsSections.forEach(section => {
                section.style.display = "none";
                section.classList.remove("active");
            });

            const selectedSection = document.getElementById(`settings-section-${tabName}`);
            if (selectedSection) {
                selectedSection.style.display = "block";
                setTimeout(() => selectedSection.classList.add("active"), 10);
            }
        });
    });

    // Wallpaper Logic
    wallpaperItems.forEach(item => {
        item.addEventListener("click", () => {
            wallpaperItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const wallpaperKey = item.getAttribute("data-wallpaper");
            if (wallpaperKey && wallpapers[wallpaperKey]) {
                document.body.style.backgroundImage = `url('${wallpapers[wallpaperKey]}')`;
            }
        });
    });

    if (resetWallpaperBtn) {
        resetWallpaperBtn.addEventListener("click", () => {
            document.body.style.backgroundImage = `url('${wallpapers.default}')`;
            wallpaperItems.forEach(i => i.classList.remove("active"));
            const defaultItem = document.querySelector('.wallpaper-item[data-wallpaper="default"]');
            if (defaultItem) defaultItem.classList.add("active");
        });
    }
}

/**
 * Initializes the Premium feature popup.
 */
function initPremium() {
    const premiumBtn = document.getElementById("premium-btn");
    const premiumOverlay = document.getElementById("premium-overlay");
    const closePremiumBtn = document.getElementById("close-premium-btn");

    if (premiumBtn) premiumBtn.addEventListener("click", () => premiumOverlay.classList.add("active"));
    if (closePremiumBtn) closePremiumBtn.addEventListener("click", () => premiumOverlay.classList.remove("active"));
    if (premiumOverlay) {
        premiumOverlay.addEventListener("click", (e) => {
            if (e.target === premiumOverlay) premiumOverlay.classList.remove("active");
        });
    }
}

/**
 * Initializes the Games module.
 */
function initGames() {
    const gamesDockItem = document.getElementById("games-dock-item");
    const gamesOverlay = document.getElementById("games-overlay");
    const closeGamesBtn = document.getElementById("close-games-btn");
    const playBtns = document.querySelectorAll(".game-item .play-btn");

    if (gamesDockItem) gamesDockItem.addEventListener("click", () => gamesOverlay.classList.add("active"));
    if (closeGamesBtn) closeGamesBtn.addEventListener("click", () => gamesOverlay.classList.remove("active"));
    
    if (gamesOverlay) {
        gamesOverlay.addEventListener("click", (e) => {
            if (e.target === gamesOverlay) gamesOverlay.classList.remove("active");
        });
    }

    playBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            alert("Ce jeu sera bientôt disponible !");
        });
    });
}

// ==========================================================================================
// 6. APPLICATIONS
// ==========================================================================================

/**
 * Music Player Application
 * Handles audio playback, playlist management, and IndexedDB persistence.
 */
class MusicPlayer {
    constructor() {
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.db = null;
        this.audio = new Audio();

        // DOM Elements
        this.overlay = document.getElementById("music-player-overlay");
        this.playPauseBtn = document.getElementById("music-play-pause-btn");
        this.prevBtn = document.getElementById("music-prev-btn");
        this.nextBtn = document.getElementById("music-next-btn");
        this.progressBar = document.getElementById("progress-bar");
        this.volumeSlider = document.getElementById("volume-slider");
        this.currentTimeEl = document.getElementById("current-time");
        this.durationEl = document.getElementById("duration");
        this.trackTitleEl = document.getElementById("track-title");
        this.trackArtistEl = document.getElementById("track-artist");
        this.playlistEl = document.getElementById("playlist-list");
        this.addMusicInput = document.getElementById("add-music-input");

        this.initDB();
        this.initEventListeners();
        this.initDraggable();
    }

    /**
     * Initializes the Draggable functionality for the music player window.
     */
    initDraggable() {
        const popup = document.querySelector(".music-player-popup");
        const header = document.querySelector(".player-header");
        if (popup && header) {
            new Draggable(popup, header);
        }
    }

    /**
     * Initializes IndexedDB for storing music tracks.
     */
    initDB() {
        const request = indexedDB.open("MusicPlayerDB", 1);

        request.onerror = (event) => {
            console.error("Database error:", event);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("tracks")) {
                db.createObjectStore("tracks", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            this.loadTracksFromDB();
        };
    }

    /**
     * Saves a track to IndexedDB.
     */
    saveTrackToDB(track) {
        if (!this.db || !track.file) return;

        const transaction = this.db.transaction(["tracks"], "readwrite");
        const store = transaction.objectStore("tracks");
        
        const trackData = {
            title: track.title,
            artist: track.artist,
            file: track.file,
            timestamp: new Date().getTime()
        };

        store.add(trackData);
    }

    /**
     * Loads tracks from IndexedDB into the playlist.
     */
    loadTracksFromDB() {
        if (!this.db) return;

        const transaction = this.db.transaction(["tracks"], "readonly");
        const store = transaction.objectStore("tracks");
        const request = store.getAll();

        request.onsuccess = () => {
            const tracks = request.result;
            if (tracks && tracks.length > 0) {
                tracks.forEach((trackData) => {
                    const url = URL.createObjectURL(trackData.file);
                    this.playlist.push({
                        title: trackData.title,
                        artist: trackData.artist,
                        url: url,
                        file: trackData.file
                    });
                });
                this.updatePlaylistUI();
                
                // Load first track if available
                if (this.playlist.length > 0 && !this.audio.src) {
                    this.currentTrackIndex = 0;
                    const track = this.playlist[0];
                    this.audio.src = track.url;
                    this.audio.load();
                    if (this.trackTitleEl) this.trackTitleEl.textContent = track.title;
                    if (this.trackArtistEl) this.trackArtistEl.textContent = track.artist;
                    this.updatePlaylistUI();
                }
            }
        };
    }

    initEventListeners() {
        // Play/Pause
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener("click", () => this.togglePlay());
        }

        // Prev/Next
        if (this.prevBtn) this.prevBtn.addEventListener("click", () => this.prevTrack());
        if (this.nextBtn) this.nextBtn.addEventListener("click", () => this.nextTrack());

        // Volume
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener("input", (e) => {
                const volume = parseFloat(e.target.value);
                this.audio.volume = volume;
                this.updateVolumeIcon(volume);
            });
        }

        // Progress Bar
        if (this.progressBar) {
            this.progressBar.addEventListener("input", (e) => {
                const seekTime = (parseFloat(e.target.value) / 100) * this.audio.duration;
                this.audio.currentTime = seekTime;
            });
        }

        // Audio Events
        this.audio.addEventListener("timeupdate", () => this.updateProgress());
        this.audio.addEventListener("ended", () => this.nextTrack());
        this.audio.addEventListener("loadedmetadata", () => {
            if (this.durationEl) {
                this.durationEl.textContent = this.formatTime(this.audio.duration);
            }
        });

        // Add Music
        if (this.addMusicInput) {
            this.addMusicInput.addEventListener("change", (e) => this.handleFileSelect(e));
        }

        // Open Player from Dock
        const musicDockItem = document.querySelector('.dock-item[title="Musique"]');
        if (musicDockItem) {
            musicDockItem.addEventListener("click", () => {
                if (this.overlay) this.overlay.classList.add("active");
            });
        }

        // Close Player
        const closePlayerBtn = document.getElementById("close-player-btn");
        if (closePlayerBtn) {
            closePlayerBtn.addEventListener("click", () => {
                if (this.overlay) this.overlay.classList.remove("active");
            });
        }

        // Close on click outside
        if (this.overlay) {
            this.overlay.addEventListener("click", (e) => {
                if (e.target === this.overlay) {
                    this.overlay.classList.remove("active");
                }
            });
        }
    }

    togglePlay() {
        if (this.playlist.length === 0) return;

        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            if (this.playPauseBtn) this.playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
            this.audio.play();
            this.isPlaying = true;
            if (this.playPauseBtn) this.playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
    }

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentTrackIndex = index;
        const track = this.playlist[index];
        
        this.audio.src = track.url;
        this.audio.load();
        
        if (this.trackTitleEl) this.trackTitleEl.textContent = track.title;
        if (this.trackArtistEl) this.trackArtistEl.textContent = track.artist;

        this.updatePlaylistUI();
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            if (this.playPauseBtn) this.playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }).catch(err => console.error("Playback failed:", err));
    }

    nextTrack() {
        let nextIndex = this.currentTrackIndex + 1;
        if (nextIndex >= this.playlist.length) nextIndex = 0;
        this.loadTrack(nextIndex);
    }

    prevTrack() {
        let prevIndex = this.currentTrackIndex - 1;
        if (prevIndex < 0) prevIndex = this.playlist.length - 1;
        this.loadTrack(prevIndex);
    }

    updateProgress() {
        if (this.progressBar && this.currentTimeEl) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.value = percent.toString();
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateVolumeIcon(volume) {
        const icon = document.querySelector(".volume-control i");
        if (!icon) return;

        icon.className = "fa-solid";
        if (volume === 0) {
            icon.classList.add("fa-volume-xmark");
        } else if (volume < 0.5) {
            icon.classList.add("fa-volume-low");
        } else {
            icon.classList.add("fa-volume-high");
        }
    }

    handleFileSelect(event) {
        const input = event.target;
        if (input.files) {
            Array.from(input.files).forEach(file => {
                const url = URL.createObjectURL(file);
                let title = file.name.replace(/\.[^/.]+$/, "");
                let artist = "Artiste inconnu";
                
                if (title.includes("-")) {
                    const parts = title.split("-");
                    artist = parts[0].trim();
                    title = parts.slice(1).join("-").trim();
                }

                const track = {
                    title,
                    artist,
                    url,
                    file
                };

                this.playlist.push(track);
                this.saveTrackToDB(track);
            });

            this.updatePlaylistUI();
            
            if (this.playlist.length === input.files.length) {
                this.loadTrack(0);
            }
        }
        input.value = "";
    }

    updatePlaylistUI() {
        if (!this.playlistEl) return;
        
        this.playlistEl.innerHTML = "";
        this.playlist.forEach((track, index) => {
            const li = document.createElement("li");
            li.className = `playlist-item ${index === this.currentTrackIndex ? 'active' : ''}`;
            li.innerHTML = `
                <i class="fa-solid fa-music"></i>
                <div class="track-details">
                    <span class="track-name">${track.title}</span>
                    <span class="track-artist" style="font-size: 0.8em; opacity: 0.7; margin-left: 5px;">- ${track.artist}</span>
                </div>
            `;
            li.addEventListener("click", () => this.loadTrack(index));
            this.playlistEl.appendChild(li);
        });
    }
}

// ==========================================================================================
// 7. MAIN INITIALIZATION
// ==========================================================================================

function init() {
    updateClock();
    setInterval(updateClock, 1000);

    initStartup();
    initLogin();
    initDock();
    initShutdown();
    initRecycling();
    initSettings();
    initSettings();
    initPremium();
    initGames();

    // Initialize Applications
    new MusicPlayer();
}

// Start the application when DOM is ready
document.addEventListener("DOMContentLoaded", init);
