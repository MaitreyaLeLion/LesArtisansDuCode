// script.ts

// Interfaces for our elements
interface AppState {
  isLoggedIn: boolean;
  batteryLevel: number;
}

const state: AppState = {
  isLoggedIn: false,
  batteryLevel: 85,
};

// DOM Elements
const overlay = document.getElementById("login-overlay") as HTMLDivElement;
const loginBtn = document.getElementById("login-btn") as HTMLButtonElement;
const passwordInput = document.getElementById(
  "password-input"
) as HTMLInputElement;
const clockElement = document.getElementById("clock") as HTMLSpanElement;
const batteryElement = document.getElementById(
  "battery-level"
) as HTMLSpanElement;
const dockItems = document.querySelectorAll(".dock-item");

// Initialize
function init() {
  updateClock();
  setInterval(updateClock, 1000);

  // Startup logic
  const startupOverlay = document.getElementById("startup-overlay") as HTMLDivElement;
  const startBtn = document.getElementById("start-btn") as HTMLButtonElement;

  if (startBtn && startupOverlay) {
    startBtn.addEventListener("click", () => {
      startupOverlay.classList.add("hidden");
      setTimeout(() => {
        startupOverlay.style.display = "none";
      }, 1000);
    });
  }

  // Event Listeners
  loginBtn.addEventListener("click", handleLogin);
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  // Dock animations
  dockItems.forEach((item) => {
    item.addEventListener("click", () => {
      animateIcon(item as HTMLElement);
    });
  });
}

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // Format date: "Lun 4 Dec"
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    const dateString = now.toLocaleDateString('fr-FR', options);

    if (clockElement) {
        clockElement.textContent = `${dateString} ${hours}:${minutes}`;
    }
}

function handleLogin() {
  const password = passwordInput.value;
  if (password.length > 0) {
    // Simulate login
    state.isLoggedIn = true;
    overlay.classList.remove("active");
    // Clear input
    passwordInput.value = "";

    // Play a sound or show a notification could go here
    console.log("Logged in as admin");
  } else {
    // Shake animation for error
    const popup = document.querySelector("#login-overlay .standard-popup") as HTMLElement;
    if (popup) {
        popup.style.animation = "none";
        popup.offsetHeight; /* trigger reflow */
        popup.style.animation = "shake 0.5s";
    }
  }
}

function animateIcon(element: HTMLElement) {
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
const shutdownModule = document.getElementById("shutdown-module") as HTMLDivElement;
const shutdownOverlay = document.getElementById("shutdown-overlay") as HTMLDivElement;
const cancelShutdownBtn = document.getElementById("cancel-shutdown-btn") as HTMLButtonElement;
const confirmShutdownBtn = document.getElementById("confirm-shutdown-btn") as HTMLButtonElement;
const closeShutdownBtn = document.getElementById("close-shutdown-btn") as HTMLButtonElement;

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
      // Simulate shutdown
      const startupOverlay = document.getElementById("startup-overlay") as HTMLDivElement;

      // Hide shutdown popup
      shutdownOverlay.classList.remove("active");

      // Reset state
      state.isLoggedIn = false;
      passwordInput.value = "";
      overlay.classList.remove("active");

      // Show startup overlay
      if (startupOverlay) {
        startupOverlay.style.display = ""; // Clear display: none
        // Force reflow
        startupOverlay.offsetHeight;
        startupOverlay.classList.remove("hidden");
      }
    });
  }

// Carousel Logic
const recyclingModule = document.getElementById("recyclage-module") as HTMLDivElement;
const recyclingOverlay = document.getElementById("recycling-overlay") as HTMLDivElement;
const closeRecyclingBtn = document.getElementById("close-recycling-btn") as HTMLButtonElement;

// Carousel Elements
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");
const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;
const skipBtn = document.getElementById("skip-btn") as HTMLButtonElement;
let currentSlide = 0;

function showSlide(index: number) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add("active");
        } else {
            slide.classList.remove("active");
        }
    });

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });

    if (index === slides.length - 1) {
        nextBtn.textContent = "Get Started";
    } else {
        nextBtn.textContent = "Next";
    }
}

function nextSlide() {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
    } else {
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
const settingsDockItem = document.getElementById("settings-dock-item") as HTMLDivElement;
const settingsOverlay = document.getElementById("settings-overlay") as HTMLDivElement;
const closeSettingsBtn = document.getElementById("close-settings-btn") as HTMLButtonElement;
const wallpaperItems = document.querySelectorAll(".wallpaper-item");
const resetWallpaperBtn = document.getElementById("reset-wallpaper-btn") as HTMLButtonElement;

// Wallpaper Data (using Unsplash URLs as fallback)
const wallpapers: { [key: string]: string } = {
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
if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", () => {
        settingsOverlay.classList.remove("active");
    });
}

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
        if (defaultItem) defaultItem.classList.add("active");
    });
}
