const intro = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");
const musicLabel = document.getElementById("musicLabel");
const restartBtn = document.getElementById("restartBtn");

document.body.classList.add("locked");

function updateMusicUI() {
  const paused = music.paused;
  musicBtn.classList.toggle("paused", paused);
  musicLabel.textContent = paused ? "Tocar" : "Música";
}

async function startExperience() {
  intro.classList.add("hidden");
  document.body.classList.remove("locked");

  try {
    await music.play();
  } catch (error) {
    // If the audio file is missing or the browser blocks playback,
    // the page still works normally.
    console.warn("Não foi possível iniciar a música:", error);
  }

  updateMusicUI();
}

startBtn.addEventListener("click", startExperience);

musicBtn.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
    } catch (error) {
      console.warn("Não foi possível tocar a música:", error);
    }
  } else {
    music.pause();
  }
  updateMusicUI();
});

restartBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  music.currentTime = 0;
  music.play().catch(() => {});
  updateMusicUI();
});

const sections = document.querySelectorAll(".section");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.12 });

sections.forEach(section => {
  section.classList.add("reveal");
  observer.observe(section);
});
