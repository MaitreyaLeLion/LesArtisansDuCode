const wallpapers = {
    default: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564",
    france: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073",
    it:"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070",
    universe:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
    nature:"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074"
};

// Gestion des onglets
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.settings-section').forEach(s => s.style.display = 'none');

        item.classList.add('active');
        const tab = item.getAttribute('data-tab');
        document.getElementById(`settings-section-${tab}`).style.display = 'block';
    });
});

// Changement de Wallpaper (Affecte le parent)
document.querySelectorAll('.wallpaper-item').forEach(item => {
    item.addEventListener('click', () => {
        const key = item.getAttribute('data-wallpaper');
        if(wallpapers[key]) {
            // C'est ici que la magie opère : on cible le body du parent (index.html)
            window.parent.document.body.style.backgroundImage = `url('${wallpapers[key]}')`;
        }
    });
});

document.getElementById('reset-wallpaper-btn').addEventListener('click', () => {
    window.parent.document.body.style.backgroundImage = `url('${wallpapers.default}')`;
});

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