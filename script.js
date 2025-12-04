// script.js

const state = {
    isLoggedIn: false,
    batteryLevel: 85
};

// DOM Elements
const overlay = document.getElementById('login-overlay');
const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('password-input');
const clockElement = document.getElementById('clock');
const batteryElement = document.getElementById('battery-level');
const dockItems = document.querySelectorAll('.dock-item');

// Initialize
function init() {
    updateClock();
    setInterval(updateClock, 1000);
    
    // Startup logic
    const startupOverlay = document.getElementById('startup-overlay');
    const startBtn = document.getElementById('start-btn');

    if (startBtn && startupOverlay) {
        startBtn.addEventListener('click', () => {
            startupOverlay.classList.add('hidden');
            setTimeout(() => {
                startupOverlay.style.display = 'none';
            }, 1000);
        });
    }

    // Event Listeners
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    // Dock animations
    dockItems.forEach(item => {
        item.addEventListener('click', () => {
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
    const password = passwordInput.value;
    if (password.length > 0) {
        // Simulate login
        state.isLoggedIn = true;
        overlay.classList.remove('active');
        // Clear input
        passwordInput.value = '';
        
        console.log("Logged in as admin");
    } else {
        // Shake animation for error
        const popup = document.querySelector('#login-overlay .standard-popup');
        if (popup) {
            popup.style.animation = 'none';
            popup.offsetHeight; /* trigger reflow */
            popup.style.animation = 'shake 0.5s';
        }
    }
}

function animateIcon(element) {
    element.style.transform = 'scale(0.8)';
    setTimeout(() => {
        element.style.transform = '';
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
document.addEventListener('DOMContentLoaded', init);

// Shutdown Logic
const shutdownModule = document.getElementById('shutdown-module');
const shutdownOverlay = document.getElementById('shutdown-overlay');
const cancelShutdownBtn = document.getElementById('cancel-shutdown-btn');
const confirmShutdownBtn = document.getElementById('confirm-shutdown-btn');
const closeShutdownBtn = document.getElementById('close-shutdown-btn');

if (shutdownModule) {
    shutdownModule.addEventListener('click', () => {
        if (shutdownOverlay) shutdownOverlay.classList.add('active');
    });
}

if (cancelShutdownBtn) {
    cancelShutdownBtn.addEventListener('click', () => {
        if (shutdownOverlay) shutdownOverlay.classList.remove('active');
    });
}

if (closeShutdownBtn) {
    closeShutdownBtn.addEventListener('click', () => {
        if (shutdownOverlay) shutdownOverlay.classList.remove('active');
    });
}

if (confirmShutdownBtn) {
    confirmShutdownBtn.addEventListener('click', () => {
        // Simulate shutdown - return to startup screen
        const startupOverlay = document.getElementById('startup-overlay');
        
        // Hide shutdown popup
        if (shutdownOverlay) shutdownOverlay.classList.remove('active');
        
        // Reset state
        state.isLoggedIn = false;
        if (passwordInput) passwordInput.value = '';
        if (overlay) overlay.classList.remove('active');

        // Show startup overlay
        if (startupOverlay) {
            startupOverlay.style.display = ''; // Clear display: none
            // Force reflow
            startupOverlay.offsetHeight;
            startupOverlay.classList.remove('hidden');
        }
    });
}

// Carousel Logic
const recyclingModule = document.getElementById('recyclage-module');
const recyclingOverlay = document.getElementById('recycling-overlay');
const closeRecyclingBtn = document.getElementById('close-recycling-btn');

// Carousel Elements
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
const nextBtn = document.getElementById('next-btn');
const skipBtn = document.getElementById('skip-btn');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    if (nextBtn) {
        if (index === slides.length - 1) {
            nextBtn.textContent = 'Get Started';
        } else {
            nextBtn.textContent = 'Next';
        }
    }
}

function nextSlide() {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
    } else {
        // Close popup on last slide
        if (recyclingOverlay) recyclingOverlay.classList.remove('active');
        // Reset to first slide for next time
        setTimeout(() => {
            currentSlide = 0;
            showSlide(0);
        }, 500);
    }
}

if (recyclingModule) {
    recyclingModule.addEventListener('click', () => {
        if (recyclingOverlay) recyclingOverlay.classList.add('active');
        currentSlide = 0;
        showSlide(0);
    });
}

if (closeRecyclingBtn) {
    closeRecyclingBtn.addEventListener('click', () => {
        if (recyclingOverlay) recyclingOverlay.classList.remove('active');
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', nextSlide);
}

if (skipBtn) {
    skipBtn.addEventListener('click', () => {
        if (recyclingOverlay) recyclingOverlay.classList.remove('active');
    });
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
    });
});

// Close recycling popup when clicking outside
if (recyclingOverlay) {
    recyclingOverlay.addEventListener('click', (e) => {
        if (e.target === recyclingOverlay) {
            recyclingOverlay.classList.remove('active');
        }
    });
}

