const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");
const nextBtn = document.getElementById("next-btn");
const skipBtn = document.getElementById("skip-btn");
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });

    if (nextBtn) {
        nextBtn.textContent = index === slides.length - 1 ? "Commencer" : "Suivant";
    }
}

nextBtn.addEventListener("click", () => {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
    } else {
        // On the last slide, "Commencer" is clicked.
        // In a real app, this might close the window or go to another state.
        // For now, we can just loop back.
        currentSlide = 0; // Loop back to the start
        showSlide(currentSlide);
    }
});

if (skipBtn) {
    skipBtn.addEventListener("click", () => {
        // This would typically close the window.
        // Since the iframe cannot close itself, we'll just log it.
        console.log("Skip button clicked. In a real app, this would close the window.");
        // Or, we could jump to the end state.
        currentSlide = slides.length - 1;
        showSlide(currentSlide);
    });
}

dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        currentSlide = index;
        showSlide(currentSlide);
    });
});