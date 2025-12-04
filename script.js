// script.ts
const state = {
    isLoggedIn: false,
    batteryLevel: 85,
};
// DOM Elements
const overlay = document.getElementById("login-overlay");
const loginBtn = document.getElementById("login-btn");
const passwordInput = document.getElementById("password-input");
const clockElement = document.getElementById("clock");
const batteryElement = document.getElementById("battery-level");
const dockItems = document.querySelectorAll(".dock-item");
// Initialize
function init() {
    updateClock();
    setInterval(updateClock, 1000);
    // Startup logic
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
    // Event Listeners
    if (loginBtn) {
        loginBtn.addEventListener("click", handleLogin);
    }
    if (passwordInput) {
        passwordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter")
                handleLogin();
        });
    }
    // Dock animations
    dockItems.forEach((item) => {
        item.addEventListener("click", () => {
            animateIcon(item);
        });
    });
}
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    // Format date: "Lun 4 Dec"
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const dateString = now.toLocaleDateString('fr-FR', options);
    if (clockElement) {
        clockElement.textContent = `${dateString} ${hours}:${minutes}`;
    }
}
function handleLogin() {
    if (!passwordInput)
        return;
    const password = passwordInput.value;
    if (password.length > 0) {
        // Simulate login
        state.isLoggedIn = true;
        if (overlay)
            overlay.classList.remove("active");
        // Clear input
        passwordInput.value = "";
        // Play a sound or show a notification could go here
        console.log("Logged in as admin");
    }
    else {
        // Shake animation for error
        const popup = document.querySelector("#login-overlay .standard-popup");
        if (popup) {
            popup.style.animation = "none";
            popup.offsetHeight; /* trigger reflow */
            popup.style.animation = "shake 0.5s";
        }
    }
}
function animateIcon(element) {
    element.style.transform = "scale(0.8)";
    setTimeout(() => {
        element.style.transform = "";
    }, 150);
}
// Add shake animation style dynamically
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
// Start
document.addEventListener("DOMContentLoaded", init);
// Shutdown Logic
const shutdownModule = document.getElementById("shutdown-module");
const shutdownOverlay = document.getElementById("shutdown-overlay");
const cancelShutdownBtn = document.getElementById("cancel-shutdown-btn");
const confirmShutdownBtn = document.getElementById("confirm-shutdown-btn");
const closeShutdownBtn = document.getElementById("close-shutdown-btn");
if (shutdownModule) {
    shutdownModule.addEventListener("click", () => {
        shutdownOverlay.classList.add("active");
    });
}
if (cancelShutdownBtn) {
    cancelShutdownBtn.addEventListener("click", () => {
        shutdownOverlay.classList.remove("active");
    });
}
if (closeShutdownBtn) {
    closeShutdownBtn.addEventListener("click", () => {
        shutdownOverlay.classList.remove("active");
    });
}
if (confirmShutdownBtn) {
    confirmShutdownBtn.addEventListener("click", () => {
        console.log("Shutdown button clicked");
        // Simulate shutdown
        const startupOverlay = document.getElementById("startup-overlay");
        console.log("Startup overlay found:", startupOverlay);
        // Hide shutdown popup
        shutdownOverlay.classList.remove("active");
        // Reset state
        state.isLoggedIn = false;
        if (passwordInput)
            passwordInput.value = "";
        if (overlay)
            overlay.classList.remove("active");
        // Show startup overlay
        if (startupOverlay) {
            startupOverlay.style.display = ""; // Clear display: none
            // Force reflow
            startupOverlay.offsetHeight;
            startupOverlay.classList.remove("hidden");
            console.log("Startup overlay shown");
        }
    });
}
else {
    console.error("Confirm shutdown button not found");
}
// Carousel Logic
const recyclingModule = document.getElementById("recyclage-module");
const recyclingOverlay = document.getElementById("recycling-overlay");
const closeRecyclingBtn = document.getElementById("close-recycling-btn");
// Carousel Elements
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");
const nextBtn = document.getElementById("next-btn");
const skipBtn = document.getElementById("skip-btn");
let currentSlide = 0;
function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add("active");
        }
        else {
            slide.classList.remove("active");
        }
    });
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add("active");
        }
        else {
            dot.classList.remove("active");
        }
    });
    if (index === slides.length - 1) {
        nextBtn.textContent = "Get Started";
    }
    else {
        nextBtn.textContent = "Next";
    }
}
function nextSlide() {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
    }
    else {
        // Close popup on last slide
        recyclingOverlay.classList.remove("active");
        // Reset to first slide for next time
        setTimeout(() => {
            currentSlide = 0;
            showSlide(0);
        }, 500);
    }
}
if (recyclingModule) {
    recyclingModule.addEventListener("click", () => {
        recyclingOverlay.classList.add("active");
        currentSlide = 0;
        showSlide(0);
    });
}
if (closeRecyclingBtn) {
    closeRecyclingBtn.addEventListener("click", () => {
        recyclingOverlay.classList.remove("active");
    });
}
if (nextBtn) {
    nextBtn.addEventListener("click", nextSlide);
}
if (skipBtn) {
    skipBtn.addEventListener("click", () => {
        recyclingOverlay.classList.remove("active");
    });
}
dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        currentSlide = index;
        showSlide(currentSlide);
    });
});
// Close recycling popup when clicking outside
if (recyclingOverlay) {
    recyclingOverlay.addEventListener("click", (e) => {
        if (e.target === recyclingOverlay) {
            recyclingOverlay.classList.remove("active");
        }
    });
}
// Settings App Logic
// Settings App Logic
const settingsDockItem = document.getElementById("settings-dock-item");
const settingsOverlay = document.getElementById("settings-overlay");
const closeSettingsBtns = document.querySelectorAll(".close-settings-btn");
const wallpaperItems = document.querySelectorAll(".wallpaper-item");
const resetWallpaperBtn = document.getElementById("reset-wallpaper-btn");
const settingsSidebarItems = document.querySelectorAll(".settings-sidebar .sidebar-item");
const settingsSections = document.querySelectorAll(".settings-section");

// Wallpaper Data (using Unsplash URLs as fallback)
const wallpapers = {
    default: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    france: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
    it: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop",
    universe: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    nature: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop"
};

// Open Settings
if (settingsDockItem) {
    settingsDockItem.addEventListener("click", () => {
        settingsOverlay.classList.add("active");
    });
}

// Close Settings
closeSettingsBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        settingsOverlay.classList.remove("active");
    });
});

// Close on click outside
if (settingsOverlay) {
    settingsOverlay.addEventListener("click", (e) => {
        if (e.target === settingsOverlay) {
            settingsOverlay.classList.remove("active");
        }
    });
}

// Settings Tab Switching
settingsSidebarItems.forEach(item => {
    item.addEventListener("click", () => {
        // Remove active class from all sidebar items
        settingsSidebarItems.forEach(i => i.classList.remove("active"));
        // Add active class to clicked item
        item.classList.add("active");

        const tabName = item.getAttribute("data-tab");
        
        // Hide all sections
        settingsSections.forEach(section => {
            section.style.display = "none";
            section.classList.remove("active");
        });

        // Show selected section
        const selectedSection = document.getElementById(`settings-section-${tabName}`);
        if (selectedSection) {
            selectedSection.style.display = "block";
            // Small timeout to allow display:block to apply before adding active class for potential animation
            setTimeout(() => {
                selectedSection.classList.add("active");
            }, 10);
        }
    });
});
// Close on click outside
if (settingsOverlay) {
    settingsOverlay.addEventListener("click", (e) => {
        if (e.target === settingsOverlay) {
            settingsOverlay.classList.remove("active");
        }
    });
}
// Change Wallpaper
wallpaperItems.forEach(item => {
    item.addEventListener("click", () => {
        // Remove active class from all
        wallpaperItems.forEach(i => i.classList.remove("active"));
        // Add active class to clicked
        item.classList.add("active");
        const wallpaperKey = item.getAttribute("data-wallpaper");
        if (wallpaperKey && wallpapers[wallpaperKey]) {
            let url = wallpapers[wallpaperKey];
            // If it's a local file that doesn't exist yet (placeholders), we might want to handle it visually
            // For now, we'll just set it. If it's a color placeholder in CSS, this JS changes the body background.
            // Check if it's one of our placeholder keys and if we should use a color instead if image fails?
            // For this demo, let's assume images might be missing, so we set background-image.
            // If the image is missing, it won't show, but the color fallback in CSS (if any) would show.
            // However, we are setting it on 'body'.
            document.body.style.backgroundImage = `url('${url}')`;
        }
    });
});
// Reset Wallpaper
if (resetWallpaperBtn) {
    resetWallpaperBtn.addEventListener("click", () => {
        document.body.style.backgroundImage = `url('${wallpapers.default}')`;
        // Update active state in grid
        wallpaperItems.forEach(i => i.classList.remove("active"));
        const defaultItem = document.querySelector('.wallpaper-item[data-wallpaper="default"]');
        if (defaultItem)
            defaultItem.classList.add("active");
    });
}

// Premium Feature Logic
const premiumBtn = document.getElementById("premium-btn");
const premiumOverlay = document.getElementById("premium-overlay");
const closePremiumBtn = document.getElementById("close-premium-btn");

if (premiumBtn) {
    premiumBtn.addEventListener("click", () => {
        premiumOverlay.classList.add("active");
    });
}

if (closePremiumBtn) {
    closePremiumBtn.addEventListener("click", () => {
        premiumOverlay.classList.remove("active");
    });
}


if (premiumOverlay) {
    premiumOverlay.addEventListener("click", (e) => {
        if (e.target === premiumOverlay) {
            premiumOverlay.classList.remove("active");
        }
    });
}

// Music Player Logic
class MusicPlayer {
    constructor() {
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        
        this.audio = new Audio();
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
        this.albumArtEl = document.querySelector(".album-art");

        this.initEventListeners();
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
        
        // Auto play
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
                // Simple parsing of filename for title/artist
                // "Artist - Title.mp3" or just "Title.mp3"
                let title = file.name.replace(/\.[^/.]+$/, "");
                let artist = "Artiste inconnu";
                
                if (title.includes("-")) {
                    const parts = title.split("-");
                    artist = parts[0].trim();
                    title = parts.slice(1).join("-").trim();
                }

                this.playlist.push({
                    title,
                    artist,
                    url,
                    file
                });
            });

            this.updatePlaylistUI();
            
            // If this was the first track added, load it
            if (this.playlist.length === input.files.length) {
                this.loadTrack(0);
            }
        }
        // Reset input
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
            this.playlistEl?.appendChild(li);
        });
    }
}

// Initialize Music Player
document.addEventListener("DOMContentLoaded", () => {
    new MusicPlayer();
});
